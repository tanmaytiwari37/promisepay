# API Contract

## Planned Endpoints Summary

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |
| POST | `/auth/login` | Authenticate user and issue JWT |
| GET | `/projects/` | List current user's projects |
| POST | `/agreements/` | Create agreement draft |
| POST | `/submissions/` | Submit deliverable evidence |
| POST | `/payments/orders` | Create PayPal sandbox order |
| POST | `/verification/verify` | AI delivery verification |

---

### 1. Health Check
- **`GET /health`**
- **Response `200 OK`**:
```json
{
  "status": "OK",
  "app": "PromisePay API"
}
```

### 2. Login
- **`POST /auth/login`**
- **Request Body**:
```json
{
  "email": "client@example.com",
  "password": "secretpassword"
}
```
- **Response `200 OK`**:
```json
{
  "access_token": "mock-jwt-token-xyz",
  "token_type": "bearer"
}
```

### 3. List Projects
- **`GET /projects/`**
- **Response `200 OK`**:
```json
[
  {
    "id": 1,
    "title": "Portfolio Website Design",
    "budget": 500.0,
    "status": "IN_PROGRESS",
    "client_id": 10,
    "freelancer_id": 20
  }
]
```

### 4. Create Agreement
- **`POST /agreements/`**
- **Request Body**:
```json
{
  "project_id": 1,
  "deliverables": "Figma design files and landing page code",
  "acceptance_criteria": "Fully responsive and tested on Chrome/Safari",
  "total_amount": 500.0
}
```
- **Response `201 Created`**:
```json
{
  "id": 101,
  "project_id": 1,
  "status": "PENDING_APPROVAL"
}
```

### 5. Submit Work
- **`POST /submissions/`**
- **Request Body**:
```json
{
  "project_id": 1,
  "deliverable_title": "Completed Landing Page",
  "evidence_url": "https://github.com/freelancer/repo",
  "notes": "Finished according to Figma guidelines"
}
```
- **Response `201 Created`**:
```json
{
  "id": 301,
  "project_id": 1,
  "status": "SUBMITTED"
}
```

### 6. Create PayPal Order
- **`POST /payments/orders`**
- **Request Body**:
```json
{
  "project_id": 1,
  "amount": 500.0,
  "currency": "USD"
}
```
- **Response `200 OK`**:
```json
{
  "order_id": "PAYPAL-ORDER-12345",
  "status": "CREATED"
}
```

### 7. AI Verification
- **`POST /verification/verify`**
- **Request Body**:
```json
{
  "submission_id": 301,
  "deliverables": ["Landing page responsive layout"],
  "acceptance_criteria": ["Mobile responsive", "Lighthouse score > 90"],
  "evidence_url": "https://github.com/freelancer/repo"
}
```
- **Response `200 OK`**:
```json
{
  "completed": ["Mobile responsive"],
  "missing": [],
  "uncertain": ["Lighthouse score > 90"],
  "report_summary": "Most criteria met. Manual review recommended for lighthouse benchmarks."
}
```

