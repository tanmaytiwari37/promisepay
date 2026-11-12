# PromisePay — Hackathon Submission Checklist

**PayPal AI Hackathon 2026** | **Deadline: 13 Nov 2026, 01:30 IST**

---

## ✅ Required Deliverables (Devpost)

| # | Requirement | Status | Location / Notes |
|---|-------------|--------|------------------|
| 1 | **Public GitHub Repo** | ✅ | This repo (MIT license in `LICENSE`) |
| 2 | **Working Demo** | ✅ | Backend + Frontend run locally; Render deploy ready |
| 3 | **Demo Video (< 3 min)** | ⬜ | Record per `docs/DEMO_SCRIPT.md`, upload to YouTube |
| 4 | **Text Description** | ✅ | `README.md` + `docs/DEMO_SCRIPT.md` |
| 5 | **AI Tools Used List** | ✅ | See below |
| 6 | **PayPal Integration** | ✅ | PayPal Orders API (Sandbox), `PAYPAL_MODE=sandbox` |
| 7 | **Meaningful AI Usage** | ✅ | Agreement generation + verification + neutral summary |

---

## 🤖 AI Tools Used

| Feature | Provider | Model | Purpose |
|---------|----------|-------|---------|
| Agreement Generation | Mock / Google Gemini / OpenAI-compatible | `gemini-1.5-flash` or custom | Convert project description → structured deliverables + acceptance criteria |
| Verification Engine | Mock / Google Gemini / OpenAI-compatible | `gemini-1.5-flash` or custom | Compare submission evidence against criteria → completed/missing/uncertain |
| Neutral Summary | Mock / Google Gemini / OpenAI-compatible | `gemini-1.5-flash` or custom | Mediate disagreements objectively without taking sides |
| **Architecture** | **Provider-agnostic** | — | Single `call_llm_json()` entry point; switch via `LLM_PROVIDER` env var |

> **Configuration**: Set `LLM_PROVIDER=mock` (default, works offline), `gemini`, or `openai_compatible` (for NVIDIA NIM, local LLMs via `LLM_BASE_URL`).

---

## 💳 PayPal Integration Details

| Aspect | Implementation |
|--------|----------------|
| **API** | PayPal Orders API v2 |
| **Intent** | `AUTHORIZE` (authorize first, capture later) |
| **Environment** | Sandbox only (`https://api-m.sandbox.paypal.com`) |
| **OAuth** | Client credentials flow with token caching (1hr TTL) |
| **Idempotency** | `PayPal-Request-Id` on create; duplicate capture returns stored capture |
| **Security** | Row-level lock (`with_for_update`), unique `capture_id` constraint |
| **Flow** | Create Order → Buyer Approves → Authorize → (Work) → **Customer Approves** → Capture |

> **Hard Rule**: Payment capture **only** after customer clicks "Approve Delivery" (project status = `APPROVED`). AI never triggers capture.

---

## 🏗 Architecture Highlights

- **Status Machine**: 10 states with validated transitions (see `docs/STATUS_FLOW.md`)
- **Role-Based Access**: Customer vs Freelancer permissions on every endpoint
- **File Security**: Path traversal prevention, sanitization, type/size limits
- **AI Honesty**: Every AI response includes `ai_mode` field
- **CORS**: Restricted to `FRONTEND_URL` only
- **JWT**: HS256 with bcrypt passwords, secret warning in production
- **Tests**: 24 integration tests (auth, projects, agreements, submissions, AI, PayPal)

---

## 📁 Key Files for Judges

| File | Purpose |
|------|---------|
| `README.md` | Full project overview, quick start, architecture |
| `docs/DEMO_SCRIPT.md` | Step-by-step 3-min video script |
| `docs/API_CONTRACT.md` | Complete REST API with example JSON |
| `docs/STATUS_FLOW.md` | State machine diagram + rules |
| `docs/DEPLOY_STEPS.md` | Render Blueprint deployment guide |
| `postman/postman_collection.json` | 28-endpoint Postman collection |
| `backend/tests/test_flow.py` | 24 integration tests |
| `render.yaml` | Render Blueprint (backend + frontend + PostgreSQL) |

---

## 🔗 Submission Links (Fill After Deploy)

| Link | URL |
|------|-----|
| GitHub Repo | `https://github.com/<your-org>/promisepay` |
| Demo Video (YouTube) | `https://youtu.be/<video-id>` |
| Live Demo (Render) | Backend: `https://promisepay-backend.onrender.com`<br>Frontend: `https://promisepay-frontend.onrender.com` |
| API Docs (Swagger) | `https://promisepay-backend.onrender.com/docs` |

---

## ⚠️ Compliance Checks

- [ ] **MIT License** present in `LICENSE`
- [ ] **No secrets in repo** — `.env` gitignored, `.env.example` has placeholders only
- [ ] **PayPal labeled as Sandbox/test** — no "escrow" claims, no live credentials
- [ ] **AI never auto-captures** — customer approval required (enforced in code)
- [ ] **AI limitations disclosed** — in verification response `limitations` array
- [ ] **`ai_mode` in all AI responses** — mock/gemini/openai_compatible
- [ ] **Frontend never calls PayPal/AI directly** — all via backend
- [ ] **CORS locked to frontend URL** — not `*`
- [ ] **Tests pass** — `cd backend && python -m pytest -q` → 24 passed

---

## 📋 Final Submission Steps

1. [ ] Push final code to GitHub (main branch)
2. [ ] Deploy to Render (Blueprint via `render.yaml`)
3. [ ] Set all environment variables in Render Dashboard
4. [ ] Verify live demo works end-to-end
5. [ ] Record demo video per `docs/DEMO_SCRIPT.md` (< 3 min)
6. [ ] Upload video to YouTube (unlisted or public)
7. [ ] Fill Devpost submission form with all links
8. [ ] Submit before **13 Nov 2026, 01:30 IST**

---

## 🏷 Tags for Devpost

`paypal` `ai` `fastapi` `react` `postgresql` `hackathon` `freelance` `payments` `verification`