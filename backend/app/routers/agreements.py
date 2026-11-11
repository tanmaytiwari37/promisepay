from fastapi import APIRouter

router = APIRouter(prefix="/agreements", tags=["agreements"])


@router.post("/")
def create_agreement_stub():
    return {"message": "TODO: Implement create agreement endpoint"}

