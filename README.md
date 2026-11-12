# PromisePay

> **Make a promise. Deliver the work. Get paid with confidence.**

AI-powered agreement, delivery-verification and payment platform built for **PayPal AI Hackathon 2026** (Devpost).

**Deadline**: 13 Nov 2026, 01:30 IST

---

## 🎯 What It Does

PromisePay creates a trust layer between customers and freelancers:

1. **Customer** creates a project with scope, budget, deadline
2. **AI** converts description into structured deliverables + acceptance criteria
3. **Both parties** approve the agreement
4. **Customer** authorizes payment via PayPal Sandbox (intent: AUTHORIZE)
5. **Freelancer** uploads work + evidence
6. **AI** verifies evidence against criteria → produces report (completed/missing/uncertain)
7. **Customer** reviews report → approves or requests changes
8. **Backend** captures authorized payment **only after customer approval**
9. **Dashboard** shows final project and payment status

---

## 🛠 Tech Stack

| Layer | Tools |
|-------|-------|
| **Frontend** | React + Vite, Tailwind CSS |
| **Dashboards** | AG Grid (sponsor tool) |
| **Backend** | Python, FastAPI |
| **Database** | PostgreSQL (prod) / SQLite (dev) — SQLAlchemy 2.0 |
| **AI** | Provider-agnostic: Mock / Google Gemini / OpenAI-compatible (NVIDIA NIM, local) |
| **Payments** | PayPal Sandbox, Orders API (authorize → capture) |
| **Sponsor Tools** | AG Grid, APIMatic (Postman from OpenAPI), Render, Postman |
| **Deployment** | Render (Blueprint via `render.yaml`) |

---

## 📁 Project Structure

```
promisepay/
├── README.md
├── LICENSE                  # MIT
├── .env.example
├── .gitignore
├── render.yaml              # Render Blueprint
├── docs/
│   ├── API_CONTRACT.md      # Endpoints + example JSON
│   ├── STATUS_FLOW.md       # Project status machine
│   ├── DEMO_SCRIPT.md       # Step-by-step demo for video
│   ├── DEPLOY_STEPS.md      # Render deployment guide
│   └── PROGRESS.md          # Phase tracker
├── frontend/
│   └── src/
│       ├── pages/           # Landing, Login, Register, CreateAgreement, AgreementReview, SubmitWork, VerificationReport
│       ├── dashboard/       # AG Grid tables
│       ├── components/      # Shared UI
│       ├── api/             # API client
│       ├── mock/            # Sample data
│       └── hooks/
├── backend/
│   ├── requirements.txt
│   ├── openapi.json         # Generated OpenAPI spec
│   ├── openapi_to_postman.py # Postman converter
│   ├── alembic/             # Migrations (future)
│   ├── tests/
│   │   ├── test_flow.py     # 24 integration tests
│   │   └── fixtures/
│   └── app/
│       ├── main.py
│       ├── core/            # config, security, env
│       ├── db/              # session, base, init_db
│       ├── models/          # users, projects, agreements, approvals, payments, submissions, reports
│       ├── schemas/         # Pydantic request/response
│       ├── routers/         # auth, projects, agreements, submissions, payments, verification, dashboard
│       └── services/
│           ├── ai/          # agreement_generator, verification, llm
│           ├── paypal/      # orders (OAuth, create, authorize, capture)
│           └── status.py    # status transition validation
├── postman/
│   ├── postman_collection.json  # 28 endpoints
│   └── promisepay-environment.json
└── uploads/                 # Local dev uploads (gitignored)
```

---

## ⚡ Quick Start

### Prerequisites
- **Python 3.11+** (3.10 works)
- **Node.js 18+**
- **Git**

### Backend Setup
```bash
cd backend

# 1. Create virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment (optional - defaults work for mock mode)
cp .env.example .env
# Edit .env if you want real AI/PayPal

# 4. Run server
uvicorn app.main:app --reload --port 8000

# Server: http://localhost:8000
# API Docs: http://localhost:8000/docs
# Health: http://localhost:8000/health
```

### Frontend Setup
```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Run dev server
npm run dev

# Frontend: http://localhost:5173
# API proxy configured to http://localhost:8000
```

### Run Tests
```bash
cd backend
python -m pytest -q
# 24 tests should pass
```

---

## 🔐 Environment Variables

Create `backend/.env` from `.env.example`:

```env
# Database (auto SQLite for dev)
DATABASE_URL=sqlite:///./promisepay.db

# JWT (CHANGE IN PRODUCTION!)
JWT_SECRET=your-strong-secret-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# AI Provider (mock | gemini | openai_compatible)
LLM_PROVIDER=mock
LLM_API_KEY=
LLM_MODEL=gemini-1.5-flash
LLM_BASE_URL=          # For openai_compatible (e.g., NVIDIA NIM)

# PayPal (SANDBOX ONLY for hackathon)
PAYPAL_MODE=mock       # mock | sandbox
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Uploads
UPLOAD_DIR=uploads
```

