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

## Phase 2: AI SERVICES REAL MODE (COMPLETE)

### Changes Made
- **Provider-agnostic LLM client** (`backend/app/services/ai/llm.py`):
  - Supports `mock`, `gemini`, `openai_compatible` (NVIDIA NIM, local models)
  - Added `LLM_BASE_URL` config for openai_compatible providers
  - One retry with exponential backoff
  - JSON mode enforcement with `response_format: {"type": "json_object"}`
  - Code fence stripping for raw LLM outputs
  - Returns `ai_mode` in all responses for UI honesty
- **Agreement Generator** (`backend/app/services/ai/agreement_generator.py`):
  - Includes `ai_mode` in mock fallback and real responses
- **Verification Service** (`backend/app/services/ai/verification.py`):
  - Enhanced prompt with strict verification rules (completed/missing/uncertain)
  - Evidence must be direct quotes or explicit file references
  - Conservative: prefers "uncertain" over "completed" without proof
  - Includes limitations: cannot execute code, verify external APIs, access credentials
  - Customer approval remains required for payment capture
  - Includes `ai_mode` in all responses
- **Schemas** (`backend/app/schemas/ai.py`):
  - Added `ai_mode` field to `GeneratedAgreement` and `VerificationResult`
- **Config** (`backend/app/core/config.py`):
  - Added `LLM_BASE_URL` for openai_compatible providers (e.g., NVIDIA NIM)
- **Tests** (5 new tests):
  - `test_ai_agreement_generation_mock_mode` → includes ai_mode
  - `test_ai_verification_mock_mode` → includes ai_mode
  - `test_ai_neutral_summary_mock_mode` → verifies neutrality (no blame language)
  - `test_llm_openai_compatible_fake_transport` → mocked httpx transport test
  - `test_llm_provider_unknown_raises` → validates error handling
  - `test_ai_verification_rules_in_prompt` → source code inspection for rules
- **Fixtures**: `backend/tests/fixtures/sample_projects.json` (3 realistic project descriptions for manual AI quality checks)

### Test Results
- **15 tests passed** (9 Phase 1 + 6 Phase 2)

### Blockers
- None

### Decisions
- Provider-agnostic design: single `call_llm_json()` entry point, delegates to provider-specific functions
- Mock mode returns `None` from LLM layer, services provide canned fallbacks with `ai_mode: "mock"`
- NVIDIA NIM / local models use `openai_compatible` with custom `LLM_BASE_URL`
- Verification prompt enforces: direct evidence required for "completed", limitations always disclosed

---

## Phase 3: PAYPAL SANDBOX (COMPLETE)

### Changes Made
- **OAuth Token Caching** (`backend/app/services/paypal/orders.py`):
  - Token cached with expiry tracking (`expires_at` with 60s buffer)
  - Reused automatically within validity window
- **Full PayPal Orders API** (sandbox + mock modes):
  - `create_order()` - intent AUTHORIZE, idempotency key support
  - `authorize_order()` - captures authorization ID from purchase units
  - `capture_authorization()` - captures authorized payment
- **Integration with Payments Router** (`backend/app/routers/payments.py`):
  - Create order only from AGREED status (customer only)
  - Authorize only by customer, auto-transitions to IN_PROGRESS
  - Capture requires APPROVED status, row-level lock, idempotent
- **Tests** (9 new tests):
  - `test_paypal_create_order_mock_mode` - mock order creation
  - `test_paypal_authorize_mock_mode` - mock authorization
  - `test_paypal_capture_mock_mode_requires_approved` - 409 before APPROVED
  - `test_paypal_capture_mock_mode_after_approved` - works after APPROVED
  - `test_paypal_capture_idempotent_mock` - duplicate returns same capture_id
  - `test_paypal_oauth_token_caching` - mocked token cached and reused
  - `test_paypal_create_order_sandbox_mocked` - full sandbox order flow
  - `test_paypal_authorize_order_sandbox_mocked` - sandbox authorization
  - `test_paypal_capture_authorization_sandbox_mocked` - sandbox capture
- All tests use `httpx` MockTransport via `unittest.mock.AsyncMock` (no real network calls)

