from pydantic import BaseModel, ConfigDict, EmailStr

from app.core.constants import UserRole


class LoginRequest(BaseModel):
    identifier: str  # email for coordinator, mentee_id for mentee
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    must_reset_password: bool


class RefreshRequest(BaseModel):
    refresh_token: str


class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str
    telegram_username: str | None = None  # Required for mentee first login


class PasswordResetRequest(BaseModel):
    new_password: str


class ForgotPasswordRequest(BaseModel):
    identifier: str  # email or mentee_id


class ResetPasswordWithTokenRequest(BaseModel):
    token: str
    new_password: str


class UserInfoResponse(BaseModel):
    id: int
    email: str
    role: UserRole
    must_reset_password: bool

    model_config = ConfigDict(from_attributes=True)
