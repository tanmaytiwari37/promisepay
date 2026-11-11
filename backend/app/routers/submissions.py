from fastapi import APIRouter

router = APIRouter(prefix="/submissions", tags=["submissions"])


@router.post("/")
def submit_work_stub():
    return {"message": "TODO: Implement submit work endpoint"}

