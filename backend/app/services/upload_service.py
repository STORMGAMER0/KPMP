"""File upload service for handling profile pictures and other uploads."""
import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config import get_settings

settings = get_settings()

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}


class UploadError(Exception):
    """Raised when file upload fails."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(message)


async def save_profile_picture(file: UploadFile, user_id: int) -> str:
    """
    Save an uploaded profile picture and return its URL path.

    Args:
        file: The uploaded file
        user_id: The user ID (used for organizing files)

    Returns:
        The URL path to access the uploaded file

    Raises:
        UploadError: If the file is invalid or upload fails
    """
    # Validate file type
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise UploadError(
            f"Invalid file type. Allowed types: {', '.join(ALLOWED_IMAGE_TYPES)}"
        )

    # Validate file extension
    original_filename = file.filename or "image.jpg"
    ext = Path(original_filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise UploadError(
            f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Read file content
    content = await file.read()

    # Check file size (in bytes)
    max_size = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_size:
        raise UploadError(
            f"File too large. Maximum size: {settings.max_upload_size_mb}MB"
        )

    # Generate unique filename
    unique_id = uuid.uuid4().hex[:12]
    filename = f"profile_{user_id}_{unique_id}{ext}"

    # Save file
    profiles_dir = Path(settings.upload_dir) / "profiles"
    profiles_dir.mkdir(parents=True, exist_ok=True)

    file_path = profiles_dir / filename

    # Delete old profile picture if exists
    for old_file in profiles_dir.glob(f"profile_{user_id}_*"):
        try:
            old_file.unlink()
        except OSError:
            pass  # Ignore errors deleting old files

    # Write new file
    with open(file_path, "wb") as f:
        f.write(content)

    # Return URL path (relative to static mount)
    return f"/static/profiles/{filename}"


def delete_profile_picture(url_path: str) -> bool:
    """
    Delete a profile picture by its URL path.

    Args:
        url_path: The URL path returned from save_profile_picture

    Returns:
        True if deleted, False if not found
    """
    if not url_path or not url_path.startswith("/static/profiles/"):
        return False

    filename = url_path.replace("/static/profiles/", "")
    file_path = Path(settings.upload_dir) / "profiles" / filename

    try:
        if file_path.exists():
            file_path.unlink()
            return True
    except OSError:
        pass

    return False
