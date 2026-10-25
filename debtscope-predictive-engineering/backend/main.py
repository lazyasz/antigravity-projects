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
from backend.services.storage_client import R2StorageClient
from backend.api.routes import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.
    Syncs R2 cloud storage artifacts, initializes database schema, and seeds demo data.
    """
    # 1. Sync Cloudflare R2 / S3 Lakehouse artifacts if configured
    try:
        r2_client = R2StorageClient()
        r2_client.sync_startup_artifacts()
    except Exception as e:
        print(f"[-] R2 startup sync note: {e}")

    # 2. Initialize DB schema
    init_db()

    # 3. Seed demo and Apache Lakehouse data for out-of-the-box demonstration
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
allowed_origins = list(set(settings.ALLOWED_ORIGINS + [settings.FRONTEND_URL]))
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
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

@app.get("/api/info", tags=["System"])
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
# Mount Primary API Router (supports /api/v1, /api, and root endpoints)
# ---------------------------------------------------------
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(api_router, prefix="/api")
app.include_router(api_router)

# ---------------------------------------------------------
# Serve Compiled Frontend SPA (Production Static Files)
# ---------------------------------------------------------
import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

candidate_paths = [
    os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")),
    os.path.abspath(os.path.join(os.getcwd(), "frontend", "dist")),
    "/app/frontend/dist",
]
frontend_dist = next((p for p in candidate_paths if os.path.exists(p)), None)

if frontend_dist and os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_spa(full_path: str):
        # Don't intercept API routes or documentation
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("openapi.json") or full_path.startswith("redoc"):
            raise HTTPException(status_code=404, detail="Not Found")
        
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        
        index_html = os.path.join(frontend_dist, "index.html")
        if os.path.isfile(index_html):
            return FileResponse(index_html)
        raise HTTPException(status_code=404, detail="Frontend build not found")



if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)

