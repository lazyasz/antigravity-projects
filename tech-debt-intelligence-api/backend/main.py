"""
Main FastAPI Application Entry Point.
Sets up middleware, global exception handlers, OpenAPI metadata, routes, and auto-seeding.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError

from backend.config import settings
from backend.database.connection import init_db, SessionLocal
from backend.services.seed_service import seed_database
from backend.api.routes import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Executes database table creation and demo data seeding on startup.
    """
    # Initialize DB schema
    init_db()

    # Seed demo data for out-of-the-box demonstration
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()

    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.PROJECT_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# Configure Cross-Origin Resource Sharing (CORS) for Frontend Integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------
# Global Exception Handlers for Robust Error Responses
# ---------------------------------------------------------

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Formats validation errors into clear, actionable client feedback."""
    errors = []
    for err in exc.errors():
        field_loc = " -> ".join([str(loc) for loc in err.get("loc", [])])
        errors.append({
            "field": field_loc,
            "message": err.get("msg"),
            "type": err.get("type"),
        })
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "error": "Validation Error",
            "message": "One or more input fields failed validation constraints (e.g., scores must be between 0 and 100).",
            "details": errors,
        },
    )


@app.exception_handler(SQLAlchemyError)
async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    """Catches database level exceptions gracefully."""
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "error": "Database Error",
            "message": "A transactional database error occurred while processing the request.",
            "detail": str(exc) if settings.DEBUG else "Internal database failure",
        },
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    """Standardizes HTTP error responses."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": "HTTP Error",
            "status_code": exc.status_code,
            "detail": exc.detail,
        },
    )


# ---------------------------------------------------------
# Root & Health Check Endpoints
# ---------------------------------------------------------

@app.get("/", tags=["System"])
def root():
    """Root metadata and platform summary."""
    return {
        "platform": settings.PROJECT_NAME,
        "version": settings.PROJECT_VERSION,
        "status": "operational",
        "documentation": "/docs",
        "swagger_redoc": "/redoc",
        "api_v1_prefix": settings.API_V1_STR,
    }


@app.get("/health", tags=["System"])
@app.get(f"{settings.API_V1_STR}/health", tags=["System"])
def health_check():
    """System health check and database connectivity verification."""
    db_status = "connected"
    try:
        db = SessionLocal()
        # Verify simple query execution
        db.execute(db.query(1).statement)
        db.close()
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "environment": settings.ENVIRONMENT,
        "version": settings.PROJECT_VERSION,
    }


# ---------------------------------------------------------
# Mount Primary API Router
# ---------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
