"""Email endpoints for coordinators."""
from typing import Annotated

from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.api.deps import get_db, get_current_coordinator
from app.models.user import User
from app.models.mentee import MenteeProfile
from app.services.email_service import email_service

router = APIRouter()


class BulkEmailRequest(BaseModel):
    subject: str
    message: str  # HTML content
    recipient_type: str  # "all", "track", "selected"
    track: str | None = None  # Required if recipient_type is "track"
    mentee_ids: list[int] | None = None  # Required if recipient_type is "selected"


class BulkEmailResponse(BaseModel):
    message: str
    recipient_count: int


async def send_bulk_emails(
    recipients: list[tuple[str, str]],  # List of (email, name)
    subject: str,
    html_content: str,
):
    """Background task to send emails to multiple recipients."""
    for email, name in recipients:
        # Personalize the email
        personalized_html = html_content.replace("{{name}}", name)
        personalized_text = f"Hi {name},\n\n{html_content}"

        await email_service.send_email(
            to_email=email,
            subject=subject,
            html_content=f"""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                    .header {{ background: linear-gradient(135deg, #1B4F72, #2E86C1); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                    .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }}
                    .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">{subject}</h1>
                    </div>
                    <div class="content">
                        <p>Hi {name},</p>
                        {personalized_html}
                    </div>
                    <div class="footer">
                        <p>Kings Patriots Development Foundation</p>
                    </div>
                </div>
            </body>
            </html>
            """,
            text_content=personalized_text,
        )


@router.post("/send", response_model=BulkEmailResponse)
async def send_bulk_email(
    request: BulkEmailRequest,
    background_tasks: BackgroundTasks,
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Send bulk email to mentees."""
    # Build query based on recipient type
    query = select(MenteeProfile).options(selectinload(MenteeProfile.user))

    if request.recipient_type == "track" and request.track:
        query = query.where(MenteeProfile.track == request.track)
    elif request.recipient_type == "selected" and request.mentee_ids:
        query = query.where(MenteeProfile.id.in_(request.mentee_ids))
    # "all" doesn't need additional filtering

    result = await db.execute(query)
    mentees = result.scalars().all()

    # Collect recipients
    recipients: list[tuple[str, str]] = []
    for mentee in mentees:
        if mentee.user and mentee.user.email:
            recipients.append((mentee.user.email, mentee.full_name))

    if not recipients:
        return BulkEmailResponse(
            message="No recipients found",
            recipient_count=0,
        )

    # Send emails in background
    background_tasks.add_task(
        send_bulk_emails,
        recipients,
        request.subject,
        request.message,
    )

    return BulkEmailResponse(
        message=f"Sending emails to {len(recipients)} recipients",
        recipient_count=len(recipients),
    )


@router.get("/tracks")
async def get_tracks(
    current_user: Annotated[User, Depends(get_current_coordinator)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Get list of unique tracks for filtering."""
    result = await db.execute(
        select(MenteeProfile.track).distinct().where(MenteeProfile.track.isnot(None))
    )
    tracks = [row[0] for row in result.all() if row[0]]
    return {"tracks": sorted(tracks)}
