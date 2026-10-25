"""
Pydantic schemas for Recommendations and Sprint Allocations.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class RecommendationResponse(BaseModel):
    id: int
    file_id: int
    file_name: str
    file_path: str
    recommendation_type: str # REFACTOR_IMMEDIATELY, SPRINT_CANDIDATE, SCHEDULE_FUTURE, MONITOR
    action_summary: str
    rationale: str
    sprint_target: str
    estimated_story_points: int
    priority_level: str
    priority_score: float
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SprintPlanSummary(BaseModel):
    sprint_name: str
    target_capacity_points: int
    allocated_points: int
    candidate_files_count: int
    items: List[RecommendationResponse]
