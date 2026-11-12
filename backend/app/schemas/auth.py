from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    email: str
    password: str
    name: Optional[str] = None
    role: str = "customer"  # customer | freelancer


class UserLogin(BaseModel):
    email: str
    password: str


class GoogleLogin(BaseModel):
    id_token: str            # Firebase ID token from the browser
    role: str = "customer"   # only used when the account is created the first time


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
