# PromisePay API Contract

Complete REST API specification with authentication requirements and example request/response payloads.

---

## 1. System & Health

### `GET /health`
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "status": "OK",
  "app": "PromisePay API"
}
```

### `GET /`
- **Auth**: None
- **Response `200 OK`**:
```json
{
  "app": "PromisePay API",
  "status": "online",
  "docs": "/docs",
  "health": "/health"
}
```

---

## 2. Authentication & Users

### `POST /auth/register`
- **Auth**: None
- **Request Body**:
```json
{
  "email": "client@example.com",
  "password": "securepassword123",
  "name": "Alex Client",
  "role": "customer"
}
```
- **Response `201 Created`**:
```json
{
  "id": 1,
  "email": "client@example.com",
  "full_name": "Alex Client",
  "role": "customer",
  "created_at": "2026-11-11T12:00:00"
}
```

### `POST /auth/login`
- **Auth**: None
- **Request Body**:
```json
{
  "email": "client@example.com",
  "password": "securepassword123"
}
```
- **Response `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### `GET /auth/me`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "id": 1,
  "email": "client@example.com",
  "full_name": "Alex Client",
  "role": "customer",
  "created_at": "2026-11-11T12:00:00"
}
```

### `POST /auth/google`
- **Auth**: None
- **Request Body**:
```json
{
  "id_token": "<firebase id token>",
  "role": "customer"
}
```
- **Response `200 OK`**:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```
- **Notes**: Role is used only when the user is created the first time. The Firebase ID token must have a verified email.

---

## 3. Projects & Agreements

### `POST /projects`
- **Auth**: Bearer Token (Role: customer)
- **Request Body**:
```json
{
  "title": "Mobile App Redesign",
  "description": "Figma design system and React Native mobile UI",
  "budget": 1200.0,
  "currency": "USD",
  "deadline": "2026-12-15"
}
```
- **Response `201 Created`**:
```json
{
  "id": 10,
  "title": "Mobile App Redesign",
  "description": "Figma design system and React Native mobile UI",
  "budget": 1200.0,
  "currency": "USD",
  "deadline": "2026-12-15",
  "status": "DRAFT",
  "customer_id": 1,
  "freelancer_id": null,
  "created_at": "2026-11-11T12:05:00",
  "updated_at": "2026-11-11T12:05:00"
}
```

