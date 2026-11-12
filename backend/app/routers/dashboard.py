from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from app.db.session import get_db
from app.models.users import User
from app.models.projects import Project
from app.models.approvals import Approval
from app.schemas.projects import DashboardSummary, ApprovalSummary
from app.core.deps import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary", response_model=DashboardSummary)
def get_dashboard_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(
        (Project.customer_id == current_user.id) | (Project.freelancer_id == current_user.id)
    ).all()

    counts = {}
    for p in projects:
        counts[p.status] = counts.get(p.status, 0) + 1

    return {
        "total_projects": len(projects),
        "status_counts": counts
    }


@router.get("/pending-approvals", response_model=List[ApprovalSummary])
def get_pending_approvals(
    status: Optional[str] = Query(None, pattern="^(pending|approved)$"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get approval status for all projects where the current user is a participant.
    Returns a flat list suitable for AG Grid binding.
    """
    # Subquery to get agreement-type approvals per project per user
    approval_subq = db.query(
        Approval.project_id,
        Approval.user_id,
        Approval.approved,
        Approval.created_at
    ).filter(Approval.type == "agreement").subquery()

    # Get all projects where user is customer or freelancer
    projects_query = db.query(Project).filter(
        (Project.customer_id == current_user.id) | (Project.freelancer_id == current_user.id)
    )

    results = []
    for project in projects_query.all():
        # Fetch approvals for this project (customer and freelancer)
        customer_appr = db.query(approval_subq).filter(
            approval_subq.c.project_id == project.id,
            approval_subq.c.user_id == project.customer_id
        ).first()

        freelancer_appr = None
        if project.freelancer_id:
            freelancer_appr = db.query(approval_subq).filter(
                approval_subq.c.project_id == project.id,
                approval_subq.c.user_id == project.freelancer_id
            ).first()

        customer_approved = bool(customer_appr and customer_appr.approved)
        freelancer_approved = bool(freelancer_appr and freelancer_appr.approved)

        # Determine pending_from
        if customer_approved and freelancer_approved:
            pending_from = None
            overall_status = "approved"
        elif not customer_approved and not freelancer_approved:
            pending_from = "both"
            overall_status = "pending"
        elif not customer_approved:
            pending_from = "customer"
            overall_status = "pending"
        else:
            pending_from = "freelancer"
            overall_status = "pending"

        # Apply status filter
        if status and overall_status != status:
            continue

        results.append(ApprovalSummary(
            project_id=project.id,
            project_title=project.title,
            approval_type="agreement",
            customer_approved=customer_approved,
            freelancer_approved=freelancer_approved,
            pending_from=pending_from,
            overall_status=overall_status,
            customer_approved_at=customer_appr.created_at if customer_appr and customer_appr.approved else None,
            freelancer_approved_at=freelancer_appr.created_at if freelancer_appr and freelancer_appr.approved else None
        ))

    return results

