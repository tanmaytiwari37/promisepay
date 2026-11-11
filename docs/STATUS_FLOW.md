# Project Status Flow

## Status Lifecycle

```
[DRAFT]
   │
   ▼
[PENDING_APPROVAL]
   │
   ▼
[AGREED]
   │
   ▼
[PAYMENT_AUTHORIZED]
   │
   ▼
[IN_PROGRESS]
   │
   ▼
[SUBMITTED] ◄──────────────┐
   │                       │
   ▼                       │
[UNDER_REVIEW]             │
   │                       │
   ├──► [CHANGES_REQUESTED]┘
   │
   ▼
[APPROVED]
   │
   ▼
[PAID]
```

## Side States
- `CANCELLED`: Project stopped or agreement rejected.
- `PAYMENT_FAILED`: Payment authorization or capture encountered an error.

## Transition Rules
1. Only clients and freelancers can approve agreements to move to `AGREED`.
2. Payment authorization must succeed before moving to `IN_PROGRESS`.
3. Customer approval is required after review before moving to `APPROVED` and triggering PayPal capture.

