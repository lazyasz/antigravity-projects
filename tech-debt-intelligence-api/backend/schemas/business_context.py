"""
Pydantic schemas for Business Context modeling.
Validates all business metrics on a strict 0-100 normalized scale.
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BusinessContextBase(BaseModel):
    business_criticality: float = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Direct revenue impact, customer transactions, or compliance role (0-100)",
    )
    customer_impact: float = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Degree of user-facing failure impact or customer churn severity (0-100)",
    )
    module_criticality: float = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Structural architectural importance (core API / database vs utility) (0-100)",
    )
    release_proximity: float = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Closeness to the next deployment / release milestone (0-100)",
    )
    sprint_urgency: float = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Active sprint deliverables and roadmap focus on this component (0-100)",
    )
    maintenance_cost: float = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Developer friction, bug recurrence, and maintenance hours wasted (0-100)",
    )
    estimated_remediation_effort: float = Field(
        default=50.0,
        ge=0.0,
        le=100.0,
        description="Engineering complexity and time needed to refactor (0=trivial, 100=major refactor)",
    )
    domain_tag: str = Field(default="core", max_length=50, description="Domain tag, e.g. payment, auth, analytics")


class BusinessContextCreate(BusinessContextBase):
    file_id: int


class BusinessContextUpdate(BaseModel):
    business_criticality: Optional[float] = Field(None, ge=0.0, le=100.0)
    customer_impact: Optional[float] = Field(None, ge=0.0, le=100.0)
    module_criticality: Optional[float] = Field(None, ge=0.0, le=100.0)
    release_proximity: Optional[float] = Field(None, ge=0.0, le=100.0)
    sprint_urgency: Optional[float] = Field(None, ge=0.0, le=100.0)
    maintenance_cost: Optional[float] = Field(None, ge=0.0, le=100.0)
    estimated_remediation_effort: Optional[float] = Field(None, ge=0.0, le=100.0)
    domain_tag: Optional[str] = Field(None, max_length=50)


class BusinessContextResponse(BusinessContextBase):
    id: int
    file_id: int
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
