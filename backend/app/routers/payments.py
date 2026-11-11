from fastapi import APIRouter

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/orders")
def create_order_stub():
    return {"message": "TODO: Implement create PayPal order endpoint"}

