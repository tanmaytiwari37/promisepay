from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.users import User
from app.models.projects import Project
from app.schemas.projects import DashboardSummary
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