### `GET /projects`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
[
  {
    "id": 10,
    "title": "Mobile App Redesign",
    "description": "Figma design system and React Native mobile UI",
    "budget": 1200.0,
    "currency": "USD",
    "deadline": "2026-12-15",
    "status": "DRAFT",
    "customer_id": 1,
    "freelancer_id": null,
    "created_at": "2026-11-11T12:05:00",
    "updated_at": "2026-11-11T12:05:00"
  }
]
```

### `GET /projects/{project_id}`
- **Auth**: Bearer Token (Participant only)
- **Response `200 OK`**: Same schema as project response above.

### `POST /projects/{project_id}/assign-freelancer`
- **Auth**: Bearer Token (Customer only)
- **Request Body**:
```json
{
  "email": "freelancer@demo.com"
}
```
- **Response `200 OK`**: Returns project with `freelancer_id` updated.

### `POST /projects/{project_id}/submit-for-approval`
- **Auth**: Bearer Token (Customer only)
- **Response `200 OK`**: Moves project status from `DRAFT` to `PENDING_APPROVAL`.

### `GET /projects/{project_id}/agreement`
- **Auth**: Bearer Token (Participant only)
- **Response `200 OK`**:
```json
{
  "id": 5,
  "project_id": 10,
  "deliverables": [
    {
      "id": "del-1",
      "title": "Design System",
      "description": "Figma variables and component library"
    }
  ],
  "acceptance_criteria": [
    {
      "id": "crit-1",
      "deliverable_id": "del-1",
      "criterion": "Tokens exported to iOS and Android design formats"
    }
  ],
  "amount": 1200.0,
  "deadline": "2026-12-15",
  "version": 1,
  "created_at": "2026-11-11T12:05:00",
  "updated_at": "2026-11-11T12:05:00"
}
```

### `PUT /projects/{project_id}/agreement`
- **Auth**: Bearer Token (Participant only)
- **Request Body**:
```json
{
  "deliverables": [{"id": "del-1", "title": "Updated Scope", "description": "Details"}],
  "acceptance_criteria": [{"id": "crit-1", "deliverable_id": "del-1", "criterion": "Passes audit"}],
  "amount": 1500.0,
  "deadline": "2026-12-20"
}
```
- **Response `200 OK`**: Returns updated agreement, increments version, and resets approvals.

### `POST /projects/{project_id}/agreement/approve`
- **Auth**: Bearer Token (Participant only)
- **Response `200 OK`**:
```json
{
  "project_id": 10,
  "status": "AGREED",
  "user_approved": true,
  "both_approved": true,
  "customer_approved": true,
  "freelancer_approved": true
}
```

---

## 4. AI Services

### `POST /projects/{project_id}/agreement/generate`
- **Auth**: Bearer Token (Participant only)
- **Response `200 OK`**:
```json
{
  "title": "E-Commerce Landing Page & API Integration",
  "summary": "Deliver a high-converting, mobile-responsive landing page...",
  "deliverables": [
    {
      "id": "del-1",
      "title": "Responsive Frontend Layout",
      "description": "Cross-browser compatible UI based on specifications."
    }
  ],
  "acceptance_criteria": [
    {
      "id": "crit-1",
      "deliverable_id": "del-1",
      "criterion": "Passes automated responsive testing on Chrome and Safari viewports."
    }
  ],
  "amount": 1200.0,
  "deadline": "2026-12-15",
  "assumptions": ["Client provides branding assets"]
}
```

### `POST /projects/{project_id}/verify`
- **Auth**: Bearer Token (Participant only)
- **Response `200 OK`**:
```json
{
  "report_id": 1,
  "project_id": 10,
  "submission_id": 3,
  "project_status": "UNDER_REVIEW",
  "verification": {
    "criteria": [
      {
        "criterion_id": "crit-1",
        "status": "completed",
        "evidence": "Submission evidence quotes...",
        "reasoning": "Criterion satisfied by delivered code."
      }
    ],
    "overall_summary": "Initial verification shows deliverables in place.",
    "improvement_suggestions": ["Include deployment URL"],
    "limitations": ["Automated check does not execute arbitrary code"]
  },
  "created_at": "2026-11-11T12:20:00"
}
```

### `GET /projects/{project_id}/reports`
- **Auth**: Bearer Token (Participant only)
- **Response `200 OK`**: Array of report objects.

### `POST /projects/{project_id}/neutral-summary`
- **Auth**: Bearer Token (Participant only)
- **Request Body**:
```json
{
  "disagreement_context": "Dispute over mobile viewport alignment"
}
```
- **Response `200 OK`**:
```json
{
  "summary_title": "Neutral Project Assessment & Resolution Steps",
  "agreed_elements": ["Core layout delivered"],
  "identified_gaps": ["Dispute over mobile viewport alignment"],
  "recommended_next_steps": ["Attach screencast on target devices"]
}
```

---

## 5. Submissions & Files

### `POST /projects/{project_id}/submissions`
- **Auth**: Bearer Token (Freelancer only)
- **Content-Type**: `multipart/form-data`
- **Form Data**:
  - `notes`: `"Completed all features"`
  - `file`: `evidence.zip` (Allowed: pdf, txt, md, png, jpg, zip <= 10MB)
- **Response `201 Created`**:
```json
{
  "id": 3,
  "project_id": 10,
  "freelancer_id": 2,
  "notes": "Completed all features",
  "file_name": "evidence.zip",
  "file_type": "zip",
  "status": "SUBMITTED",
  "created_at": "2026-11-11T12:15:00"
}
```

### `GET /projects/{project_id}/submissions`
- **Auth**: Bearer Token (Participant only)
- **Response `200 OK`**: Array of submissions for the project.

### `GET /projects/{project_id}/submissions/{submission_id}/download`
- **Auth**: Bearer Token (Participant only)
- **Response `200 OK`**: File byte stream download.

---

## 6. Customer Review & Payments

### `POST /projects/{project_id}/review`
- **Auth**: Bearer Token (Customer only)
- **Request Body**:
```json
{
  "decision": "approve",
  "comment": "All criteria verified and accepted."
}
```
- **Response `200 OK`**:
```json
{
  "project_id": 10,
  "decision": "approve",
  "status": "APPROVED",
  "comment": "All criteria verified and accepted."
}
```

### `POST /projects/{project_id}/payment/create-order`
- **Auth**: Bearer Token (Customer only)
- **Response `200 OK`**:
```json
{
  "order_id": "MOCK-ORD-10-86de37",
  "approval_url": "https://www.sandbox.paypal.com/checkoutnow?token=MOCK-ORD-10-86de37",
  "amount": 1200.0,
  "currency": "USD",
  "status": "CREATED",
  "mode": "mock"
}
```

### `POST /projects/{project_id}/payment/authorize`
- **Auth**: Bearer Token (Customer only)
- **Query Params**: `start_work=true` (optional, default true)
- **Response `200 OK`**:
```json
{
  "authorization_id": "MOCK-AUTH-MOCK-ORD-10-86de37",
  "payment_status": "PAYMENT_AUTHORIZED",
  "project_status": "IN_PROGRESS",
  "amount": 1200.0,
  "currency": "USD",
  "mode": "mock"
}
```

### `POST /projects/{project_id}/payment/capture`
- **Auth**: Bearer Token (Customer only)
- **Response `200 OK`**:
```json
{
  "capture_id": "MOCK-CAP-MOCK-AUTH-MOCK-ORD-10-86de37",
  "payment_status": "PAID",
  "project_status": "PAID",
  "amount": 1200.0,
  "currency": "USD",
  "mode": "mock"
}
```

### `POST /projects/{project_id}/payment/cancel`
- **Auth**: Bearer Token (Customer only)
- **Response `200 OK`**:
```json
{
  "project_id": 10,
  "status": "CANCELLED",
  "mode": "mock",
  "detail": "Payment authorization cancelled by customer"
}
```

### `GET /payments`
- **Auth**: Bearer Token
- **Response `200 OK`**: List of current user's payments across all projects.

### `GET /dashboard/summary`
- **Auth**: Bearer Token
- **Response `200 OK`**:
```json
{
  "total_projects": 3,
  "status_counts": {
    "AGREED": 1,
    "IN_PROGRESS": 1,
    "PAID": 1
  }
}
```
