"""
Metrics, Technical Debt, and Hotspot API endpoints.
Provides data access and ingestion for Member 1 Data Pipeline.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import EngineeringMetric, SourceFile, TechnicalDebtItem
from backend.schemas.metrics import (
    EngineeringMetricResponse,
    EngineeringMetricCreate,
    TechnicalDebtItemResponse,
    TechnicalDebtItemCreate,
    FileDebtOverview,
    HotspotResponse,
)
from backend.services.data_service import DataService

router = APIRouter(tags=["Engineering Metrics & Technical Debt"])


@router.get("/metrics", response_model=List[FileDebtOverview])
def list_metrics(
    repository_id: Optional[int] = Query(None, description="Filter by repository ID"),
    db: Session = Depends(get_db)
):
    """Lists code metrics and technical debt health indicators across files."""
    query = db.query(SourceFile).filter(SourceFile.is_active == True)
    if repository_id:
        query = query.filter(SourceFile.repository_id == repository_id)

    files = query.all()
    results = []
    for f in files:
        m = f.metrics
        debt_count = len(f.debt_items)
        crit_count = sum(1 for d in f.debt_items if d.severity.upper() == "CRITICAL")
        results.append(
            FileDebtOverview(
                file_id=f.id,
                file_name=f.file_name,
                file_path=f.file_path,
                lines_of_code=f.lines_of_code,
                technical_risk_score=m.technical_risk_score if m else 0.0,
                debt_items_count=debt_count,
                critical_issues_count=crit_count,
                duplication_pct=m.duplication_pct if m else 0.0,
                test_coverage_pct=m.test_coverage_pct if m else 100.0,
            )
        )
    return results


@router.post("/metrics/ingest", response_model=EngineeringMetricResponse, status_code=status.HTTP_201_CREATED)
def ingest_file_metric(metric_in: EngineeringMetricCreate, db: Session = Depends(get_db)):
    """Ingests or updates code quality metrics from Member 1 Data Pipeline."""
    file_obj = DataService.get_file_by_id(db, metric_in.file_id)
    if not file_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source file with id {metric_in.file_id} not found"
        )
    return DataService.ingest_engineering_metric(db, metric_in)


@router.get("/technical-debt", response_model=List[TechnicalDebtItemResponse])
def list_technical_debt(
    severity: Optional[str] = Query(None, description="Filter by severity (LOW, MEDIUM, HIGH, CRITICAL)"),
    file_id: Optional[int] = Query(None, description="Filter by file ID"),
    db: Session = Depends(get_db)
):
    """Lists granular technical debt items across tracked files."""
    query = db.query(TechnicalDebtItem)
    if severity:
        query = query.filter(TechnicalDebtItem.severity == severity.upper())
    if file_id:
        query = query.filter(TechnicalDebtItem.file_id == file_id)
    return query.all()


@router.post("/technical-debt", response_model=TechnicalDebtItemResponse, status_code=status.HTTP_201_CREATED)
def add_technical_debt_item(item_in: TechnicalDebtItemCreate, db: Session = Depends(get_db)):
    """Adds a specific technical debt finding for a file."""
    file_obj = DataService.get_file_by_id(db, item_in.file_id)
    if not file_obj:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source file with id {item_in.file_id} not found"
        )
    return DataService.add_technical_debt_item(db, item_in)


@router.get("/hotspots", response_model=List[HotspotResponse])
def get_hotspots(
    repository_id: Optional[int] = Query(None, description="Filter by repository ID"),
    db: Session = Depends(get_db)
):
    """
    Identifies high-risk hotspots categorized by Technical vs Business dimensions.
    Enables engineering teams to see high risk clusters at a glance.
    """
    query = db.query(SourceFile).filter(SourceFile.is_active == True)
    if repository_id:
        query = query.filter(SourceFile.repository_id == repository_id)

    files = query.all()
    hotspots = []

    for f in files:
        score = f.priority_score
        bctx = f.business_context
        pred = f.prediction

        if not score:
            continue

        tech_risk = score.composite_technical_risk
        biz_impact = score.composite_business_impact
        future_risk = pred.predicted_future_risk if pred else tech_risk

        # Categorize Hotspot
        if tech_risk >= 70.0 and biz_impact >= 70.0:
            h_type = "BALANCED_CRITICAL_HOTSPOT"
            summary = "Critical intersection of heavy technical debt and core business dependency."
        elif tech_risk >= 70.0 and biz_impact < 70.0:
            h_type = "TECHNICAL_ISOLATED_HOTSPOT"
            summary = "High code complexity/smells in lower-business exposure component."
        elif tech_risk < 70.0 and biz_impact >= 70.0:
            h_type = "BUSINESS_VULNERABILITY_HOTSPOT"
            summary = "Core business dependency; moderate technical debt could have high blast radius."
        else:
            continue

        hotspots.append(
            HotspotResponse(
                file_id=f.id,
                file_name=f.file_name,
                file_path=f.file_path,
                technical_risk=tech_risk,
                business_impact=biz_impact,
                predicted_future_risk=future_risk,
                priority_score=score.final_priority_score,
                quadrant=score.quadrant,
                hotspot_type=h_type,
                summary=summary,
            )
        )

    hotspots.sort(key=lambda x: x.priority_score, reverse=True)
    return hotspots
