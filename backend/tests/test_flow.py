import uuid
import pytest
from unittest.mock import AsyncMock, patch
from starlette.testclient import TestClient


def test_full_promisepay_demo_flow(client):
    # 1. Register new customer and freelancer (UUID emails to avoid collisions on rerun)
    _uid = uuid.uuid4().hex[:8]
    customer_email = f"customer_{_uid}@example.com"
    freelancer_email = f"freelancer_{_uid}@example.com"

    reg_c = client.post("/auth/register", json={
        "email": customer_email,
        "password": "password123",
        "name": "Flow Customer",
        "role": "customer"
    })
    assert reg_c.status_code == 201

    reg_f = client.post("/auth/register", json={
        "email": freelancer_email,
        "password": "password123",
        "name": "Flow Freelancer",
        "role": "freelancer"
    })
    assert reg_f.status_code == 201

    # Login both
    c_login = client.post("/auth/login", json={"email": customer_email, "password": "password123"})
    assert c_login.status_code == 200
    c_token = c_login.json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    f_login = client.post("/auth/login", json={"email": freelancer_email, "password": "password123"})
    assert f_login.status_code == 200
    f_token = f_login.json()["access_token"]
    f_headers = {"Authorization": f"Bearer {f_token}"}

    # 2. Customer creates project
    p_res = client.post("/projects", json={
        "title": "E-Commerce Rebuild",
        "description": "Full stack checkout and delivery",
        "budget": 1500.0,
        "deadline": "2026-12-31"
    }, headers=c_headers)
    assert p_res.status_code == 201
    pid = p_res.json()["id"]
    assert p_res.json()["status"] == "DRAFT"

    # 3. Assign freelancer
    assign_res = client.post(f"/projects/{pid}/assign-freelancer", json={
        "email": freelancer_email
    }, headers=c_headers)
    assert assign_res.status_code == 200
    assert assign_res.json()["freelancer_id"] is not None

    # 4. Generate AI agreement
    gen_res = client.post(f"/projects/{pid}/agreement/generate", headers=c_headers)
    assert gen_res.status_code == 200
    assert len(gen_res.json()["deliverables"]) > 0
    assert len(gen_res.json()["acceptance_criteria"]) > 0

    # 5. Submit for approval & both approve
    sub_appr = client.post(f"/projects/{pid}/submit-for-approval", headers=c_headers)
    assert sub_appr.status_code == 200
    assert sub_appr.json()["status"] == "PENDING_APPROVAL"

    appr1 = client.post(f"/projects/{pid}/agreement/approve", headers=c_headers)
    assert appr1.status_code == 200
    assert appr1.json()["both_approved"] is False

    appr2 = client.post(f"/projects/{pid}/agreement/approve", headers=f_headers)
    assert appr2.status_code == 200
    assert appr2.json()["both_approved"] is True
    assert appr2.json()["status"] == "AGREED"

    # 6. Create order & authorize payment
    ord_res = client.post(f"/projects/{pid}/payment/create-order", headers=c_headers)
    assert ord_res.status_code == 200
    assert "order_id" in ord_res.json()

    auth_res = client.post(f"/projects/{pid}/payment/authorize", headers=c_headers)
    assert auth_res.status_code == 200
    assert auth_res.json()["project_status"] == "IN_PROGRESS"

    # 7. Freelancer submits work
    files = {"file": ("code_deliverable.txt", b"Payment webhook implementation complete", "text/plain")}
    sub_work = client.post(
        f"/projects/{pid}/submissions",
        data={"notes": "All criteria met with test suite"},
        files=files,
        headers=f_headers
    )
    assert sub_work.status_code == 201
    assert sub_work.json()["status"] == "SUBMITTED"

    # 8. AI Delivery Verification
    verify_res = client.post(f"/projects/{pid}/verify", headers=c_headers)
    assert verify_res.status_code == 200
    assert verify_res.json()["project_status"] == "UNDER_REVIEW"
    assert "criteria" in verify_res.json()["verification"]

    # 9. Verify that capturing payment before customer approval is REJECTED (409)
    premature_cap = client.post(f"/projects/{pid}/payment/capture", headers=c_headers)
    assert premature_cap.status_code == 409

    # 10. Customer reviews and approves
    rev_res = client.post(f"/projects/{pid}/review", json={
        "decision": "approve",
        "comment": "Work matches criteria perfectly"
    }, headers=c_headers)
    assert rev_res.status_code == 200
    assert rev_res.json()["status"] == "APPROVED"

    # 11. Customer captures payment -> moves to PAID
    cap_res = client.post(f"/projects/{pid}/payment/capture", headers=c_headers)
    assert cap_res.status_code == 200
    assert cap_res.json()["project_status"] == "PAID"
    assert cap_res.json()["payment_status"] == "PAID"
    first_capture_id = cap_res.json()["capture_id"]

    # 12. Duplicate capture is safe and idempotent - mock capture called only once
    with patch("app.services.paypal.orders.capture_authorization", new_callable=AsyncMock) as mock_capture:
        mock_capture.return_value = {"capture_id": first_capture_id, "status": "COMPLETED", "mode": "mock"}
        dup_cap = client.post(f"/projects/{pid}/payment/capture", headers=c_headers)
        assert dup_cap.status_code == 200
        assert dup_cap.json()["project_status"] == "PAID"
        assert dup_cap.json() == cap_res.json()
        # Verify mock was NOT called again (idempotent - returns stored capture)
        mock_capture.assert_not_called()

    # 13. Non-participant access is forbidden (403)
    outsider_login = client.post("/auth/login", json={"email": "customer@demo.com", "password": "demo1234"})
    outsider_headers = {"Authorization": f"Bearer {outsider_login.json()['access_token']}"}

    forbidden_get = client.get(f"/projects/{pid}", headers=outsider_headers)
    assert forbidden_get.status_code == 403

    forbidden_sub = client.get(f"/projects/{pid}/submissions", headers=outsider_headers)
    assert forbidden_sub.status_code == 403


