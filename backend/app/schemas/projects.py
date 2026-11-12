from pydantic import BaseModel
from typing import Optional, Any, Dict, List
from datetime import datetime


class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    budget: float = 0.0
    currency: str = "USD"
    deadline: Optional[str] = None


class ProjectResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    budget: float
    currency: str
    deadline: Optional[str]
    status: str
    customer_id: int
    freelancer_id: Optional[int]
    freelancer_email: Optional[str] = None
    freelancer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AssignFreelancer(BaseModel):
    email: str


class AgreementResponse(BaseModel):
    id: int
    project_id: int
    deliverables: Optional[Any]
    acceptance_criteria: Optional[Any]
    amount: float
    deadline: Optional[str]
    version: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AgreementUpdate(BaseModel):
    deliverables: Optional[Any] = None
    acceptance_criteria: Optional[Any] = None
    amount: Optional[float] = None
    deadline: Optional[str] = None


class ReviewDecision(BaseModel):
    decision: str  # approve | request_changes
    comment: Optional[str] = None


class DashboardSummary(BaseModel):
    total_projects: int
    status_counts: Dict[str, int]


class ApprovalSummary(BaseModel):
    project_id: int
    project_title: str
    approval_type: str
    customer_approved: bool
    freelancer_approved: bool
    pending_from: Optional[str]  # "customer" | "freelancer" | "both" | None
    overall_status: str  # "approved" | "pending"
    customer_approved_at: Optional[datetime]
    freelancer_approved_at: Optional[datetime]

    class Config:
        from_attributes = True

