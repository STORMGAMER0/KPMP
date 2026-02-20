"""
Telegram Bot Service - handles bot configuration and webhook setup.
"""
import logging
import httpx

from app.config import get_settings

logger = logging.getLogger(__name__)

TELEGRAM_API_BASE = "https://api.telegram.org/bot"


async def setup_telegram_webhook() -> bool:
    """
    Register the webhook URL with Telegram.
    Called automatically on server startup.

    Returns True if successful, False otherwise.
    """
    settings = get_settings()

    # Check if Telegram is configured
    if not settings.telegram_bot_token:
        logger.info("Telegram bot token not configured, skipping webhook setup")
        return False

    if not settings.webhook_base_url:
        logger.warning("WEBHOOK_BASE_URL not configured, skipping Telegram webhook setup")
        return False

    # Build the webhook URL
    webhook_url = f"{settings.webhook_base_url.rstrip('/')}/api/v1/telegram/webhook"

    # Build Telegram API URL
    api_url = f"{TELEGRAM_API_BASE}{settings.telegram_bot_token}/setWebhook"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                api_url,
                json={
                    "url": webhook_url,
                    "secret_token": settings.telegram_webhook_secret or None,
                    "allowed_updates": ["message"],  # Only receive message updates
                }
            )

            result = response.json()

            if result.get("ok"):
                logger.info(f"Telegram webhook registered successfully: {webhook_url}")
                return True
            else:
                logger.error(f"Failed to register Telegram webhook: {result.get('description')}")
                return False

    except Exception as e:
        logger.error(f"Error setting up Telegram webhook: {e}")
        return False


async def get_webhook_info() -> dict | None:
    """Get current webhook info from Telegram."""
    settings = get_settings()

    if not settings.telegram_bot_token:
        return None

    api_url = f"{TELEGRAM_API_BASE}{settings.telegram_bot_token}/getWebhookInfo"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(api_url)
            result = response.json()

            if result.get("ok"):
                return result.get("result")
            return None
    except Exception:
        return None


async def delete_webhook() -> bool:
    """Remove the webhook (for switching to polling mode or cleanup)."""
    settings = get_settings()

    if not settings.telegram_bot_token:
        return False

    api_url = f"{TELEGRAM_API_BASE}{settings.telegram_bot_token}/deleteWebhook"

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(api_url)
            result = response.json()
            return result.get("ok", False)
    except Exception:
        return False
