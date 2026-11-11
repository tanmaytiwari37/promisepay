from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.db.session import get_db
from app.models.users import User
from app.models.projects import Project
from app.models.agreements import Agreement
from app.models.approvals import Approval
from app.schemas.projects import (
    ProjectCreate,
    ProjectResponse,
    AssignFreelancer,
    AgreementResponse,
    AgreementUpdate,
)
from app.core.deps import get_current_user, get_project_participant
from app.services.status import validate_status_transition
from app.services.ai.agreement_generator import generate_agreement

router = APIRouter(prefix="/projects", tags=["projects"])


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "customer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can create projects"
        )
    project = Project(
        title=project_in.title,
        description=project_in.description,
        budget=project_in.budget,
        currency=project_in.currency,
        deadline=project_in.deadline,
        status="DRAFT",
        customer_id=current_user.id
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    agreement = Agreement(
        project_id=project.id,
        deliverables=[],
        acceptance_criteria=[],
        amount=project.budget,
        deadline=project.deadline,
        version=1
    )
    db.add(agreement)
    db.commit()
    return project


@router.get("", response_model=List[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).filter(
        (Project.customer_id == current_user.id) | (Project.freelancer_id == current_user.id)
    ).order_by(Project.created_at.desc()).all()
    return projects


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project: Project = Depends(get_project_participant)
):
    return project


@router.post("/{project_id}/assign-freelancer", response_model=ProjectResponse)
def assign_freelancer(
    assign_in: AssignFreelancer,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if project.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the project customer can assign a freelancer"
        )
    freelancer = db.query(User).filter(User.email == assign_in.email).first()
    if not freelancer:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Freelancer with email {assign_in.email} not found"
        )
    if freelancer.role != "freelancer":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assigned user must have the 'freelancer' role"
        )
    project.freelancer_id = freelancer.id
    db.commit()
    db.refresh(project)
    return project


@router.post("/{project_id}/submit-for-approval", response_model=ProjectResponse)
def submit_for_approval(
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if project.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the customer can submit the project for approval"
        )
    if not project.freelancer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A freelancer must be assigned before submitting for approval"
        )
    validate_status_transition(project.status, "PENDING_APPROVAL")
    project.status = "PENDING_APPROVAL"
    db.commit()
    db.refresh(project)
    return project


@router.post("/{project_id}/agreement/generate")
async def generate_project_agreement(
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db)
):
    agreement = db.query(Agreement).filter(Agreement.project_id == project.id).first()
    if not agreement:
        agreement = Agreement(
            project_id=project.id,
            amount=project.budget,
            deadline=project.deadline,
            version=1
        )
        db.add(agreement)
        db.commit()

    generated = await generate_agreement(
        description=project.description or project.title,
        budget=project.budget,
        deadline=project.deadline or ""
    )

    agreement.deliverables = [d.model_dump() for d in generated.deliverables]
    agreement.acceptance_criteria = [c.model_dump() for c in generated.acceptance_criteria]
    agreement.amount = generated.amount
    agreement.deadline = generated.deadline
    agreement.version += 1

    project.title = generated.title
    project.budget = generated.amount
    project.deadline = generated.deadline

    # Reset any approvals since terms were re-generated
    db.query(Approval).filter(
        Approval.project_id == project.id,
        Approval.type == "agreement"
    ).delete()

    db.commit()
    db.refresh(agreement)
    db.refresh(project)
    return generated


@router.get("/{project_id}/agreement", response_model=AgreementResponse)
def get_agreement(
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db)
):
    agreement = db.query(Agreement).filter(Agreement.project_id == project.id).first()
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agreement not found for this project"
        )
    return agreement


@router.put("/{project_id}/agreement", response_model=AgreementResponse)
def update_agreement(
    agreement_in: AgreementUpdate,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db)
):
    agreement = db.query(Agreement).filter(Agreement.project_id == project.id).first()
    if not agreement:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Agreement not found for this project"
        )
    if agreement_in.deliverables is not None:
        agreement.deliverables = agreement_in.deliverables
    if agreement_in.acceptance_criteria is not None:
        agreement.acceptance_criteria = agreement_in.acceptance_criteria
    if agreement_in.amount is not None:
        agreement.amount = agreement_in.amount
        project.budget = agreement_in.amount
    if agreement_in.deadline is not None:
        agreement.deadline = agreement_in.deadline
        project.deadline = agreement_in.deadline

    agreement.version += 1

    # Reset any existing approvals since terms were updated
    db.query(Approval).filter(
        Approval.project_id == project.id,
        Approval.type == "agreement"
    ).delete()

    db.commit()
    db.refresh(agreement)
    return agreement


@router.post("/{project_id}/agreement/approve")
def approve_agreement(
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if project.status not in ["DRAFT", "PENDING_APPROVAL"]:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot approve agreement when project status is {project.status}"
        )
    if not project.freelancer_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot approve agreement before freelancer is assigned"
        )

    approval = db.query(Approval).filter(
        Approval.project_id == project.id,
        Approval.user_id == current_user.id,
        Approval.type == "agreement"
    ).first()

    if not approval:
        approval = Approval(
            project_id=project.id,
            user_id=current_user.id,
            type="agreement",
            approved=True
        )
        db.add(approval)
        db.commit()

    # Check both parties
    customer_appr = db.query(Approval).filter(
        Approval.project_id == project.id,
        Approval.user_id == project.customer_id,
        Approval.type == "agreement",
        Approval.approved == True
    ).first()

    freelancer_appr = db.query(Approval).filter(
        Approval.project_id == project.id,
        Approval.user_id == project.freelancer_id,
        Approval.type == "agreement",
        Approval.approved == True
    ).first()

    both_approved = bool(customer_appr and freelancer_appr)
    if both_approved:
        validate_status_transition(project.status, "AGREED")
        project.status = "AGREED"
        db.commit()
        db.refresh(project)

    return {
        "project_id": project.id,
        "status": project.status,
        "user_approved": True,
        "both_approved": both_approved,
        "customer_approved": bool(customer_appr),
        "freelancer_approved": bool(freelancer_appr)
    }
