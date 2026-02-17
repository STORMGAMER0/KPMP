"""Email service for sending notifications."""
import logging
from datetime import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

import aiosmtplib

from app.config import get_settings

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending email notifications."""

    @property
    def _settings(self):
        """Get fresh settings each time."""
        return get_settings()

    @property
    def host(self):
        return self._settings.smtp_host

    @property
    def port(self):
        return self._settings.smtp_port

    @property
    def user(self):
        return self._settings.smtp_user

    @property
    def password(self):
        return self._settings.smtp_password

    @property
    def from_email(self):
        return self._settings.smtp_user or "noreply@kpdf.org"

    def _is_configured(self) -> bool:
        """Check if email is properly configured."""
        return bool(self.user and self.password)

    async def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: str | None = None,
    ) -> bool:
        """
        Send an email.

        Returns True if sent successfully, False otherwise.
        """
        if not self._is_configured():
            logger.warning(
                "Email not configured. SMTP_USER=%s, SMTP_PASSWORD=%s",
                self.user,
                "***" if self.password else "NOT SET"
            )
            return False

        logger.info(
            "Attempting to send email to %s via %s:%s",
            to_email, self.host, self.port
        )

        try:
            message = MIMEMultipart("alternative")
            message["From"] = self.from_email
            message["To"] = to_email
            message["Subject"] = subject

            # Add plain text version (fallback)
            if text_content:
                message.attach(MIMEText(text_content, "plain"))

            # Add HTML version
            message.attach(MIMEText(html_content, "html"))

            await aiosmtplib.send(
                message,
                hostname=self.host,
                port=self.port,
                username=self.user,
                password=self.password,
                start_tls=True,
            )

            logger.info("Email sent successfully to %s", to_email)
            return True

        except Exception as e:
            logger.error("Failed to send email to %s: %s", to_email, str(e), exc_info=True)
            return False

    async def send_session_reminder_24h(
        self,
        to_email: str,
        mentee_name: str,
        session_title: str,
        session_date: datetime,
        session_time: str,
        google_meet_link: str | None = None,
    ) -> bool:
        """Send 24-hour session reminder."""
        subject = f"Reminder: {session_title} - Tomorrow"

        date_str = session_date.strftime("%A, %B %d, %Y")

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #1B4F72, #2E86C1); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }}
                .session-box {{ background: white; padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2E86C1; }}
                .btn {{ display: inline-block; background: #1B4F72; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Session Reminder</h1>
                </div>
                <div class="content">
                    <p>Hi {mentee_name},</p>
                    <p>This is a friendly reminder that you have an upcoming session <strong>tomorrow</strong>!</p>

                    <div class="session-box">
                        <h3 style="margin-top: 0; color: #1B4F72;">{session_title}</h3>
                        <p><strong>Date:</strong> {date_str}</p>
                        <p><strong>Time:</strong> {session_time}</p>
                    </div>

                    {f'<a href="{google_meet_link}" class="btn">Join Google Meet</a>' if google_meet_link else ''}

                    <p style="margin-top: 20px;">Please make sure to:</p>
                    <ul>
                        <li>Join on time</li>
                        <li>Have a stable internet connection</li>
                        <li>Be ready with the attendance code when it's shared</li>
                    </ul>

                    <p>See you there!</p>
                </div>
                <div class="footer">
                    <p>Kings Patriots Development Foundation</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
Hi {mentee_name},

This is a friendly reminder that you have an upcoming session tomorrow!

Session: {session_title}
Date: {date_str}
Time: {session_time}
{f"Join: {google_meet_link}" if google_meet_link else ""}

Please make sure to join on time and be ready with the attendance code when it's shared.

See you there!

Kings Patriots Development Foundation
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_session_reminder_30min(
        self,
        to_email: str,
        mentee_name: str,
        session_title: str,
        google_meet_link: str | None = None,
    ) -> bool:
        """Send 30-minute session reminder."""
        subject = f"Starting Soon: {session_title} - In 30 Minutes!"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #e74c3c, #c0392b); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }}
                .alert {{ background: #fff3cd; border: 1px solid #ffc107; padding: 15px; border-radius: 8px; margin: 15px 0; }}
                .btn {{ display: inline-block; background: #e74c3c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Session Starting Soon!</h1>
                </div>
                <div class="content">
                    <p>Hi {mentee_name},</p>

                    <div class="alert">
                        <strong>{session_title}</strong> is starting in <strong>30 minutes</strong>!
                    </div>

                    {f'<a href="{google_meet_link}" class="btn">Join Now</a>' if google_meet_link else ''}

                    <p style="margin-top: 20px;">Get ready to join and don't forget to enter the attendance code when it's shared!</p>
                </div>
                <div class="footer">
                    <p>Kings Patriots Development Foundation</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
Hi {mentee_name},

{session_title} is starting in 30 minutes!

{f"Join here: {google_meet_link}" if google_meet_link else ""}

Get ready to join and don't forget to enter the attendance code when it's shared!

Kings Patriots Development Foundation
        """

        return await self.send_email(to_email, subject, html_content, text_content)

    async def send_attendance_summary(
        self,
        to_email: str,
        mentee_name: str,
        session_title: str,
        status: str,
        joined_at: datetime | None = None,
    ) -> bool:
        """Send attendance summary after session."""
        status_emoji = "✅" if status == "PRESENT" else "⚠️" if status == "PARTIAL" else "❌"
        status_text = {
            "PRESENT": "Present - Great job!",
            "PARTIAL": "Partial - You joined but didn't submit the attendance code",
            "ABSENT": "Absent - You missed this session",
        }.get(status, status)

        subject = f"Attendance Summary: {session_title}"

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #1B4F72, #2E86C1); color: white; padding: 20px; border-radius: 8px 8px 0 0; }}
                .content {{ background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 8px 8px; }}
                .status-box {{ background: white; padding: 20px; border-radius: 8px; margin: 15px 0; text-align: center; }}
                .status {{ font-size: 24px; font-weight: bold; }}
                .present {{ color: #27ae60; }}
                .partial {{ color: #f39c12; }}
                .absent {{ color: #e74c3c; }}
                .footer {{ text-align: center; margin-top: 20px; color: #666; font-size: 12px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1 style="margin: 0;">Attendance Summary</h1>
                </div>
                <div class="content">
                    <p>Hi {mentee_name},</p>
                    <p>Here's your attendance summary for <strong>{session_title}</strong>:</p>

                    <div class="status-box">
                        <p style="font-size: 48px; margin: 0;">{status_emoji}</p>
                        <p class="status {status.lower()}">{status_text}</p>
                        {f"<p>Joined at: {joined_at.strftime('%I:%M %p')}</p>" if joined_at else ""}
                    </div>

                    <p>Keep up your attendance to maintain a good score in the program!</p>
                </div>
                <div class="footer">
                    <p>Kings Patriots Development Foundation</p>
                </div>
            </div>
        </body>
        </html>
        """

        text_content = f"""
Hi {mentee_name},

Here's your attendance summary for {session_title}:

Status: {status_text}
{f"Joined at: {joined_at.strftime('%I:%M %p')}" if joined_at else ""}

Keep up your attendance to maintain a good score in the program!

Kings Patriots Development Foundation
        """

        return await self.send_email(to_email, subject, html_content, text_content)


# Singleton instance
email_service = EmailService()
