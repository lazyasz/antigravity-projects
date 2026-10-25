"""
Business Context API endpoints.
Provides simulation, CRUD, and runtime configuration for business risk parameters.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import BusinessContext, SourceFile
from backend.schemas.business_context import (
    BusinessContextResponse,
    BusinessContextCreate,
    BusinessContextUpdate,
)
from backend.services.business_service import BusinessService
from backend.services.data_service import DataService
from backend.services.priority_service import PriorityService
from backend.services.recommendation_service import RecommendationService

router = APIRouter(prefix="/business-context", tags=["Business Context"])


@router.get("", response_model=List[BusinessContextResponse])
def list_business_contexts(db: Session = Depends(get_db)):
    """Lists business context parameters across all tracked files."""
    return BusinessService.get_all_business_contexts(db)


@router.get("/{file_id}", response_model=BusinessContextResponse)
def get_business_context_by_file(file_id: int, db: Session = Depends(get_db)):
    """Fetches business context parameters for a specific file."""
    ctx = BusinessService.get_business_context_by_file_id(db, file_id)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Business context for file id {file_id} not found"
        )
    return ctx


@router.post("", response_model=BusinessContextResponse, status_code=status.HTTP_201_CREATED)
def create_business_context(ctx_in: BusinessContextCreate, db: Session = Depends(get_db)):
    """Creates or replaces business context for a file."""
    file_obj = DataService.get_file_by_id(db, ctx_in.file_id)
    if not file_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source file with id {ctx_in.file_id} not found"
        )
    ctx = BusinessService.get_or_create_business_context(db, ctx_in)
    # Automatically recalculate priority & recommendation for file
    PriorityService.calculate_file_priority(db, ctx_in.file_id)
    RecommendationService.generate_file_recommendation(db, ctx_in.file_id)
    return ctx


@router.put("/{file_id}", response_model=BusinessContextResponse)
def update_business_context(
    file_id: int,
    update_data: BusinessContextUpdate,
    db: Session = Depends(get_db)
):
    """
    Updates simulated or live business context for a file and recalculates priority.
    Allows engineering leads to adjust business criticality or sprint urgency on the fly.
    """
    file_obj = DataService.get_file_by_id(db, file_id)
    if not file_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source file with id {file_id} not found"
        )

    ctx = BusinessService.update_business_context(db, file_id, update_data)
    if not ctx:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Failed to update business context for file id {file_id}"
        )

    # Automatically re-run priority calculation and recommendation
    PriorityService.calculate_file_priority(db, file_id)
    RecommendationService.generate_file_recommendation(db, file_id)
    return ctx
