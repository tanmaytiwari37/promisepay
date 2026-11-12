# Frontend Integration Notes

**For Members 1 & 2 (Frontend & Dashboard)**

This document describes the backend API contract for frontend integration. The frontend in `frontend/` is being replaced by Google AI Studio export — **do not edit the existing frontend code**. Use this as the reference for the new frontend.

---

## 🔐 Authentication

### Login Flow
```typescript
// POST /auth/login
interface LoginRequest {
  email: string;
  password: string;
}
interface LoginResponse {
  access_token: string;
  token_type: "bearer";
}

// Usage: Store access_token, send as Authorization: Bearer <token>
```

### Register Flow
```typescript
// POST /auth/register
interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role: "customer" | "freelancer";
}
```

### Current User
```typescript
// GET /auth/me
// Returns user profile with role
```

---

## 📋 Projects

### Create Project (Customer)
```typescript
// POST /projects
interface ProjectCreate {
  title: string;
  description?: string;
  budget: number;
  currency?: string; // default "USD"
  deadline?: string; // ISO date
}
```

### List My Projects
```typescript
// GET /projects
// Returns Project[] for current user (customer or freelancer)
```

### Get Project Detail
```typescript
// GET /projects/{project_id}
// Returns full project with status, participants
```

### Assign Freelancer (Customer)
```typescript
// POST /projects/{project_id}/assign-freelancer
interface AssignFreelancer {
  email: string; // Must be registered freelancer
}
```

### Submit for Approval (Customer)
```typescript
// POST /projects/{project_id}/submit-for-approval
// Moves: DRAFT → PENDING_APPROVAL
```

---

## 🤝 Agreements & AI

### Generate Agreement with AI
```typescript
// POST /projects/{project_id}/agreement/generate
// Returns GeneratedAgreement (see below)
// Triggers AI provider based on LLM_PROVIDER env
```

### Get Agreement
```typescript
// GET /projects/{project_id}/agreement
// Returns stored agreement with version
```

### Update Agreement (Both Parties)
```typescript
// PUT /projects/{project_id}/agreement
// Resets approvals, increments version
```

### Approve Agreement (Both Parties)
```typescript
// POST /projects/{project_id}/agreement/approve
// Returns { both_approved, customer_approved, freelancer_approved, status }
// When both_approved=true → status becomes AGREED
```

### Agreement Types
```typescript
interface DeliverableItem {
  id: string;
  title: string;
  description: string;
}

interface AcceptanceCriterionItem {
  id: string;
  deliverable_id: string;
  criterion: string;
}

interface GeneratedAgreement {
  title: string;
  summary: string;
  deliverables: DeliverableItem[];
  acceptance_criteria: AcceptanceCriterionItem[];
  amount: number;
  deadline: string;
  assumptions: string[];
  ai_mode: "mock" | "gemini" | "openai_compatible"; // <-- Display this!
}
```

---

## 💳 Payments (PayPal)

### Create PayPal Order (Customer)
```typescript
// POST /projects/{project_id}/payment/create-order
// Requires: project status = AGREED
// Returns order_id + approval_url (redirect user to PayPal)
interface OrderResponse {
  order_id: string;
  approval_url: string;
  amount: number;
  currency: string;
  status: "CREATED";
  mode: "mock" | "sandbox";
}
```

### Authorize Payment (Customer)
```typescript
// POST /projects/{project_id}/payment/authorize?start_work=true
// Requires: order created, user is customer
// Moves: PAYMENT_AUTHORIZED → IN_PROGRESS (if start_work=true)
interface AuthorizeResponse {
  authorization_id: string;
  payment_status: "PAYMENT_AUTHORIZED";
  project_status: "IN_PROGRESS" | "PAYMENT_AUTHORIZED";
  amount: number;
  currency: string;
  mode: "mock" | "sandbox";
}
```

### Capture Payment (Customer) — **Only after APPROVED**
```typescript
// POST /projects/{project_id}/payment/capture
// Requires: project status = APPROVED
// Idempotent: duplicate calls return stored capture
interface CaptureResponse {
  capture_id: string;
  payment_status: "PAID";
  project_status: "PAID";
  amount: number;
  currency: string;
  mode: "mock" | "sandbox";
}
```

### Cancel Project (Customer)
```typescript
// POST /projects/{project_id}/payment/cancel
// Moves to CANCELLED
```

### List Payments
```typescript
// GET /payments
// Returns all payments for current user's projects
```

---

## 📤 Submissions (Freelancer)

### Submit Work
```typescript
// POST /projects/{project_id}/submissions
// Content-Type: multipart/form-data
// Form fields:
interface SubmitFormData {
  notes: string;        // optional
  file: File;           // optional (pdf, txt, md, png, jpg, zip ≤ 10MB)
}
// Moves project: IN_PROGRESS → SUBMITTED
```

### List Submissions
```typescript
// GET /projects/{project_id}/submissions
```

### Download File
```typescript
// GET /projects/{project_id}/submissions/{submission_id}/download
// Returns file stream
```

---

## 🔍 AI Verification