### Test Results
- **24 tests passed** (15 Phase 1+2 + 9 Phase 3)

### Blockers
- None

### Decisions
- Mock mode uses MOCK-* prefixes for order/auth/capture IDs
- Sandbox mode requires PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET, PAYPAL_BASE_URL
- Token caching at module level with dict (simple, effective for single-process)
- Capture idempotency: DB check + row lock before PayPal call
- Status machine enforced: AGREED → PAYMENT_AUTHORIZED → IN_PROGRESS → ... → APPROVED → PAID

---

## Phase 4: POSTMAN (COMPLETE)

### Changes Made
- **OpenAPI to Postman Converter** (`backend/openapi_to_postman.py`):
  - Parses FastAPI OpenAPI schema (`openapi.json`)
  - Generates Postman Collection v2.1 format
  - Groups endpoints by tags (Auth, Projects, Agreements, Submissions, Verification, Payments, Dashboard)
  - Handles path parameters, query parameters, request bodies (JSON + multipart/form-data)
  - Includes bearer token auth with `{{access_token}}` variable
  - Includes `base_url` variable for environment switching
- **Postman Collection** (`postman/postman_collection.json`):
  - 28 endpoints across 8 folders
  - Ready-to-use examples for all request bodies
  - Response codes documented in descriptions
- **Postman Environment** (`postman/promisepay-environment.json`):
  - Variables for base_url, access_token, customer_email, freelancer_email, project_id

### Test Results
- Collection validates against Postman schema
- All 28 endpoints mapped correctly

### Blockers
- None

### Decisions
- Custom converter instead of `openapi-to-postman` CLI for zero dependencies
- Collection uses collection-level bearer auth with environment variable
- Multipart endpoints (file upload) use formdata mode with file placeholder
- Path parameters converted to Postman variables (`:project_id`)

---

## Phase 5: DEPLOYMENT PREP (COMPLETE)

### Changes Made
- **render.yaml** (updated):
  - Added PostgreSQL database (`promisepay-db`, Free tier)
  - Complete environment variables for backend (DATABASE_URL, JWT_SECRET, LLM, PayPal, FRONTEND_URL)
  - Frontend static site with VITE_API_URL
  - Upload directory configured for Render Disk
- **DEPLOY_STEPS.md** (`docs/DEPLOY_STEPS.md`):
  - Blueprint deploy instructions
  - Manual service creation steps
  - All required environment variables table
  - PayPal Sandbox setup guide
  - Database migrations (Alembic) guidance
  - File uploads on Render (ephemeral fs → Render Disk)
  - Health checks, custom domains
  - Verification checklist
  - Troubleshooting table
  - Cost estimate (Free tier: $0/month)
  - Production security checklist

### Blockers
- None

### Decisions
- Used Render Blueprint (`render.yaml`) for declarative infra
- PostgreSQL Free tier for hackathon (90 days)
- `create_all()` for schema init (Alembic recommended for production)
- Uploads to Render Disk (ephemeral fs workaround)
- All PayPal calls explicitly labeled Sandbox/test

---

## Phase 6: DOCS AND SUBMISSION (COMPLETE)

### Changes Made
- **README.md** (complete rewrite):
  - Project overview, tech stack, folder structure
  - Quick start (backend + frontend + tests)
  - Environment variables table
  - Demo accounts
  - Status flow summary
  - API endpoints summary
  - AI features explanation
  - PayPal integration details
  - Deployment instructions
  - License, team, compliance notes
- **API_CONTRACT.md** (existing, comprehensive):
  - 7 sections: System/Health, Auth, Projects/Agreements, AI Services, Submissions, Customer Review/Payments, Dashboard
  - All 28 endpoints with auth requirements, request/response examples
- **STATUS_FLOW.md** (existing):
  - Visual state machine diagram
  - Transition rules
- **DEMO_SCRIPT.md** (new):
  - 3-minute video timeline (9 segments)
  - Full narration script
  - Recording tips, demo data, pre-recording checklist
- **DEPLOY_STEPS.md** (new, from Phase 5):
  - Complete Render Blueprint deployment guide
- **SUBMISSION_CHECKLIST.md** (new):
  - Devpost requirements mapping
  - AI tools used table
  - PayPal integration details
  - Architecture highlights
  - Compliance checks
  - Submission links template
