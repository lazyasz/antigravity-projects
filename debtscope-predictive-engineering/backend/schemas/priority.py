"""
Pydantic schemas for Priority Scoring and File Deep-Dive Analysis.
Enforces the stable API contract defined in Part 8 of the platform specification.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ScoreBreakdown(BaseModel):
    static_technical_risk: float
    predicted_ml_risk: float
    composite_technical_risk: float
    business_criticality: float
    customer_impact: float
    module_criticality: float
    composite_business_impact: float
    release_proximity: float
    sprint_urgency: float
    composite_urgency: float
    maintenance_cost: float
    debt_age_days: int
    normalized_debt_age: float
    baseline_priority_score: float
    remediation_effort_factor: float
    effort_deduction_or_boost: float


class PriorityScoreResponse(BaseModel):
    id: int
    file_id: int
    composite_technical_risk: float
    composite_business_impact: float
    urgency_score: float
    baseline_score: float
    final_priority_score: float
    priority_level: str # LOW, MEDIUM, HIGH, CRITICAL
    roi_score: float
    quadrant: str
    rank: int
    calculated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RankedFilePriority(BaseModel):
    rank: int
    file_id: int
    file_name: str
    file_path: str
    language: str
    lines_of_code: int
    technical_risk: float
    predicted_risk: float
    business_impact: float
    remediation_effort: float
    release_urgency: float
    priority_score: float
    priority_level: str # LOW, MEDIUM, HIGH, CRITICAL
    recommendation: str
    quadrant: str
    roi_score: float

    model_config = ConfigDict(from_attributes=True)


class FileDetailResponse(BaseModel):
    """
    Exact stable API contract matching Part 8 of the specification,
    enriched with deep explainability breakdowns and metadata.
    """
    file: str
    file_id: int
    file_path: str
    repository_id: int
    repository_name: str
    technical_risk: float
    predicted_risk: float
    business_impact: float
    remediation_effort: float
    release_urgency: float
    priority_score: float
    priority_level: str
    recommendation: str
    action_summary: str
    quadrant: str
    roi_score: float
    breakdown: ScoreBreakdown
    technical_debt_items: List[Dict[str, Any]] = []


class AnalyzeRequest(BaseModel):
    repository_id: Optional[int] = None
    file_ids: Optional[List[int]] = None
    recalculate_all: bool = True


class AnalyzeResponse(BaseModel):
    status: str
    analyzed_files_count: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    top_priorities: List[RankedFilePriority]


class ComparisonFileItem(BaseModel):
    file_name: str
    technical_risk: float
    predicted_risk: float
    business_impact: float
    release_urgency: float
    remediation_effort: float
    priority_score: float
    priority_level: str
    recommendation: str
    traditional_rank: int
    intelligent_rank: int
    explanation: str


class ComparisonDemoResponse(BaseModel):
    title: str
    key_takeaway: str
    comparison: List[ComparisonFileItem]
    insights: List[str]
