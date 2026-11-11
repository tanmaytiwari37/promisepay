from fastapi import APIRouter

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login")
def login_stub():
    return {"message": "TODO: Implement login and JWT token generation"}

