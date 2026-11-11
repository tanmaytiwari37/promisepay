from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from app.db.session import get_db
from app.models.users import User
from app.models.projects import Project
from app.models.agreements import Agreement
from app.models.payments import Payment
from app.core.deps import get_current_user, get_project_participant
from app.services.status import validate_status_transition
from app.services.paypal import orders as paypal_orders

router = APIRouter(tags=["payments"])


@router.get("/payments")
def list_my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user_projects = db.query(Project.id).filter(
        (Project.customer_id == current_user.id) | (Project.freelancer_id == current_user.id)
    ).all()
    project_ids = [p[0] for p in user_projects]

    payments = db.query(Payment).filter(
        Payment.project_id.in_(project_ids)
    ).order_by(Payment.created_at.desc()).all()

    return [
        {
            "id": p.id,
            "project_id": p.project_id,
            "paypal_order_id": p.paypal_order_id,
            "authorization_id": p.authorization_id,
            "capture_id": p.capture_id,
            "amount": p.amount,
            "currency": p.currency,
            "status": p.status,
            "mode": p.mode,
            "created_at": p.created_at
        }
        for p in payments
    ]


@router.post("/projects/{project_id}/payment/create-order")
async def create_project_order(
    project_id: int,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if project.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project customer can create payment orders"
        )
    if project.status != "AGREED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot create payment order: project must be AGREED (current status: {project.status})"
        )

    agreement = db.query(Agreement).filter(Agreement.project_id == project_id).first()
    amount = agreement.amount if agreement else project.budget
    currency = project.currency or "USD"

    # Reuse existing pending payment or create new
    existing_payment = db.query(Payment).filter(
        Payment.project_id == project_id,
        Payment.status.in_(["CREATED", "PAYMENT_AUTHORIZED"])
    ).first()

    if existing_payment and existing_payment.paypal_order_id:
        return {
            "order_id": existing_payment.paypal_order_id,
            "approval_url": f"https://www.sandbox.paypal.com/checkoutnow?token={existing_payment.paypal_order_id}",
            "amount": existing_payment.amount,
            "currency": existing_payment.currency,
            "status": existing_payment.status,
            "mode": existing_payment.mode
        }

    idempotency_key = f"promisepay-pid-{project_id}"
    order_data = await paypal_orders.create_order(
        project_id=project.id,
        amount=amount,
        currency=currency,
        idempotency_key=idempotency_key
    )

    payment = Payment(
        project_id=project.id,
        paypal_order_id=order_data["order_id"],
        amount=amount,
        currency=currency,
        status="CREATED",
        mode=order_data.get("mode", "mock"),
        idempotency_key=idempotency_key
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return {
        "order_id": payment.paypal_order_id,
        "approval_url": order_data.get("approval_url"),
        "amount": payment.amount,
        "currency": payment.currency,
        "status": payment.status,
        "mode": payment.mode
    }


@router.post("/projects/{project_id}/payment/authorize")
async def authorize_project_payment(
    project_id: int,
    start_work: bool = True,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if project.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the customer can authorize payments"
        )

    payment = db.query(Payment).filter(
        Payment.project_id == project_id
    ).order_by(Payment.created_at.desc()).first()

    if not payment or not payment.paypal_order_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No PayPal order found to authorize. Please create order first."
        )

    auth_data = await paypal_orders.authorize_order(payment.paypal_order_id)
    payment.authorization_id = auth_data["authorization_id"]
    payment.status = "PAYMENT_AUTHORIZED"

    # Status transition
    validate_status_transition(project.status, "PAYMENT_AUTHORIZED")
    project.status = "PAYMENT_AUTHORIZED"

    if start_work:
        validate_status_transition(project.status, "IN_PROGRESS")
        project.status = "IN_PROGRESS"

    db.commit()
    db.refresh(payment)
    db.refresh(project)

    return {
        "authorization_id": payment.authorization_id,
        "payment_status": payment.status,
        "project_status": project.status,
        "amount": payment.amount,
        "currency": payment.currency,
        "mode": payment.mode
    }


@router.post("/projects/{project_id}/payment/capture")
async def capture_project_payment(
    project_id: int,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if project.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the customer can capture payments"
        )

    payment = db.query(Payment).filter(
        Payment.project_id == project_id
    ).order_by(Payment.created_at.desc()).first()

    if not payment or not payment.authorization_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="No authorized payment exists to capture"
        )

    # Idempotent capture: if already captured, return stored capture and never call PayPal again
    if payment.capture_id and payment.status == "PAID":
        return {
            "capture_id": payment.capture_id,
            "payment_status": payment.status,
            "project_status": project.status,
            "amount": payment.amount,
            "currency": payment.currency,
            "mode": payment.mode
        }

    # Strict check: project must be APPROVED
    if project.status != "APPROVED":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot capture payment: project must be in 'APPROVED' status (current status: {project.status})"
        )

    capture_data = await paypal_orders.capture_authorization(payment.authorization_id)

    validate_status_transition(project.status, "PAID")
    project.status = "PAID"
    payment.capture_id = capture_data.get("capture_id")
    payment.status = "PAID"

    db.commit()
    db.refresh(payment)
    db.refresh(project)

    return {
        "capture_id": payment.capture_id,
        "payment_status": payment.status,
        "project_status": project.status,
        "amount": payment.amount,
        "currency": payment.currency,
        "mode": payment.mode
    }


@router.post("/projects/{project_id}/payment/cancel")
async def cancel_project_payment(
    project_id: int,
    reason: Optional[str] = None,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if project.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the customer can cancel the project payment"
        )

    validate_status_transition(project.status, "CANCELLED")
    project.status = "CANCELLED"

    payment = db.query(Payment).filter(
        Payment.project_id == project_id
    ).order_by(Payment.created_at.desc()).first()

    mode = "mock"
    if payment:
        payment.status = "CANCELLED"
        mode = payment.mode

    db.commit()
    db.refresh(project)

    return {
        "project_id": project.id,
        "status": project.status,
        "mode": mode,
        "detail": reason or "Payment authorization cancelled by customer"
    }
