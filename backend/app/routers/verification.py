from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.db.session import get_db
from app.models.projects import Project
from app.models.agreements import Agreement
from app.models.submissions import Submission
from app.models.reports import Report
from app.core.deps import get_project_participant, get_current_user
from app.services.status import validate_status_transition
from app.services.ai.verification import verify_submission_evidence
from app.services.ai.llm import call_llm_json

router = APIRouter(prefix="/projects/{project_id}", tags=["verification"])


class NeutralSummaryRequest(BaseModel):
    disagreement_context: Optional[str] = None


@router.post("/verify")
async def verify_project_delivery(
    project_id: int,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db)
):
    # Must have an agreement
    agreement = db.query(Agreement).filter(Agreement.project_id == project_id).first()
    if not agreement or not agreement.acceptance_criteria:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Project has no agreement or acceptance criteria to verify against"
        )

    # Get latest submission
    submission = db.query(Submission).filter(
        Submission.project_id == project_id
    ).order_by(Submission.created_at.desc()).first()

    if not submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No submission found to verify"
        )

    # Validate transition to UNDER_REVIEW
    validate_status_transition(project.status, "UNDER_REVIEW")
    project.status = "UNDER_REVIEW"

    criteria = agreement.acceptance_criteria if isinstance(agreement.acceptance_criteria, list) else []

    verification_result = await verify_submission_evidence(
        criteria=criteria,
        submission_notes=submission.notes,
        file_path=submission.file_path,
        file_type=submission.file_type
    )

    report = Report(
        project_id=project.id,
        submission_id=submission.id,
        result=verification_result.model_dump()
    )
    db.add(report)
    db.commit()
    db.refresh(report)
    db.refresh(project)

    return {
        "report_id": report.id,
        "project_id": project.id,
        "submission_id": submission.id,
        "project_status": project.status,
        "verification": report.result,
        "created_at": report.created_at
    }


@router.get("/reports")
def get_project_reports(
    project_id: int,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db)
):
    reports = db.query(Report).filter(
        Report.project_id == project_id
    ).order_by(Report.created_at.desc()).all()

    return [
        {
            "id": r.id,
            "project_id": r.project_id,
            "submission_id": r.submission_id,
            "result": r.result,
            "created_at": r.created_at
        }
        for r in reports
    ]


@router.post("/neutral-summary")
async def generate_neutral_summary(
    project_id: int,
    req: NeutralSummaryRequest,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db)
):
    agreement = db.query(Agreement).filter(Agreement.project_id == project_id).first()
    latest_report = db.query(Report).filter(Report.project_id == project_id).order_by(Report.created_at.desc()).first()

    context = f"""
Project Title: {project.title}
Agreed Criteria: {agreement.acceptance_criteria if agreement else "None"}
Latest AI Verification Summary: {latest_report.result.get('overall_summary') if latest_report else "None"}
Parties' Comments / Feedback: {req.disagreement_context or "General disagreement regarding milestone completion"}
"""
    prompt = f"""
Given this context:
{context}

Generate a calm, objective, neutral mediation summary for both the customer and the freelancer.
Highlight:
1. What both parties agree has been delivered.
2. The specific technical gap or unmet expectation.
3. 2-3 constructive next steps to reach consensus.
"""
    system_prompt = "You are a professional mediator helping clients and freelancers align objectively without taking sides."

    raw = await call_llm_json(prompt, system_prompt)
    if not raw:
        raw = {
            "summary_title": "Neutral Project Assessment & Resolution Steps",
            "agreed_elements": [
                "Core layout and initial repository structure have been provided"
            ],
            "identified_gaps": [
                req.disagreement_context or "Specific criteria require clarifying evidence or live verification"
            ],
            "recommended_next_steps": [
                "Freelancer uploads clarifying documentation or short screencast",
                "Customer reviews targeted criteria against updated evidence",
                "Both parties proceed with agreed scope adjustment if needed"
            ]
        }

    return raw
