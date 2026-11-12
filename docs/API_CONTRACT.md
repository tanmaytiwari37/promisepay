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
  "email": "riya@sharma.com",
  "password": "securepassword123",
  "name": "Riya Sharma",
  "role": "customer"
}
```
- **Response `201 Created`**:
```json
{
  "id": 1,
  "email": "riya@sharma.com",
  "full_name": "Riya Sharma",
  "role": "customer",
  "created_at": "2026-11-11T12:00:00"
}
```

### `POST /auth/login`
- **Auth**: None
- **Request Body**:
```json
{
  "email": "riya@sharma.com",
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
  "email": "riya@sharma.com",
  "full_name": "Riya Sharma",
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
  "title": "Bakery Website",
  "description": "3-page website for Riya's Bake House (Home, Menu, Contact with form). Mobile responsive.",
  "budget": 200.0,
  "currency": "USD",
  "deadline": "2026-11-19"
}
```
- **Response `201 Created`**:
```json
{
  "id": 10,
  "title": "Bakery Website",
  "description": "3-page website for Riya's Bake House (Home, Menu, Contact with form). Mobile responsive.",
  "budget": 200.0,
  "currency": "USD",
  "deadline": "2026-11-19",
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
    "title": "Bakery Website",
    "description": "3-page website for Riya's Bake House (Home, Menu, Contact with form). Mobile responsive.",
    "budget": 200.0,
    "currency": "USD",
    "deadline": "2026-11-19",
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
- **Response `200 OK`**: Returns project with `freelancer_id` updated (freelancer: Arjun Mehta).

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
      "title": "Home Page",
      "description": "Hero section with bakery story, featured items, and call-to-action."
    },
    {
      "id": "del-2",
      "title": "Menu Page",
      "description": "Lists all bakery items with prices, descriptions, and dietary tags."
    },
    {
      "id": "del-3",
      "title": "Contact Page with Form",
      "description": "Contact form that sends messages to the bakery's email."
    }
  ],
  "acceptance_criteria": [
    {
      "id": "crit-1",
      "deliverable_id": "del-1",
      "criterion": "Home, Menu, and Contact pages exist and are accessible via navigation."
    },
    {
      "id": "crit-2",
      "deliverable_id": "del-2",
      "criterion": "Menu page lists items with prices and descriptions."
    },
    {
      "id": "crit-3",
      "deliverable_id": "del-3",
      "criterion": "Contact form sends a message successfully (shows confirmation)."
    },
    {
      "id": "crit-4",
      "deliverable_id": "del-1",
      "criterion": "Site works on mobile viewports (responsive design)."
    }
  ],
  "amount": 200.0,
  "deadline": "2026-11-19",
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
  "title": "Bakery Website",
  "summary": "Build a 3-page website (Home, Menu, Contact) for Riya's Bake House with a working contact form, within budget of $200.",
  "deliverables": [
    {
      "id": "del-1",
      "title": "Home Page",
      "description": "Hero section with bakery story, featured items, and call-to-action."
    },
    {
      "id": "del-2",
      "title": "Menu Page",
      "description": "Lists all bakery items with prices, descriptions, and dietary tags."
    },
    {
      "id": "del-3",
      "title": "Contact Page with Form",
      "description": "Contact form that sends messages to the bakery's email."
    }
  ],
  "acceptance_criteria": [
    {
      "id": "crit-1",
      "deliverable_id": "del-1",
      "criterion": "Home, Menu, and Contact pages exist and are accessible via navigation."
    },
    {
      "id": "crit-2",
      "deliverable_id": "del-2",
      "criterion": "Menu page lists items with prices and descriptions."
    },
    {
      "id": "crit-3",
      "deliverable_id": "del-3",
      "criterion": "Contact form sends a message successfully (shows confirmation)."
    },
    {
      "id": "crit-4",
      "deliverable_id": "del-1",
      "criterion": "Site works on mobile viewports (responsive design)."
    }
  ],
  "amount": 200.0,
  "deadline": "2026-11-19",
  "assumptions": [
    "Client provides bakery logo, photos, and menu content",
    "Deployment will target standard HTTPS hosting (e.g., Vercel, Netlify)"
  ],
  "ai_mode": "mock"
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
        "evidence": "Submission includes live URLs: https://riyasbakehouse.vercel.app/, https://riyasbakehouse.vercel.app/menu, https://riyasbakehouse.vercel.app/contact",
        "reasoning": "All three pages are deployed and accessible via navigation bar. Direct evidence from live site."
      },
      {
        "criterion_id": "crit-2",
        "status": "completed",
        "evidence": "Menu page shows 12 items with prices (e.g., 'Chocolate Croissant — $3.50', 'Sourdough Loaf — $6.00') and descriptions.",
        "reasoning": "Menu page displays items, prices, and descriptions as required. Verified via live URL."
      },
      {
        "criterion_id": "crit-3",
        "status": "completed",
        "evidence": "Form submission test: filled Name, Email, Message fields → clicked Send → received 'Message sent successfully' toast notification.",
        "reasoning": "Contact form functions end-to-end. Submission recorded in Formspree dashboard (screenshot attached)."
      },
      {
        "criterion_id": "crit-4",
        "status": "uncertain",
        "evidence": "Submission includes desktop screenshots only. No mobile viewport screenshots or automated test results provided.",
        "reasoning": "Cannot verify mobile responsiveness without mobile viewport evidence or automated test report. Customer should manually test on mobile device."
      }
    ],
    "overall_summary": "Three of four acceptance criteria verified with direct evidence. Mobile responsiveness remains uncertain — no mobile test evidence provided. Customer should test on mobile device before final approval.",
    "improvement_suggestions": [
      "Attach mobile viewport screenshots or Lighthouse mobile audit report",
      "Test contact form on actual mobile device"
    ],
    "limitations": [
      "Automated check does not execute arbitrary code or verify external third-party API credentials live",
      "Cannot verify visual rendering on real mobile devices without screenshots or test reports",
      "Customer approval remains required to trigger payment capture"
    ],
    "ai_mode": "mock"
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

### `GET /dashboard/pending-approvals`
- **Auth**: Bearer Token
- **Query Params**: `status=pending|approved` (optional)
- **Response `200 OK`**:
```json
[
  {
    "project_id": 10,
    "project_title": "Mobile App Redesign",
    "approval_type": "agreement",
    "customer_approved": true,
    "freelancer_approved": false,
    "pending_from": "freelancer",
    "overall_status": "pending",
    "customer_approved_at": "2026-11-11T12:10:00",
    "freelancer_approved_at": null
  }
]
```
- **Notes**: Returns flat array for AG Grid binding. Only projects where the user is customer or freelancer. `pending_from` values: `"customer"`, `"freelancer"`, `"both"`, or `null` (fully approved).
