import os
import re
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.models.users import User
from app.models.projects import Project
from app.models.submissions import Submission
from app.core.config import settings
from app.core.deps import get_current_user, get_project_participant
from app.services.status import validate_status_transition

router = APIRouter(prefix="/projects/{project_id}/submissions", tags=["submissions"])

ALLOWED_EXTENSIONS = {"pdf", "txt", "md", "png", "jpg", "jpeg", "zip"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


def sanitize_filename(filename: str) -> str:
    base = os.path.basename(filename)
    safe = re.sub(r"[^\w\.-]", "_", base)
    return safe


@router.post("", status_code=status.HTTP_201_CREATED)
async def submit_work(
    project_id: int,
    notes: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if project.freelancer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the assigned freelancer can submit work for this project"
        )

    file_path = None
    file_name = None
    file_type = None

    if file:
        original_name = file.filename or "upload"
        ext = original_name.split(".")[-1].lower() if "." in original_name else ""
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File extension '.{ext}' not allowed. Allowed types: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
            )

        contents = await file.read()
        if len(contents) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File exceeds maximum allowed size of 10 MB"
            )

        safe_name = sanitize_filename(original_name)
        target_dir = os.path.join(settings.UPLOAD_DIR, str(project_id))
        os.makedirs(target_dir, exist_ok=True)
        dest_path = os.path.join(target_dir, safe_name)

        with open(dest_path, "wb") as f:
            f.write(contents)

        file_path = dest_path
        file_name = safe_name
        file_type = ext

    validate_status_transition(project.status, "SUBMITTED")
    project.status = "SUBMITTED"

    submission = Submission(
        project_id=project.id,
        freelancer_id=current_user.id,
        notes=notes,
        file_path=file_path,
        file_name=file_name,
        file_type=file_type
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    db.refresh(project)

    return {
        "id": submission.id,
        "project_id": submission.project_id,
        "freelancer_id": submission.freelancer_id,
        "notes": submission.notes,
        "file_name": submission.file_name,
        "file_type": submission.file_type,
        "status": project.status,
        "created_at": submission.created_at
    }


@router.get("")
def list_submissions(
    project_id: int,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db)
):
    submissions = db.query(Submission).filter(
        Submission.project_id == project_id
    ).order_by(Submission.created_at.desc()).all()

    return [
        {
            "id": s.id,
            "project_id": s.project_id,
            "freelancer_id": s.freelancer_id,
            "notes": s.notes,
            "file_name": s.file_name,
            "file_type": s.file_type,
            "created_at": s.created_at
        }
        for s in submissions
    ]


@router.get("/{submission_id}/download")
def download_submission_file(
    project_id: int,
    submission_id: int,
    project: Project = Depends(get_project_participant),
    db: Session = Depends(get_db)
):
    submission = db.query(Submission).filter(
        Submission.id == submission_id,
        Submission.project_id == project_id
    ).first()

    if not submission or not submission.file_path or not os.path.exists(submission.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Submission file not found"
        )

    return FileResponse(
        path=submission.file_path,
        filename=submission.file_name,
        media_type="application/octet-stream"
    )
