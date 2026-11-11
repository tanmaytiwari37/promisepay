import uuid
import pytest
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

    # 12. Duplicate capture is safe and idempotent
    dup_cap = client.post(f"/projects/{pid}/payment/capture", headers=c_headers)
    assert dup_cap.status_code == 200
    assert dup_cap.json()["project_status"] == "PAID"
    assert dup_cap.json() == cap_res.json()

    # 13. Non-participant access is forbidden (403)
    outsider_login = client.post("/auth/login", json={"email": "customer@demo.com", "password": "demo1234"})
    outsider_headers = {"Authorization": f"Bearer {outsider_login.json()['access_token']}"}

    forbidden_get = client.get(f"/projects/{pid}", headers=outsider_headers)
    assert forbidden_get.status_code == 403

    forbidden_sub = client.get(f"/projects/{pid}/submissions", headers=outsider_headers)
    assert forbidden_sub.status_code == 403

