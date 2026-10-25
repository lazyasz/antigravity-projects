"""
Pydantic schemas for Machine Learning predictions.
Defines interfaces for Member 2 ML Engine ingestion.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class MLPredictionBase(BaseModel):
    predicted_future_risk: float = Field(
        ..., ge=0.0, le=100.0, description="Predicted probability/risk score of future failures (0-100)"
    )
    defect_probability: float = Field(
        default=0.5, ge=0.0, le=1.0, description="Model probability of bug occurrence in next release (0.0 - 1.0)"
    )
    churn_risk_score: float = Field(
        default=50.0, ge=0.0, le=100.0, description="Predicted churn & modification risk (0-100)"
    )
    confidence_score: float = Field(
        default=0.85, ge=0.0, le=1.0, description="Model confidence level in prediction (0.0 - 1.0)"
    )
    model_version: str = Field(default="xgboost-v1.2", max_length=50)


class MLPredictionCreate(MLPredictionBase):
    file_id: int


class MLPredictionBatchIngestItem(MLPredictionBase):
    file_path: Optional[str] = None
    file_id: Optional[int] = None


class MLPredictionBatchIngest(BaseModel):
    repository_id: Optional[int] = None
    predictions: List[MLPredictionBatchIngestItem]


class MLPredictionResponse(MLPredictionBase):
    id: int
    file_id: int
    prediction_timestamp: datetime

    model_config = ConfigDict(from_attributes=True)
