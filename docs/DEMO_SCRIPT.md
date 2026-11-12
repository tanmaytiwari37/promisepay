# PromisePay Demo Script

**Target**: 3-minute demo video for PayPal AI Hackathon 2026 Devpost submission.

---

## 🎬 Video Structure (180 seconds)

| Time | Segment | Duration |
|------|---------|----------|
| 0:00–0:10 | Hook & Problem | 10s |
| 0:10–0:30 | Landing + Auth | 20s |
| 0:30–0:55 | Create Project + AI Agreement | 25s |
| 0:55–1:15 | Dual Approval + PayPal Order | 20s |
| 1:15–1:35 | Authorize + Freelancer Work | 20s |
| 1:35–1:55 | AI Verification Report | 20s |
| 1:55–2:10 | Customer Review + Capture | 15s |
| 2:10–2:20 | Dashboard + Status | 10s |
| 2:20–2:30 | Closing (AI mode honesty, Sandbox label) | 10s |

---

## 📝 Narration Script

### 0:00–0:10 — Hook & Problem
> "Freelancers and clients struggle with trust: vague scopes, disputed deliveries, and payments released before work is verified. PromisePay solves this with AI-structured agreements, evidence-based verification, and PayPal-authorized payments that only capture **after** customer approval."

### 0:10–0:30 — Landing + Auth
> *Show landing page → click "Get Started" → register as Customer → auto-login*
> "Customers and freelancers sign up with role-based access. Demo accounts are pre-seeded for instant testing."

### 0:30–0:55 — Create Project + AI Agreement
> *Create project: "Bakery Website", $200, 1 week → click "Generate Agreement with AI"*
> "The customer (Riya Sharma, owner of Riya's Bake House) describes the project in plain language. Our provider-agnostic AI (mock/Gemini/NVIDIA NIM) converts it into structured deliverables with verifiable acceptance criteria — no legal expertise needed. The AI generates: Home Page, Menu Page, Contact Page with Form, and criteria like 'Site works on mobile'."

### 0:55–1:15 — Dual Approval + PayPal Order
> *Show agreement → both Customer (Riya) and Freelancer (Arjun Mehta) click "Approve" → status becomes AGREED → Customer clicks "Create PayPal Order"*
> "Both parties must approve. Once agreed, the customer creates a PayPal Order with intent **AUTHORIZE** — this reserves funds but doesn't charge yet. Idempotency keys prevent duplicate orders."

### 1:15–1:35 — Authorize + Freelancer Work
> *Customer clicks "Authorize Payment" → project moves to IN_PROGRESS → switch to Freelancer view (Arjun) → upload work file + notes → submit*
> "Authorization moves the project to IN_PROGRESS. The freelancer (Arjun) uploads deliverables with evidence — live URLs and screenshots. File uploads are sanitized and size-limited for security."

### 1:35–1:55 — AI Verification Report
> *Customer clicks "Run AI Verification" → show report with completed/missing/uncertain per criterion, evidence quotes, limitations*
> "The AI verifies each acceptance criterion against the submitted evidence. It's conservative: 'completed' only with direct quotes, 'uncertain' when evidence is partial. Here, 3 criteria are completed (pages exist, menu has prices, contact form works), but mobile responsiveness is 'uncertain' because no mobile test evidence was provided. **Crucially**, limitations are disclosed — AI cannot execute code or verify external APIs. The `ai_mode` field shows which provider was used."

### 1:55–2:10 — Customer Review + Capture
> *Customer (Riya) reviews report → clicks "Approve Delivery" → status becomes APPROVED → clicks "Capture Payment" → shows PAID status*
> "**Only the customer's approval triggers capture**. The authorized payment is captured via PayPal. Duplicate capture requests are idempotent — they return the stored capture without calling PayPal again."

### 2:10–2:20 — Dashboard + Status
> *Open Dashboard → show AG Grid tables with project status, payment status, role-specific views*
> "AG Grid dashboards (sponsor tool) give both parties real-time visibility into project lifecycle and payment state."

### 2:20–2:30 — Closing
> "PromisePay: AI-structured agreements, evidence-based verification, PayPal-authorized payments — **capture only after human approval**. All PayPal transactions run in Sandbox. AI mode is always transparent. Built for the PayPal AI Hackathon 2026."

---

## 🎥 Recording Tips

1. **Resolution**: 1920x1080 minimum
2. **Browser**: Chrome/Edge, hide bookmarks bar
3. **Speed**: Normal speed, no rush — 3 min is generous
4. **Audio**: Clear narration, no background noise
5. **Text**: Ensure form inputs are readable (zoom if needed)
6. **Transitions**: Cut dead time (loading, typing) — show result
7. **Highlight**: Use mouse highlight for clicks

---

## 🖥 Demo Data (Pre-Seeded)

| Account | Email | Password |
|---------|-------|----------|
| Customer | `customer@demo.com` | `demo1234` |
| Freelancer | `freelancer@demo.com` | `demo1234` |

### Sample Project for Demo
```
Title: Bakery Website
Description: 3-page website for Riya's Bake House (Home, Menu, Contact with working form). Mobile responsive. Built by freelancer Arjun Mehta.
Budget: 200
Deadline: 2026-11-19 (one week from creation)
```

---

## ✅ Pre-Recording Checklist

- [ ] Backend running (`uvicorn app.main:app --reload --port 8000`)
- [ ] Frontend running (`npm run dev` on port 5173)
- [ ] Demo accounts work
- [ ] PayPal mode = `mock` (no sandbox credentials needed for video)
- [ ] AI mode = `mock` (works offline)
- [ ] Browser window sized for recording
- [ ] Screen recorder ready (OBS, Loom, etc.)
- [ ] Script printed or on second monitor

---

## 📤 Post-Recording

1. Trim to **under 3 minutes**
2. Upload to **YouTube (unlisted or public)**
3. Add to Devpost submission
4. Include link in `SUBMISSION_CHECKLIST.md`