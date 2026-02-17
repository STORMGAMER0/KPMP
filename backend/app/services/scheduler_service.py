"""Scheduler service for automated tasks like email reminders."""
import logging
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.database import AsyncSessionLocal
from app.models.session import Session
from app.models.mentee import MenteeProfile
from app.models.attendance import Attendance
from app.core.constants import AttendanceStatus
from app.services.email_service import email_service

logger = logging.getLogger(__name__)

# Track which reminders have been sent to avoid duplicates
sent_reminders: dict[str, set[int]] = {
    "24h": set(),  # session_id set
    "30min": set(),  # session_id set
}


async def send_24h_reminders():
    """Send 24-hour reminder emails for upcoming sessions."""
    logger.info("Running 24h reminder check...")

    async with AsyncSessionLocal() as db:
        # Find sessions happening in ~24 hours (23-25 hour window)
        now = datetime.utcnow()
        window_start = now + timedelta(hours=23)
        window_end = now + timedelta(hours=25)

        result = await db.execute(
            select(Session).where(
                Session.date >= window_start.date(),
                Session.date <= window_end.date(),
            )
        )
        sessions = result.scalars().all()

        for session in sessions:
            # Combine date and time
            session_datetime = datetime.combine(session.date, session.start_time)

            # Check if within window
            if not (window_start <= session_datetime <= window_end):
                continue

            # Skip if already sent
            if session.id in sent_reminders["24h"]:
                continue

            # Get all mentees
            mentees_result = await db.execute(
                select(MenteeProfile).options(selectinload(MenteeProfile.user))
            )
            mentees = mentees_result.scalars().all()

            sent_count = 0
            for mentee in mentees:
                if mentee.user and mentee.user.email:
                    time_str = session.start_time.strftime("%I:%M %p")
                    if session.end_time:
                        time_str += f" - {session.end_time.strftime('%I:%M %p')}"

                    success = await email_service.send_session_reminder_24h(
                        to_email=mentee.user.email,
                        mentee_name=mentee.full_name,
                        session_title=session.title,
                        session_date=session_datetime,
                        session_time=time_str,
                        google_meet_link=session.google_meet_link,
                    )
                    if success:
                        sent_count += 1

            if sent_count > 0:
                sent_reminders["24h"].add(session.id)
                logger.info(
                    "Sent 24h reminders for session %s to %d mentees",
                    session.title,
                    sent_count,
                )


async def send_30min_reminders():
    """Send 30-minute reminder emails for upcoming sessions."""
    logger.info("Running 30min reminder check...")

    async with AsyncSessionLocal() as db:
        # Find sessions starting in ~30 minutes (25-35 min window)
        now = datetime.utcnow()
        window_start = now + timedelta(minutes=25)
        window_end = now + timedelta(minutes=35)

        result = await db.execute(
            select(Session).where(Session.date == now.date())
        )
        sessions = result.scalars().all()

        for session in sessions:
            # Combine date and time
            session_datetime = datetime.combine(session.date, session.start_time)

            # Check if within window
            if not (window_start <= session_datetime <= window_end):
                continue

            # Skip if already sent
            if session.id in sent_reminders["30min"]:
                continue

            # Get all mentees
            mentees_result = await db.execute(
                select(MenteeProfile).options(selectinload(MenteeProfile.user))
            )
            mentees = mentees_result.scalars().all()

            sent_count = 0
            for mentee in mentees:
                if mentee.user and mentee.user.email:
                    success = await email_service.send_session_reminder_30min(
                        to_email=mentee.user.email,
                        mentee_name=mentee.full_name,
                        session_title=session.title,
                        google_meet_link=session.google_meet_link,
                    )
                    if success:
                        sent_count += 1

            if sent_count > 0:
                sent_reminders["30min"].add(session.id)
                logger.info(
                    "Sent 30min reminders for session %s to %d mentees",
                    session.title,
                    sent_count,
                )


async def finalize_attendance():
    """Mark absent mentees after session ends and send attendance summaries."""
    logger.info("Running attendance finalization check...")

    async with AsyncSessionLocal() as db:
        # Find sessions that ended in the last hour
        now = datetime.utcnow()
        one_hour_ago = now - timedelta(hours=1)

        result = await db.execute(
            select(Session).where(Session.date == now.date())
        )
        sessions = result.scalars().all()

        for session in sessions:
            if not session.end_time:
                continue

            # Check if session ended within the last hour
            session_end = datetime.combine(session.date, session.end_time)
            if not (one_hour_ago <= session_end <= now):
                continue

            # Get all mentees
            mentees_result = await db.execute(
                select(MenteeProfile).options(selectinload(MenteeProfile.user))
            )
            mentees = mentees_result.scalars().all()

            # Get existing attendance records for this session
            attendance_result = await db.execute(
                select(Attendance).where(Attendance.session_id == session.id)
            )
            attendance_records = {a.mentee_id: a for a in attendance_result.scalars().all()}

            for mentee in mentees:
                attendance = attendance_records.get(mentee.id)

                if attendance:
                    # Send summary for existing attendance
                    if mentee.user and mentee.user.email:
                        await email_service.send_attendance_summary(
                            to_email=mentee.user.email,
                            mentee_name=mentee.full_name,
                            session_title=session.title,
                            status=attendance.status.value,
                            joined_at=attendance.joined_at,
                        )
                else:
                    # Create ABSENT record
                    absent_record = Attendance(
                        session_id=session.id,
                        mentee_id=mentee.id,
                        status=AttendanceStatus.ABSENT,
                    )
                    db.add(absent_record)

                    # Send absent notification
                    if mentee.user and mentee.user.email:
                        await email_service.send_attendance_summary(
                            to_email=mentee.user.email,
                            mentee_name=mentee.full_name,
                            session_title=session.title,
                            status="ABSENT",
                        )

            await db.commit()
            logger.info("Finalized attendance for session %s", session.title)


def clear_old_reminders():
    """Clear reminder tracking for old sessions (cleanup task)."""
    # This runs daily to prevent memory buildup
    # In production, you'd track this in the database instead
    sent_reminders["24h"].clear()
    sent_reminders["30min"].clear()
    logger.info("Cleared reminder tracking cache")


# Scheduler instance
scheduler = AsyncIOScheduler()


def setup_scheduler():
    """Configure and return the scheduler with all jobs."""
    # Check for 24h reminders every hour
    scheduler.add_job(
        send_24h_reminders,
        trigger=IntervalTrigger(hours=1),
        id="send_24h_reminders",
        name="Send 24-hour session reminders",
        replace_existing=True,
    )

    # Check for 30min reminders every 10 minutes
    scheduler.add_job(
        send_30min_reminders,
        trigger=IntervalTrigger(minutes=10),
        id="send_30min_reminders",
        name="Send 30-minute session reminders",
        replace_existing=True,
    )

    # Finalize attendance every 30 minutes
    scheduler.add_job(
        finalize_attendance,
        trigger=IntervalTrigger(minutes=30),
        id="finalize_attendance",
        name="Finalize session attendance",
        replace_existing=True,
    )

    # Clear old reminder cache daily
    scheduler.add_job(
        clear_old_reminders,
        trigger=IntervalTrigger(days=1),
        id="clear_old_reminders",
        name="Clear reminder cache",
        replace_existing=True,
    )

    return scheduler


def start_scheduler():
    """Start the scheduler."""
    if not scheduler.running:
        scheduler.start()
        logger.info("Scheduler started with %d jobs", len(scheduler.get_jobs()))


def stop_scheduler():
    """Stop the scheduler."""
    if scheduler.running:
        scheduler.shutdown()
        logger.info("Scheduler stopped")
