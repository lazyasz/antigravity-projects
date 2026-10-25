"""
Pydantic schemas for Engineering Metrics and Technical Debt items.
Defines interfaces for Member 1 Data Pipeline ingestion.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class EngineeringMetricBase(BaseModel):
    cyclomatic_complexity: float = Field(default=1.0, ge=1.0, description="Cyclomatic complexity")
    cognitive_complexity: float = Field(default=1.0, ge=0.0, description="Cognitive complexity")
    code_smells_count: int = Field(default=0, ge=0, description="Count of identified code smells")
    duplication_pct: float = Field(default=0.0, ge=0.0, le=100.0, description="Code duplication percentage")
    test_coverage_pct: float = Field(default=100.0, ge=0.0, le=100.0, description="Test coverage percentage")
    code_churn_commits: int = Field(default=0, ge=0, description="Number of recent modifying commits")
    bug_frequency: int = Field(default=0, ge=0, description="Historical bug count linked to this file")
    technical_risk_score: Optional[float] = Field(None, ge=0.0, le=100.0, description="Calculated static technical risk (0-100)")


class EngineeringMetricCreate(EngineeringMetricBase):
    file_id: int


class EngineeringMetricResponse(EngineeringMetricBase):
    id: int
    file_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class TechnicalDebtItemBase(BaseModel):
    debt_category: str = Field(..., description="E.g., COMPLEXITY, DUPLICATION, CODE_SMELL, SECURITY, TESTING")
    severity: str = Field(default="MEDIUM", description="LOW, MEDIUM, HIGH, CRITICAL")
    debt_age_days: int = Field(default=30, ge=0, description="Age of technical debt in days")
    description: str = Field(..., min_length=3, description="Specific description of the debt item")
    line_number: Optional[int] = Field(None, ge=1)
    remediation_guidance: Optional[str] = None


class TechnicalDebtItemCreate(TechnicalDebtItemBase):
    file_id: int


class TechnicalDebtItemResponse(TechnicalDebtItemBase):
    id: int
    file_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class FileDebtOverview(BaseModel):
    file_id: int
    file_name: str
    file_path: str
    lines_of_code: int
    technical_risk_score: float
    debt_items_count: int
    critical_issues_count: int
    duplication_pct: float
    test_coverage_pct: float

    model_config = ConfigDict(from_attributes=True)


class HotspotResponse(BaseModel):
    file_id: int
    file_name: str
    file_path: str
    technical_risk: float
    business_impact: float
    predicted_future_risk: float
    priority_score: float
    quadrant: str
    hotspot_type: str # e.g. "TECHNICAL_CRITICAL", "BUSINESS_CRITICAL", "BALANCED_HOTSPOT"
    summary: str
