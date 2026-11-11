from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.users import User
from app.models.projects import Project
from app.models.payments import Payment
from app.core.deps import get_current_user

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