# Additional test cases for Phase 1 hardening

def test_create_order_not_agreed(client):
    """create-order when project not AGREED -> 409"""
    uid = uuid.uuid4().hex[:8]
    c_email = f"c_{uid}@example.com"
    f_email = f"f_{uid}@example.com"

    client.post("/auth/register", json={"email": c_email, "password": "pw", "name": "C", "role": "customer"})
    client.post("/auth/register", json={"email": f_email, "password": "pw", "name": "F", "role": "freelancer"})

    c_token = client.post("/auth/login", json={"email": c_email, "password": "pw"}).json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    p_res = client.post("/projects", json={"title": "Test", "budget": 100}, headers=c_headers)
    pid = p_res.json()["id"]
    # Project is DRAFT, not AGREED
    res = client.post(f"/projects/{pid}/payment/create-order", headers=c_headers)
    assert res.status_code == 409
    assert "AGREED" in res.json()["detail"]


def test_authorize_wrong_user_forbidden(client):
    """authorize with wrong user (freelancer) -> 403"""
    uid = uuid.uuid4().hex[:8]
    c_email = f"c_{uid}@example.com"
    f_email = f"f_{uid}@example.com"

    client.post("/auth/register", json={"email": c_email, "password": "pw", "name": "C", "role": "customer"})
    client.post("/auth/register", json={"email": f_email, "password": "pw", "name": "F", "role": "freelancer"})

    c_token = client.post("/auth/login", json={"email": c_email, "password": "pw"}).json()["access_token"]
    f_token = client.post("/auth/login", json={"email": f_email, "password": "pw"}).json()["access_token"]
    f_headers = {"Authorization": f"Bearer {f_token}"}

    p_res = client.post("/projects", json={"title": "Test", "budget": 100}, headers={"Authorization": f"Bearer {c_token}"})
    pid = p_res.json()["id"]

    # Assign freelancer
    client.post(f"/projects/{pid}/assign-freelancer", json={"email": f_email}, headers={"Authorization": f"Bearer {c_token}"})
    # Generate agreement
    client.post(f"/projects/{pid}/agreement/generate", headers={"Authorization": f"Bearer {c_token}"})
    # Submit for approval
    client.post(f"/projects/{pid}/submit-for-approval", headers={"Authorization": f"Bearer {c_token}"})
    # Both approve
    client.post(f"/projects/{pid}/agreement/approve", headers={"Authorization": f"Bearer {c_token}"})
    client.post(f"/projects/{pid}/agreement/approve", headers=f_headers)
    # Create order
    client.post(f"/projects/{pid}/payment/create-order", headers={"Authorization": f"Bearer {c_token}"})

    # Freelancer tries to authorize -> 403
    res = client.post(f"/projects/{pid}/payment/authorize", headers=f_headers)
    assert res.status_code == 403


