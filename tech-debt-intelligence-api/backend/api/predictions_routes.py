"""
Machine Learning Predictions API endpoints.
Provides model risk ingestion interfaces for Member 2 ML Engine.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import MLPrediction, SourceFile
from backend.schemas.prediction import (
    MLPredictionResponse,
    MLPredictionCreate,
    MLPredictionBatchIngest,
)
from backend.services.prediction_service import PredictionService
from backend.services.data_service import DataService

router = APIRouter(prefix="/predictions", tags=["ML Predictions (Member 2 Engine)"])


@router.get("", response_model=List[MLPredictionResponse])
def list_predictions(db: Session = Depends(get_db)):
    """Lists ML defect and risk predictions across all files."""
    return PredictionService.get_all_predictions(db)


@router.post("/ingest", response_model=MLPredictionResponse, status_code=status.HTTP_201_CREATED)
def ingest_prediction(pred_in: MLPredictionCreate, db: Session = Depends(get_db)):
    """Ingests a single file's risk prediction from Member 2 ML model."""
    file_obj = DataService.get_file_by_id(db, pred_in.file_id)
    if not file_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source file with id {pred_in.file_id} not found"
        )
    return PredictionService.ingest_prediction(db, pred_in)


@router.post("/batch-ingest", response_model=List[MLPredictionResponse], status_code=status.HTTP_201_CREATED)
def batch_ingest_predictions(batch_data: MLPredictionBatchIngest, db: Session = Depends(get_db)):
    """Batch ingests predictions for multiple files directly from ML pipeline."""
    return PredictionService.batch_ingest_predictions(db, batch_data)


@router.get("/{file_id}", response_model=MLPredictionResponse)
def get_prediction_by_file(file_id: int, db: Session = Depends(get_db)):
    """Fetches ML prediction for a specific file."""
    prediction = PredictionService.get_prediction_by_file_id(db, file_id)
    if not prediction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No ML prediction found for file id {file_id}"
        )
    return prediction