### Run Verification
```typescript
// POST /projects/{project_id}/verify
// Moves: SUBMITTED → UNDER_REVIEW
// Returns VerificationReport with ai_mode
```

### Get Reports
```typescript
// GET /projects/{project_id}/reports
```

### Verification Types
```typescript
interface CriterionVerification {
  criterion_id: string;
  status: "completed" | "missing" | "uncertain";
  evidence: string;      // Direct quote or file reference
  reasoning: string;     // Why this verdict
}

interface VerificationResult {
  criteria: CriterionVerification[];
  overall_summary: string;
  improvement_suggestions: string[];
  limitations: string[];  // Always present - AI cannot execute code, etc.
  ai_mode: "mock" | "gemini" | "openai_compatible"; // <-- Display this!
}

interface VerificationReport {
  report_id: number;
  project_id: number;
  submission_id: number;
  project_status: "UNDER_REVIEW";
  verification: VerificationResult;
  created_at: string;
}
```

### Neutral Summary (Mediation)
```typescript
// POST /projects/{project_id}/neutral-summary
// Body: { disagreement_context?: string }
// Returns neutral mediation summary
interface NeutralSummary {
  summary_title: string;
  agreed_elements: string[];
  identified_gaps: string[];
  recommended_next_steps: string[];
}
```

---

## ✅ Customer Review

### Review Delivery (Customer)
```typescript
// POST /projects/{project_id}/review
// Body: { decision: "approve" | "request_changes", comment?: string }
// If approve: status → APPROVED (enables capture)
// If request_changes: status → CHANGES_REQUESTED (freelancer can resubmit)
interface ReviewResponse {
  project_id: number;
  decision: "approve" | "request_changes";
  status: "APPROVED" | "CHANGES_REQUESTED";
  comment?: string;
}
```

---

## 📊 Dashboard (AG Grid)

### Summary
```typescript
// GET /dashboard/summary
// Returns { total_projects, status_counts }
```

---

## 🔄 Status Flow (Frontend State Machine)

```
DRAFT
  → (customer) submit-for-approval
PENDING_APPROVAL
  → (both) agreement/approve
AGREED
  → (customer) payment/create-order → payment/authorize
PAYMENT_AUTHORIZED
  → (auto) IN_PROGRESS
IN_PROGRESS
  → (freelancer) submissions
SUBMITTED
  → (customer) verify
UNDER_REVIEW
  → (customer) review: "request_changes" → CHANGES_REQUESTED
  → (customer) review: "approve" → APPROVED
CHANGES_REQUESTED
  → (freelancer) submissions → SUBMITTED
APPROVED
  → (customer) payment/capture → PAID
PAID
```

**Side States**: `CANCELLED`, `PAYMENT_FAILED`

---

## 🎨 UI Guidelines

### AI Mode Badge
Always show the AI provider used:
```tsx
// Example badge component
<Badge variant={ai_mode === "mock" ? "secondary" : "primary"}>
  AI: {ai_mode}
</Badge>
```

### PayPal Sandbox Label
Every PayPal-related UI must show:
> **"PayPal Sandbox — Test Transaction"**

### Status Colors
| Status | Color | Meaning |
|--------|-------|---------|
| DRAFT, PENDING_APPROVAL | Gray | Setup phase |
| AGREED, PAYMENT_AUTHORIZED, IN_PROGRESS | Blue | Active work |
| SUBMITTED, UNDER_REVIEW | Orange | Under review |
| CHANGES_REQUESTED | Red | Needs revision |
| APPROVED | Green | Ready for capture |
| PAID | Green (bold) | Complete |
| CANCELLED, PAYMENT_FAILED | Red | Terminal error |

### File Upload
- Max 10MB
- Allowed: `.pdf`, `.txt`, `.md`, `.png`, `.jpg`, `.jpeg`, `.zip`
- Show sanitized filename after upload

---

## 🔧 Environment Variables (Frontend)

```env
# .env (frontend)
VITE_API_URL=http://localhost:8000  # or https://promisepay-backend.onrender.com
```

---

## 🧪 Demo Accounts (Pre-Seeded)

| Role | Email | Password |
|------|-------|----------|
| Customer | `customer@demo.com` | `demo1234` |
| Freelancer | `freelancer@demo.com` | `demo1234` |

---

## 📝 Error Handling

All errors return:
```typescript
interface ErrorResponse {
  detail: string;  // Human-readable message
}
```

Common HTTP codes:
- `400` — Validation error (bad input, file type, size)
- `401` — Unauthorized (token missing/invalid)
- `403` — Forbidden (wrong role, not participant)
- `404` — Not found
- `409` — Conflict (wrong status for action, duplicate)
- `422` — Validation error (Pydantic)
- `502` — Upstream error (PayPal, AI provider)

---

## 🔗 Postman for Testing

Import `postman/postman_collection.json` + `postman/promisepay-environment.json` for manual API testing during frontend development.

---

## ⚡ Quick Test Commands

```bash
# Backend health
curl http://localhost:8000/health

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@demo.com","password":"demo1234"}'

# Use token for subsequent calls
TOKEN=<access_token>
curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/projects
```