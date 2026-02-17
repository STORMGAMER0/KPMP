import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.core.exceptions import AppError
from app.api.v1.router import api_router
from app.services.scheduler_service import setup_scheduler, start_scheduler, stop_scheduler

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)

settings = get_settings()

# Ensure upload directories exist
uploads_dir = Path(settings.upload_dir)
profiles_dir = uploads_dir / "profiles"
profiles_dir.mkdir(parents=True, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    setup_scheduler()
    start_scheduler()
    logging.info("Application started with scheduler")
    yield
    # Shutdown
    stop_scheduler()
    logging.info("Application shutdown")


app = FastAPI(
    title="KPDF Mentorship Platform API",
    description="API for the Kings Patriots Development Foundation mentorship program",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Global exception handler for domain errors
@app.exception_handler(AppError)
async def app_error_handler(request: Request, exc: AppError):
    status_map = {
        "NOT_FOUND": 404,
        "ALREADY_EXISTS": 409,
        "INVALID_CREDENTIALS": 401,
        "INACTIVE_ACCOUNT": 403,
        "INVALID_TOKEN": 401,
        "PERMISSION_DENIED": 403,
        "CODE_WINDOW_CLOSED": 422,
        "INVALID_CODE": 400,
        "NOT_JOINED": 400,
        "ALREADY_PRESENT": 400,
        "ALREADY_JOINED": 400,
        "INVALID_CURRENT_PASSWORD": 400,
        "PASSWORD_RESET_REQUIRED": 403,
        "PASSWORD_RESET_NOT_REQUIRED": 400,
        "CSV_IMPORT_ERROR": 400,
    }
    return JSONResponse(
        status_code=status_map.get(exc.code, 400),
        content={"error": exc.code, "message": exc.message},
    )


# Include API router
app.include_router(api_router, prefix="/api/v1")

# Mount static files for uploaded content
app.mount("/static", StaticFiles(directory=settings.upload_dir), name="static")


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
