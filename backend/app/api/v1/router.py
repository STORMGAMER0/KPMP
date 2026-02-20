from fastapi import APIRouter

from app.api.v1 import auth, mentee, session, attendance, telegram, leaderboard, admin, dashboard, email

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(mentee.router, prefix="/mentees", tags=["Mentees"])
api_router.include_router(session.router, prefix="/sessions", tags=["Sessions"])
api_router.include_router(attendance.router, prefix="/attendance", tags=["Attendance"])
api_router.include_router(telegram.router, prefix="/telegram", tags=["Telegram"])
api_router.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
api_router.include_router(admin.router, prefix="/admin", tags=["Admin"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
api_router.include_router(email.router, prefix="/email", tags=["Email"])
