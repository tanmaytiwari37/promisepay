from fastapi import APIRouter

router = APIRouter(prefix="/verification", tags=["verification"])


@router.post("/verify")
def verify_submission_stub():
    return {"message": "TODO: Implement AI delivery verification endpoint"}

