"""
Configuration module for Predictive Engineering Intelligence Platform.
Loads environment variables and provides centralized application settings.
"""

from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field


class Settings(BaseSettings):
    # App Information
    PROJECT_NAME: str = "Predictive Engineering Intelligence Platform"
    PROJECT_DESCRIPTION: str = (
        "Business-aware Decision Intelligence API for Technical Debt Prioritization"
    )
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database Configuration (SQLite default for MVP, PostgreSQL ready)
    DATABASE_URL: str = "sqlite:///./tech_debt_intelligence.db"

    # Security & CORS
    SECRET_KEY: str = "super-secret-key-change-in-production-2026"
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8000",
        "http://localhost:8501",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:8501",
        "*"
    ]

    # Priority Engine Weights (Configurable MVP defaults)
    WEIGHT_TECHNICAL_RISK: float = Field(default=0.35, ge=0.0, le=1.0)
    WEIGHT_BUSINESS_IMPACT: float = Field(default=0.30, ge=0.0, le=1.0)
    WEIGHT_RELEASE_URGENCY: float = Field(default=0.15, ge=0.0, le=1.0)
    WEIGHT_MAINTENANCE_COST: float = Field(default=0.10, ge=0.0, le=1.0)
    WEIGHT_DEBT_AGE: float = Field(default=0.10, ge=0.0, le=1.0)

    # Remediation Effort Impact Weight in Final Score
    WEIGHT_REMEDIATION_EFFORT: float = Field(default=0.15, ge=0.0, le=1.0)

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
