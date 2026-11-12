# PromisePay Deployment Steps

## Overview
Deploy PromisePay backend and frontend to Render with PostgreSQL database.

---

## Prerequisites
- GitHub repository connected to Render
- PayPal Developer Sandbox account
- (Optional) LLM API key for AI features (Gemini, NVIDIA NIM, etc.)

---

## 1. Render Blueprint Deploy (Recommended)

### Option A: Using `render.yaml` (Blueprint)
1. Push the repo to GitHub (including `render.yaml` at root)
2. In Render Dashboard → **New** → **Blueprint**
3. Connect your GitHub repo
4. Render will detect `render.yaml` and propose:
   - **Web Service**: `promisepay-backend` (Python)
   - **Static Site**: `promisepay-frontend`
   - **Database**: `promisepay-db` (PostgreSQL, Free tier)
5. Click **Apply** — Render provisions all resources

### Option B: Manual Service Creation
If not using Blueprint, create services manually:

#### Backend Web Service
- **Type**: Web Service
- **Name**: `promisepay-backend`
- **Root Directory**: `backend`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Environment**: Python 3.11

#### Frontend Static Site
- **Type**: Static Site
- **Name**: `promisepay-frontend`
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Publish Path**: `./dist`

#### PostgreSQL Database
- **Type**: PostgreSQL
- **Name**: `promisepay-db`
- **Plan**: Free (or paid for production)
- **Database Name**: `promisepay`
- **User**: `promisepay`

---

## 2. Environment Variables (Set in Render Dashboard)

### Backend (Required)
| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | *Auto-linked from DB* | Render injects `postgresql://user:pass@host/db` |
| `JWT_SECRET` | **Generate strong secret** | `openssl rand -hex 32` |
| `FRONTEND_URLS` | `https://your-frontend.onrender.com,https://your-frontend.vercel.app` | Comma-separated list of allowed frontend origins (CORS + PayPal return/cancel URLs) |
| `PAYPAL_MODE` | `sandbox` | Use `sandbox` for testing |
| `PAYPAL_CLIENT_ID` | *From PayPal Developer* | Sandbox App credentials |
| `PAYPAL_CLIENT_SECRET` | *From PayPal Developer* | Sandbox App credentials |
| `PAYPAL_BASE_URL` | `https://api-m.sandbox.paypal.com` | Sandbox endpoint |

### Backend (Optional - for AI features)
| Variable | Value | Notes |
|----------|-------|-------|
| `LLM_PROVIDER` | `mock` \| `gemini` \| `openai_compatible` | Default: `mock` |
| `LLM_API_KEY` | *Your LLM API key* | Required for real AI |
| `LLM_MODEL` | `gemini-1.5-flash` | Or your model name |
| `LLM_BASE_URL` | *e.g., NVIDIA NIM URL* | Only for `openai_compatible` |

### Frontend (Required)
| Variable | Value | Notes |
|----------|-------|-------|
| `VITE_API_URL` | `https://promisepay-backend.onrender.com` | Your backend URL |

---

## 3. Firebase Setup (for Google Sign-In)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a project (or use existing)
3. Enable **Authentication** → **Sign-in method** → **Google**
4. In **Authentication** → **Settings** → **Authorized domains**, add your frontend domains:
   - `localhost` (for local dev)
   - `your-frontend.onrender.com`
   - `your-frontend.vercel.app`
   - Any custom domains
5. In **Project Settings** → **General**, copy the **Project ID**
6. In Render → Backend service → Environment → Add:
   - `FIREBASE_PROJECT_ID=<your-project-id>`

> **Important**: Firebase Google Sign-In only works on domains listed in **Authorized domains**. Add all production/staging URLs there.

---

## 4. PayPal Sandbox Setup

1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/)
2. Create a **Sandbox App** (or use existing)
3. Copy **Client ID** and **Client Secret**
4. **Create a Sandbox Buyer Account** for testing payments:
   - In Developer Dashboard → **Sandbox** → **Accounts**
   - Click **Create Account** → **Personal (Buyer)**
   - Choose country (e.g., United States)
   - Copy the generated email and password
   - Use this account to log in on the PayPal approval page during testing
5. In Render → Backend service → Environment → Add:
   - `PAYPAL_CLIENT_ID`
   - `PAYPAL_CLIENT_SECRET`