- **FRONTEND_INTEGRATION_NOTES.md** (new):
  - Complete API reference for frontend team
  - Types, flows, error handling, UI guidelines
  - AI mode badge, PayPal Sandbox label requirements

### Blockers
- None

### Decisions
- All docs in `docs/` folder for easy judge access
- Demo script timed for exactly 3 minutes
- Submission checklist maps 1:1 to Devpost requirements
- Frontend notes assume new Google AI Studio export (don't edit existing)

---

## Phase 7: FINAL QA (COMPLETE)

### Checks Performed
- **Full pytest suite**: 26 tests passed (no regressions)
- **Smoke test**: Complete end-to-end flow verified (register → project → agreement → AI generate → dual approve → PayPal order → authorize → submit → verify → review approve → capture → PAID)
- **Secret scan**: No hardcoded secrets found
  - All API keys loaded from environment variables via `settings`
  - `.env` gitignored, `.env.example` has placeholders only
  - Demo passwords only in `init_db.py` (test data)
- **License**: MIT license in `LICENSE` file
- **Git hygiene**: `.gitignore` covers venv, .env, uploads, cache, build artifacts
- **PayPal labeling**: All PayPal responses include `mode: "mock" | "sandbox"`; no "escrow" claims
- **AI honesty**: Every AI response includes `ai_mode` field
- **CORS**: Restricted to `FRONTEND_URL` only
- **File upload security**: Path traversal prevention, sanitization, type/size limits

### Test Results
- **26 tests passed** (all phases combined)
- **0 failures, 0 errors**
- Coverage: Auth (email/password + Google/Firebase), Projects, Agreements, AI, PayPal, Submissions, Verification, Review, Capture, Idempotency, Security

### Blockers
- None

### Ready for Submission
✅ All 7 phases complete
✅ Working demo (local + Render-ready)
✅ Public repo with MIT license
✅ Demo video script ready
✅ Postman collection generated
✅ Deployment configured
✅ All hard rules followed

---

## 🎉 ALL PHASES COMPLETE - READY FOR HACKATHON SUBMISSION

---

## Bonus: Firebase Google Login (Part 3 Implemented)

### Changes Made
- **Dependencies** (`backend/requirements.txt`):
  - Added `google-auth>=2.29.0` and `requests>=2.31.0`
- **Config** (`.env.example`, `backend/app/core/config.py`):
  - Added `FIREBASE_PROJECT_ID` environment variable
- **Schemas** (`backend/app/schemas/auth.py`):
  - Added `GoogleLogin` model with `id_token` and `role` fields
- **Service** (`backend/app/services/firebase_auth.py` - new):
  - `verify_firebase_token()` using google-auth library
  - Verifies Firebase ID token signature, audience, and issuer
  - No service-account secret needed (uses Google's public keys)
- **Router** (`backend/app/routers/auth.py`):
  - Added `POST /auth/google` endpoint
  - Verifies Firebase token, finds/creates user, returns JWT
  - Role used only on first account creation
- **API Contract** (`docs/API_CONTRACT.md`):
  - Documented new `/auth/google` endpoint
- **Tests** (`backend/tests/test_flow.py`):
  - `test_google_login_creates_user_and_returns_jwt` - full flow with mocked Firebase
  - `test_google_login_requires_verified_email` - rejects unverified emails
- **Test Results**: 26 tests passed (24 original + 2 new)

### How It Works
1. Frontend gets Firebase ID token from Google popup
2. Sends to `POST /auth/google` with `id_token` and `role`
3. Backend verifies token against Firebase project ID
4. Finds or creates user (with random unguessable password for Google users)
5. Returns standard JWT for all other endpoints
6. Role dropdown on frontend lets user choose customer/freelancer on first login

### Decisions
- Uses `google-auth` library (official Google library) - no service account needed
- Verifies `email_claimed` and `audience` match our Firebase project ID
- Google users get random passwords - they can only sign in via Google
- Role is only used on first account creation; subsequent logins preserve original role
- Frontend integration (Part 4) still needed: connect Google popup to `/auth/google` endpoint