> **Demo Mode**: With defaults (`LLM_PROVIDER=mock`, `PAYPAL_MODE=mock`), everything works offline — no API keys needed.

---

## 🧪 Demo Accounts (Auto-Seeded)

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@demo.com` | `demo1234` |
| Freelancer | `freelancer@demo.com` | `demo1234` |

---

## 📋 Status Flow

```
DRAFT
  → PENDING_APPROVAL
      → AGREED
          → PAYMENT_AUTHORIZED
              → IN_PROGRESS
                  → SUBMITTED
                      → UNDER_REVIEW
                          → CHANGES_REQUESTED ↔ SUBMITTED
                          → APPROVED
                              → PAID

Side states: CANCELLED, PAYMENT_FAILED
```

**Key Rules**:
- Payment **capture only after APPROVED** (customer decision)
- AI is **decision support only** — never auto-approves payment
- All PayPal transactions are **Sandbox/test** — not real money

See `docs/STATUS_FLOW.md` for full transition matrix.

---

## 🔗 API Endpoints (Summary)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/register` | Register user |
| POST | `/auth/login` | Login → JWT |
| POST | `/projects` | Create project (customer) |
| GET | `/projects` | List my projects |
| POST | `/projects/{id}/assign-freelancer` | Assign freelancer |
| POST | `/projects/{id}/agreement/generate` | AI generates agreement |
| POST | `/projects/{id}/submit-for-approval` | Customer submits for approval |
| POST | `/projects/{id}/agreement/approve` | Approve agreement (both parties) |
| POST | `/projects/{id}/payment/create-order` | PayPal order (AUTHORIZE) |
| POST | `/projects/{id}/payment/authorize` | Authorize payment |
| POST | `/projects/{id}/submissions` | Freelancer submits work |
| POST | `/projects/{id}/verify` | AI verification report |
| POST | `/projects/{id}/review` | Customer: approve/request_changes |
| POST | `/projects/{id}/payment/capture` | Capture (requires APPROVED) |
| POST | `/projects/{id}/payment/cancel` | Cancel project |

Full contract: `docs/API_CONTRACT.md`

Postman: `postman/postman_collection.json` + `postman/promisepay-environment.json`

---

## 🤖 AI Features

### Agreement Generator
- Input: project description, budget, deadline
- Output: title, summary, deliverables[], acceptance_criteria[], amount, deadline, assumptions[]
- Provider-agnostic: mock / Gemini / OpenAI-compatible

### Verification Engine
- Input: acceptance criteria + submission (notes + file)
- Output: per-criterion verdict (completed/missing/uncertain) + evidence + reasoning
- **Strict rules**: "completed" only with direct evidence; limitations always disclosed

### Neutral Summary
- Mediates disagreements objectively
- No blame language, constructive next steps

### UI Honesty
- Every AI response includes `ai_mode`: `"mock" | "gemini" | "openai_compatible"`

---

## 💳 PayPal Integration

- **Orders API** with `intent: AUTHORIZE`
- Flow: Create Order → Buyer Approves → Authorize → (Work) → Capture
- **Idempotency**: `PayPal-Request-Id` on create; duplicate capture returns stored capture
- **Security**: OAuth token cached (1hr), row-lock on capture, unique `capture_id` constraint
- **Sandbox only** — all transactions are test transactions

---

## 🚀 Deployment (Render)

### One-Click Blueprint
1. Push repo to GitHub (with `render.yaml`)
2. Render Dashboard → **New → Blueprint**
3. Connect repo → Apply
4. Set environment variables in Render Dashboard:
   - `JWT_SECRET` (generate: `openssl rand -hex 32`)
   - `FRONTEND_URL` (your frontend URL)
   - `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET` (from PayPal Developer)
   - Optional: `LLM_PROVIDER`, `LLM_API_KEY` for real AI
5. Deploy!

See `docs/DEPLOY_STEPS.md` for complete guide.

---

## 📦 Submission Assets (Hackathon)

| Asset | Location |
|-------|----------|
| Public GitHub Repo | This repo (MIT license) |
| Demo Video (<3 min) | Record per `docs/DEMO_SCRIPT.md` |
| Text Description | This README + `docs/DEMO_SCRIPT.md` |
| AI Tools Used | Listed in `docs/SUBMISSION_CHECKLIST.md` |
| Postman Collection | `postman/postman_collection.json` |

---

## 📄 License

MIT License — see `LICENSE` file.

---

## 👥 Team

| Member | Role |
|--------|------|
| 1 | Frontend & UI/UX |
| 2 | Dashboard & AG Grid |
| 3 | Backend & Database |
| 4 | AI Integration |
| 5 | PayPal, APIMatic, Deployment |

---

## ⚠️ Important Notes

- **Not a regulated escrow service** — educational hackathon project
- **PayPal Sandbox only** — no real money moves
- **AI is advisory** — customer approval required for payment capture
- **No secrets in frontend or Git** — all keys in backend env vars only