6. Set `PAYPAL_MODE=sandbox` and `PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com`

> **Important**: This integration uses **PayPal Sandbox only**. All transactions are TEST transactions. Do NOT use live credentials.

---

## 5. Database Migrations

The app uses SQLAlchemy `create_all()` on startup (`init_db()`). For production:

### Initial Deploy
- Tables created automatically on first run
- Demo users seeded: `customer@demo.com` / `freelancer@demo.com` (password: `demo1234`)

### Future Schema Changes
1. Add Alembic to project:
   ```bash
   pip install alembic
   alembic init alembic
   ```
2. Configure `alembic.ini` and `alembic/env.py` for your models
3. Generate migrations: `alembic revision --autogenerate -m "description"`
4. Run on deploy: Add `alembic upgrade head` to build/start command

> For hackathon demo, `create_all()` is sufficient. For production, use Alembic.

---

## 6. File Uploads on Render

- Render's filesystem is **ephemeral** (cleared on deploy)
- For persistent uploads, use:
  - **Render Disk** (add to web service: Settings → Disks → Add Disk)
  - Or cloud storage (S3, Cloudflare R2, etc.)

### Quick Fix: Render Disk
1. In Render Dashboard → Backend service → Settings → Disks
2. Add Disk: Name `uploads`, Mount Path `/opt/render/project/uploads`, Size 1 GB
3. Set `UPLOAD_DIR=/opt/render/project/uploads` in environment

---

## 7. Health Checks

- Backend: `GET /health` → `{"status": "OK", "app": "PromisePay API"}`
- Render uses this for zero-downtime deploys
- Ensure `/health` returns 200 within 10s

---

## 8. Custom Domains (Optional)

1. In Render → Service → Settings → Custom Domains
2. Add domain (e.g., `api.promisepay.dev`)
3. Update `FRONTEND_URL` and `VITE_API_URL` accordingly
4. Update PayPal App return/cancel URLs if needed

---

## 9. Verification Checklist

After deploy, verify:

- [ ] Backend health: `GET https://your-backend.onrender.com/health`
- [ ] API docs: `GET https://your-backend.onrender.com/docs`
- [ ] Frontend loads: `GET https://your-frontend.onrender.com`
- [ ] Register/Login works
- [ ] Create project → Generate agreement → Approve → Payment flow
- [ ] PayPal sandbox buttons appear (test with sandbox buyer account)
- [ ] AI verification runs (mock mode if no LLM key)
- [ ] File upload/download works
- [ ] Demo users can login

---

## 10. Local Development with Production Config

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env with your local values (can use Render DB URL locally)
uvicorn app.main:app --reload

# Frontend
cd frontend
npm install
npm run dev
```

---

## 11. Troubleshooting

| Issue | Fix |
|-------|-----|
| `DATABASE_URL` not set | Link PostgreSQL in Render service settings |
| JWT_SECRET warning | Set strong secret in environment |
| CORS errors | Ensure `FRONTEND_URLS` includes your frontend origin (comma-separated, no trailing slashes) |
| PayPal 401/403 | Verify Client ID/Secret are for Sandbox, not Live |
| File upload fails | Check `UPLOAD_DIR` exists and is writable; add Render Disk |
| AI returns mock data | Set `LLM_PROVIDER` and `LLM_API_KEY` for real AI |

---

## 12. Cost Estimate (Render Free Tier)

| Resource | Cost |
|----------|------|
| Backend Web Service | Free (spins down after 15min inactivity) |
| Frontend Static Site | Free |
| PostgreSQL Database | Free (90 days, then $7/mo) |
| Render Disk (1 GB) | Free (with paid plan) |

**Total: $0/month for hackathon demo**

---

## 13. Security Notes for Production

- [ ] Use strong `JWT_SECRET` (32+ bytes)
- [ ] Enable HTTPS only (Render provides automatically)
- [ ] Set `PAYPAL_MODE=live` with Live credentials (separate app)
- [ ] Add rate limiting (Redis + slowapi)
- [ ] Use PostgreSQL with connection pooling (PgBouncer)
- [ ] Store uploads in S3/R2, not local disk
- [ ] Add monitoring (Sentry, Datadog)
- [ ] Regular dependency updates (`pip-audit`, `npm audit`)