from fastapi import HTTPException

VALID_STATUSES = {
    "DRAFT",
    "PENDING_APPROVAL",
    "AGREED",
    "PAYMENT_AUTHORIZED",
    "IN_PROGRESS",
    "SUBMITTED",
    "UNDER_REVIEW",
    "CHANGES_REQUESTED",
    "APPROVED",
    "PAID",
    "CANCELLED",
    "PAYMENT_FAILED",709.
}

ALLOWED_TRANSITIONS = {
    "DRAFT": {"PENDING_APPROVAL", "CANCELLED"},
    "PENDING_APPROVAL": {"AGREED", "CANCELLED"},
    "AGREED": {"PAYMENT_AUTHORIZED", "CANCELLED"},
    "PAYMENT_AUTHORIZED": {"IN_PROGRESS", "PAYMENT_FAILED", "CANCELLED"},
    "IN_PROGRESS": {"SUBMITTED", "CANCELLED"},
    "SUBMITTED": {"UNDER_REVIEW", "CHANGES_REQUESTED", "CANCELLED"},
    "UNDER_REVIEW": {"CHANGES_REQUESTED", "APPROVED", "CANCELLED"},
    "CHANGES_REQUESTED": {"SUBMITTED", "CANCELLED"},
    "APPROVED": {"PAID", "PAYMENT_FAILED", "CANCELLED"},
    "PAYMENT_FAILED": {"PAYMENT_AUTHORIZED", "PAID", "CANCELLED"},
    "PAID": set(),
    "CANCELLED": set(),
}


def validate_status_transition(current_status: str, new_status: str) -> None:
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=409,
            detail=f"Unknown status: {new_status}"
        )
    allowed = ALLOWED_TRANSITIONS.get(current_status, set())
    if new_status not in allowed:
        raise HTTPException(
            status_code=409,
            detail=f"Invalid status transition from {current_status} to {new_status}"
        )

