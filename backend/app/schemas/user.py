from datetime import datetime
from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserBase(BaseModel):
    email: EmailStr
    role: UserRole


class UserResponse(UserBase):
    id: int
    is_active: bool
    must_reset_password: bool
    created_at: datetime

    class Config:
        from_attributes = True