def test_cancel_flow(client):
    """cancel flow -> CANCELLED"""
    uid = uuid.uuid4().hex[:8]
    c_email = f"c_{uid}@example.com"
    f_email = f"f_{uid}@example.com"

    client.post("/auth/register", json={"email": c_email, "password": "pw", "name": "C", "role": "customer"})
    client.post("/auth/register", json={"email": f_email, "password": "pw", "name": "F", "role": "freelancer"})

    c_token = client.post("/auth/login", json={"email": c_email, "password": "pw"}).json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}

    p_res = client.post("/projects", json={"title": "Test", "budget": 100}, headers=c_headers)
    pid = p_res.json()["id"]

    # Cancel from DRAFT
    res = client.post(f"/projects/{pid}/payment/cancel", headers=c_headers)
    assert res.status_code == 200
    assert res.json()["status"] == "CANCELLED"


def test_failed_payment_status(client):
    """failed payment -> PAYMENT_FAILED"""
    # This tests the status transition, not an actual PayPal failure
    # We verify the status value exists and is valid
    from app.services.status import VALID_STATUSES, validate_status_transition
    assert "PAYMENT_FAILED" in VALID_STATUSES
    # APPROVED -> PAYMENT_FAILED is allowed
    validate_status_transition("APPROVED", "PAYMENT_FAILED")
    # PAYMENT_FAILED -> PAYMENT_AUTHORIZED is allowed (retry)
    validate_status_transition("PAYMENT_FAILED", "PAYMENT_AUTHORIZED")


def test_request_changes_then_resubmit(client):
    """request-changes then resubmit -> SUBMITTED again"""
    uid = uuid.uuid4().hex[:8]
    c_email = f"c_{uid}@example.com"
    f_email = f"f_{uid}@example.com"

    client.post("/auth/register", json={"email": c_email, "password": "pw", "name": "C", "role": "customer"})
    client.post("/auth/register", json={"email": f_email, "password": "pw", "name": "F", "role": "freelancer"})

    c_token = client.post("/auth/login", json={"email": c_email, "password": "pw"}).json()["access_token"]
    f_token = client.post("/auth/login", json={"email": f_email, "password": "pw"}).json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}
    f_headers = {"Authorization": f"Bearer {f_token}"}

    p_res = client.post("/projects", json={"title": "Test", "budget": 100}, headers=c_headers)
    pid = p_res.json()["id"]

    client.post(f"/projects/{pid}/assign-freelancer", json={"email": f_email}, headers=c_headers)
    client.post(f"/projects/{pid}/agreement/generate", headers=c_headers)
    client.post(f"/projects/{pid}/submit-for-approval", headers=c_headers)
    client.post(f"/projects/{pid}/agreement/approve", headers=c_headers)
    client.post(f"/projects/{pid}/agreement/approve", headers=f_headers)
    client.post(f"/projects/{pid}/payment/create-order", headers=c_headers)
    client.post(f"/projects/{pid}/payment/authorize", headers=c_headers)

    # Freelancer submits
    files = {"file": ("work.txt", b"v1", "text/plain")}
    sub1 = client.post(f"/projects/{pid}/submissions", data={"notes": "v1"}, files=files, headers=f_headers)
    assert sub1.status_code == 201
    assert sub1.json()["status"] == "SUBMITTED"

    # Customer requests changes
    rev = client.post(f"/projects/{pid}/review", json={"decision": "request_changes", "comment": "Needs fixes"}, headers=c_headers)
    assert rev.status_code == 200
    assert rev.json()["status"] == "CHANGES_REQUESTED"

    # Freelancer resubmits
    files2 = {"file": ("work_v2.txt", b"v2 fixed", "text/plain")}
    sub2 = client.post(f"/projects/{pid}/submissions", data={"notes": "v2"}, files=files2, headers=f_headers)
    assert sub2.status_code == 201
    assert sub2.json()["status"] == "SUBMITTED"


def test_upload_disallowed_type(client):
    """upload of disallowed type -> 400"""
    uid = uuid.uuid4().hex[:8]
    c_email = f"c_{uid}@example.com"
    f_email = f"f_{uid}@example.com"

    client.post("/auth/register", json={"email": c_email, "password": "pw", "name": "C", "role": "customer"})
    client.post("/auth/register", json={"email": f_email, "password": "pw", "name": "F", "role": "freelancer"})

    c_token = client.post("/auth/login", json={"email": c_email, "password": "pw"}).json()["access_token"]
    f_token = client.post("/auth/login", json={"email": f_email, "password": "pw"}).json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}
    f_headers = {"Authorization": f"Bearer {f_token}"}

    p_res = client.post("/projects", json={"title": "Test", "budget": 100}, headers=c_headers)
    pid = p_res.json()["id"]

    client.post(f"/projects/{pid}/assign-freelancer", json={"email": f_email}, headers=c_headers)
    client.post(f"/projects/{pid}/agreement/generate", headers=c_headers)
    client.post(f"/projects/{pid}/submit-for-approval", headers=c_headers)
    client.post(f"/projects/{pid}/agreement/approve", headers=c_headers)
    client.post(f"/projects/{pid}/agreement/approve", headers=f_headers)
    client.post(f"/projects/{pid}/payment/create-order", headers=c_headers)
    client.post(f"/projects/{pid}/payment/authorize", headers=c_headers)

    # Try to upload .exe (disallowed)
    files = {"file": ("malware.exe", b"MZ", "application/x-msdownload")}
    res = client.post(f"/projects/{pid}/submissions", data={"notes": "bad"}, files=files, headers=f_headers)
    assert res.status_code == 400
    assert "not allowed" in res.json()["detail"].lower()


