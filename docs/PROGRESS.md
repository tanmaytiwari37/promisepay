# PromisePay Progress Tracker

**Hackathon:** PayPal AI Hackathon 2026  
**Deadline:** 13 Nov 2026, 01:30 IST  
**Environment:** Windows, PowerShell, FastAPI + SQLAlchemy + SQLite (dev)

---

## Phase 0: ORIENT (COMPLETE)

### Git Status
- Working tree: **clean**
- Current branch: `frontend-redesign-v2`
- Local main: `8e972f7` (same as origin/main)
- No remote commits on origin/main not in local main
- Teammates may push to origin/main at any time

### Test Status
- **1 test passed** (full demo flow test)
- 28 warnings (Pydantic v2 deprecation, datetime.utcnow)

### Backend State
- JWT auth/roles implemented
- Projects, agreements, approvals, submissions, uploads working
- AI services (mock + gemini ready)
- PayPal service (mock mode)
- End-to-end pytest passes on isolated test DB

### Next Steps
1. **Phase 1:** Backend hardening - strengthen duplicate capture test, add more test cases, security review
2. **Phase 2:** AI services real mode - provider-agnostic LLM client, NVIDIA NIM support
3. **Phase 3:** PayPal sandbox - OAuth, create/authorize/capture with httpx MockTransport tests
4. **Phase 4:** Postman collection from OpenAPI
4. **Phase 5:** Deployment prep (render.yaml, docs)
5. **Phase 6:** Docs and submission materials
6. **Phase 7:** Final QA

---

## Phase 1: BACKEND HARDENING (COMPLETE)

### Changes Made
- **Duplicate capture test strengthened**: Added mock patch to verify `capture_authorization` is NOT called on duplicate capture (idempotent)
- **Capture endpoint race condition guard**: Added `with_for_update()` row lock + unique constraint on `capture_id`
- **New tests added** (8 new tests):
  - `test_create_order_not_agreed` → 409
  - `test_authorize_wrong_user_forbidden` → 403
  - `test_cancel_flow` → CANCELLED
  - `test_failed_payment_status` → validates PAYMENT_FAILED transitions
  - `test_request_changes_then_resubmit` → SUBMITTED again
  - `test_upload_disallowed_type` → 400
  - `test_upload_oversize_file` → 400
  - `test_filename_path_traversal_sanitized` → sanitized filename
- **Security fixes**:
  - JWT_SECRET warning in non-test mode
  - CORS restricted to FRONTEND_URL only, limited methods/headers
  - File path traversal prevention with `validate_file_path()`
  - Filename sanitization hardened (null bytes, hidden files, length limit)
- **DB**: Unique constraint on `Payment.capture_id` + `(project_id, status)`

### Test Results
- **9 tests passed** (1 original + 8 new)
- All security checks pass

### Blockers
- None

### Decisions
- Used `with_for_update()` for row-level locking in capture endpoint
- Added unique constraint on `capture_id` for DB-level idempotency
- Path traversal sanitization via `validate_file_path()` using pathlib resolve()

---

## Phase 2: AI SERVICES REAL MODE (PENDING)

## Phase 3: PAYPAL SANDBOX (PENDING)

## Phase 4: POSTMAN (PENDING)

## Phase 5: DEPLOYMENT PREP (PENDING)

## Phase 6: DOCS AND SUBMISSION (PENDING)

## Phase 7: FINAL QA (PENDING)