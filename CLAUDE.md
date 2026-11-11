# PromisePay: Project Instructions

> Make a promise. Deliver the work. Get paid with confidence.
> Built for the **PayPal AI Hackathon 2026** (Devpost). Deadline: **13 Nov 2026, 1:30 AM IST**.

## 1. What We Are Building
PromisePay is an AI-powered agreement, delivery-verification and payment platform.
Customers and freelancers agree on clear deliverables, the freelancer submits work,
AI checks the work against the agreement, and the customer approves. Only then is the
PayPal payment captured.

Hackathon requirement: the project must **meaningfully use both PayPal and AI**, have a
**working demo**, a **public GitHub repo with an open-source license**, a text description,
a list of AI tools used, and a **demo video under 3 minutes** (public on YouTube).

## 2. Tech Stack
| Layer | Tools |
|---|---|
| Frontend | React (Vite), Tailwind CSS |
| Dashboards | AG Grid (sponsor tool) |
| Backend | Python, FastAPI |
| Database | PostgreSQL (SQLAlchemy + Alembic) |
| AI | Python + LLM API (Claude/OpenAI), server-side only |
| Payments | PayPal Sandbox, Orders API (authorize, then capture) |
| Sponsor tools | AG Grid, APIMatic Context Plugin, Render, Postman |

## 3. Folder Structure
```
promisepay/
├── CLAUDE.md
├── README.md                # setup + run instructions (judges read this!)
├── LICENSE                  # MIT
├── .env.example             # variable names only, never real secrets
├── .gitignore
├── render.yaml              # Render deployment config
├── docs/
│   ├── API_CONTRACT.md      # endpoints + example request/response JSON
│   ├── STATUS_FLOW.md       # project status names + allowed transitions
│   └── DEMO_SCRIPT.md       # step-by-step demo for video and judges
├── frontend/
│   └── src/
│       ├── pages/           # Landing, Login, Register, CreateAgreement, AgreementReview, SubmitWork, VerificationReport
│       ├── dashboard/       # AG Grid tables (Member 2)
│       ├── components/      # shared UI components
│       ├── api/             # API client functions
│       ├── mock/            # sample data until backend is ready
│       └── hooks/
├── backend/
│   ├── requirements.txt
│   ├── alembic/
│   ├── tests/
│   └── app/
│       ├── main.py
│       ├── core/            # config, security, env loading
│       ├── db/              # session, base
│       ├── models/          # users, projects, agreements, approvals, payments, submissions, reports
│       ├── schemas/         # Pydantic request/response models
│       ├── routers/         # auth, projects, agreements, submissions, payments, verification
│       └── services/
│           ├── ai/          # agreement generator + verification (Member 4)
│           └── paypal/      # orders, authorize, capture (Member 5)
├── postman/                 # Postman collection
└── uploads/                 # local dev uploads (gitignored)
```

## 4. Team Ownership
| Member | Role | Owns |
|---|---|---|
| 1 | Frontend & UI/UX | `frontend/src/pages`, `components`, responsive design |
| 2 | Dashboard & AG Grid | `frontend/src/dashboard`, tables with live data |
| 3 | Backend & Database | `backend/app` core, models, routers, auth, uploads |
| 4 | AI Integration | `backend/app/services/ai` |
| 5 | PayPal, APIMatic, Deployment | `backend/app/services/paypal`, `render.yaml`, `postman/` |

Everyone must understand the **full transaction flow**, not just their module.

## 5. Project Status Names (agree on these; do not invent new ones)
`DRAFT` → `PENDING_APPROVAL` → `AGREED` → `PAYMENT_AUTHORIZED` → `IN_PROGRESS` →
`SUBMITTED` → `UNDER_REVIEW` → (`CHANGES_REQUESTED` ↔ `SUBMITTED`) → `APPROVED` → `PAID`

Side states: `CANCELLED`, `PAYMENT_FAILED`.

## 6. The Demo Flow (our goal: one full transaction)
1. Customer creates a project (scope, budget, deadline).
2. AI converts the description into deliverables and acceptance criteria.
3. Customer and freelancer both approve the agreement.
4. Customer authorizes payment via PayPal Sandbox.
5. Freelancer uploads work and evidence.
6. AI compares evidence with requirements and produces a report (completed / missing / uncertain).
7. Customer reviews the report, then approves or requests changes.
8. Backend captures the authorized payment after approval checks.
9. Dashboard shows final project and payment status.

## 7. Hard Rules (do not break)
- **Never capture payment just because AI says work is done.** Only the customer's approval triggers capture.
- AI is **decision support**, not a judge. Always show evidence, uncertainty and limitations.
- **No secrets in the frontend or in Git.** PayPal and LLM keys live in backend env vars only.
- The browser never calls the AI provider or PayPal secret endpoints directly.
- Label everything as **PayPal Sandbox / test transactions**. Do NOT call it a regulated escrow service.
- Handle payment edge cases: cancellation, failure, duplicate requests (use idempotency keys).
- Validate uploaded file types and sizes; only project participants can access a project's files.
- Use AG Grid, APIMatic and Render only where they add real value.

## 8. Environment Variables (see `.env.example`)
```
DATABASE_URL=
JWT_SECRET=
LLM_API_KEY=
LLM_MODEL=
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
FRONTEND_URL=http://localhost:5173
```

## 9. Working Agreements
- One shared GitHub repo. Branch names: `feature/<member>-<task>`. Merge via pull requests.
- Frontend and dashboard start with **mock data**, then switch to real APIs.
- Member 3 publishes API contracts early in `docs/API_CONTRACT.md`.
- Member 4 exposes AI features as backend endpoints.
- Daily check-in: done, next task, blockers.
- Run the app after every merge.

## 10. Timeline (compressed, about 1 day left)
1. **Setup (now):** scaffold repo, run all services locally, test LLM and PayPal Sandbox keys.
2. **Core build:** auth, projects, agreements, AI generation, PayPal order creation, UI pages.
3. **Integration:** connect frontend to APIs, AG Grid to real data, AI verification, authorize/capture.
4. **Testing and deploy:** test roles, failures, duplicates; deploy on Render; seed demo data.
5. **Submission:** record demo video (under 3 min), finalize README, submit on Devpost.

## 11. Instructions for Claude Code
- Read this file first before making changes.
- Keep code simple and working over perfect; the demo must run end to end.
- Follow the folder structure and status names above.
- Add short comments on non-obvious logic. Never hardcode secrets.
- When asked to build a feature, mention which member's area it belongs to.