def test_upload_oversize_file(client):
    """upload oversize file -> 400"""
    uid = uuid.uuid4().hex[:8]
    c_email = f"c_{uid}@example.com"
    f_email = f"f_{uid}@example.com"

    client.post("/auth/register", json={"email": c_email, "password": "pw", "name": "C", "role": "customer"})
    client.post("/auth/register", json={"email": f_email, "password": "pw", "name": "F", "role": "freelancer"})

    c_token = client.post("/auth/login", json={"email": c_email, "password": "pw"}).json()["access_token"]
    f_token = client.post("/auth/login", json={"email": f_email, "password": "pw"}).json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}
    f_headers = {"Authorization": f"Bearer {f_token}"}

    p_res = client.post("/projects", json={"title": "Test", "budget": 100}, headers=c_headers)
    pid = p_res.json()["id"]

    client.post(f"/projects/{pid}/assign-freelancer", json={"email": f_email}, headers=c_headers)
    client.post(f"/projects/{pid}/agreement/generate", headers=c_headers)
    client.post(f"/projects/{pid}/submit-for-approval", headers=c_headers)
    client.post(f"/projects/{pid}/agreement/approve", headers=c_headers)
    client.post(f"/projects/{pid}/agreement/approve", headers=f_headers)
    client.post(f"/projects/{pid}/payment/create-order", headers=c_headers)
    client.post(f"/projects/{pid}/payment/authorize", headers=c_headers)

    # 11 MB file (limit is 10 MB)
    large_content = b"x" * (11 * 1024 * 1024)
    files = {"file": ("large.txt", large_content, "text/plain")}
    res = client.post(f"/projects/{pid}/submissions", data={"notes": "large"}, files=files, headers=f_headers)
    assert res.status_code == 400
    assert "exceeds" in res.json()["detail"].lower()


def test_filename_path_traversal_sanitized(client):
    """filename with path traversal (../) is sanitized"""
    uid = uuid.uuid4().hex[:8]
    c_email = f"c_{uid}@example.com"
    f_email = f"f_{uid}@example.com"

    client.post("/auth/register", json={"email": c_email, "password": "pw", "name": "C", "role": "customer"})
    client.post("/auth/register", json={"email": f_email, "password": "pw", "name": "F", "role": "freelancer"})

    c_token = client.post("/auth/login", json={"email": c_email, "password": "pw"}).json()["access_token"]
    f_token = client.post("/auth/login", json={"email": f_email, "password": "pw"}).json()["access_token"]
    c_headers = {"Authorization": f"Bearer {c_token}"}
    f_headers = {"Authorization": f"Bearer {f_token}"}

    p_res = client.post("/projects", json={"title": "Test", "budget": 100}, headers=c_headers)
    pid = p_res.json()["id"]

    client.post(f"/projects/{pid}/assign-freelancer", json={"email": f_email}, headers=c_headers)
    client.post(f"/projects/{pid}/agreement/generate", headers=c_headers)
    client.post(f"/projects/{pid}/submit-for-approval", headers=c_headers)
    client.post(f"/projects/{pid}/agreement/approve", headers=c_headers)
    client.post(f"/projects/{pid}/agreement/approve", headers=f_headers)
    client.post(f"/projects/{pid}/payment/create-order", headers=c_headers)
    client.post(f"/projects/{pid}/payment/authorize", headers=c_headers)

    # Attempt path traversal in filename
    files = {"file": ("../etc/passwd.txt", b"root:x:0:0", "text/plain")}
    res = client.post(f"/projects/{pid}/submissions", data={"notes": "traversal"}, files=files, headers=f_headers)
    assert res.status_code == 201
    # The filename should be sanitized (no .. or /)
    assert ".." not in res.json()["file_name"]
    assert "/" not in res.json()["file_name"]
    assert "\\" not in res.json()["file_name"]