from fastapi import APIRouter

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("/")
def list_projects_stub():
    return {"message": "TODO: Implement list projects endpoint"}

