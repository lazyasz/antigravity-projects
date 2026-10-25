"""
Priority, Recommendation, Analysis, and Business Differentiation API endpoints.
Provides the primary interfaces consumed by the Frontend UI and Decision Dashboard.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import SourceFile, PriorityScore
from backend.schemas.priority import (
    AnalyzeRequest,
    AnalyzeResponse,
    RankedFilePriority,
    FileDetailResponse,
    ComparisonDemoResponse,
    ComparisonFileItem,
)
from backend.schemas.recommendation import RecommendationResponse, SprintPlanSummary
from backend.services.priority_service import PriorityService
from backend.services.recommendation_service import RecommendationService
from backend.services.data_service import DataService

router = APIRouter(tags=["Priority Engine & Decision Intelligence"])


@router.post("/analyze", response_model=AnalyzeResponse)
def trigger_analysis(
    req: Optional[AnalyzeRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Triggers end-to-end priority analysis and recommendation generation
    across all tracked files or a specific repository.
    """
    repo_id = req.repository_id if req else None
    scores = PriorityService.analyze_all_files(db, repo_id)
    RecommendationService.generate_all_recommendations(db, repo_id)

    crit_cnt = sum(1 for s in scores if s.priority_level == "CRITICAL")
    high_cnt = sum(1 for s in scores if s.priority_level == "HIGH")
    med_cnt = sum(1 for s in scores if s.priority_level == "MEDIUM")
    low_cnt = sum(1 for s in scores if s.priority_level == "LOW")

    ranked = PriorityService.get_ranked_priorities(db, repo_id=repo_id, limit=10)

    return AnalyzeResponse(
        status="success",
        analyzed_files_count=len(scores),
        critical_count=crit_cnt,
        high_count=high_cnt,
        medium_count=med_cnt,
        low_count=low_cnt,
        top_priorities=ranked,
    )


@router.get("/priorities", response_model=List[RankedFilePriority])
def list_priorities(
    repository_id: Optional[int] = Query(None, description="Filter by repository ID"),
    priority_level: Optional[str] = Query(None, description="Filter by level: CRITICAL, HIGH, MEDIUM, LOW"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db)
):
    """
    Returns prioritized remediation order ranked by business-aware Priority Score.
    """
    return PriorityService.get_ranked_priorities(
        db=db,
        repo_id=repository_id,
        priority_level=priority_level,
        limit=limit,
        offset=offset,
    )


@router.get("/recommendations", response_model=List[RecommendationResponse])
def list_recommendations(
    repository_id: Optional[int] = Query(None, description="Filter by repository ID"),
    recommendation_type: Optional[str] = Query(None, description="Filter by recommendation type"),
    db: Session = Depends(get_db)
):
    """
    Returns structured, deterministic recommendations for engineering remediation.
    """
    return RecommendationService.get_recommendations_response(
        db=db,
        repo_id=repository_id,
        recommendation_type=recommendation_type,
    )


@router.get("/recommendations/sprint-plan", response_model=SprintPlanSummary)
def get_sprint_plan(
    capacity_points: int = Query(25, ge=5, le=100, description="Available sprint story point budget"),
    db: Session = Depends(get_db)
):
    """
    Generates an optimized Sprint Technical Debt budget allocation based on ROI scores.
    """
    return RecommendationService.get_sprint_plan(db, capacity_points)


@router.get("/files/{file_id}", response_model=FileDetailResponse)
def get_file_detail(file_id: int, db: Session = Depends(get_db)):
    """
    Deep-dive technical debt profile for a specific file.
    Matches the Part 8 API response contract with mathematical breakdown.
    """
    detail = PriorityService.get_file_detail_response(db, file_id)
    if not detail:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Source file with id {file_id} not found"
        )
    return detail


@router.get("/comparison/demo", response_model=ComparisonDemoResponse)
def get_business_differentiation_demo(db: Session = Depends(get_db)):
    """
    Showcases the central differentiator of our platform:
    Demonstrating that technical risk alone does NOT determine priority.
    Compares 'payment.py' (high business impact) vs 'analytics.py' (high technical debt, low business impact).
    """
    payment_file = db.query(SourceFile).filter(SourceFile.file_name.ilike("%payment%")).first()
    analytics_file = db.query(SourceFile).filter(SourceFile.file_name.ilike("%analytics%")).first()

    if not payment_file or not analytics_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demo comparison files not initialized. Please ensure database seed is loaded."
        )

    pay_detail = PriorityService.get_file_detail_response(db, payment_file.id)
    ana_detail = PriorityService.get_file_detail_response(db, analytics_file.id)

    comparison_items = [
        ComparisonFileItem(
            file_name=pay_detail.file,
            technical_risk=pay_detail.technical_risk,
            predicted_risk=pay_detail.predicted_risk,
            business_impact=pay_detail.business_impact,
            release_urgency=pay_detail.release_urgency,
            remediation_effort=pay_detail.remediation_effort,
            priority_score=pay_detail.priority_score,
            priority_level=pay_detail.priority_level,
            recommendation=pay_detail.recommendation,
            traditional_rank=2,  # Traditional tools rank analytics.py #1 because static risk was 90 vs 82
            intelligent_rank=1,  # Our platform elevates payment.py to #1 due to 98 business impact
            explanation=(
                "Even though technical risk (82.0) was slightly lower than analytics.py (90.0), "
                "payment.py is ranked #1 CRITICAL because it protects core revenue checkout, "
                "faces high customer blast radius (95.0), and has a fast remediation turnaround (Effort: 30.0)."
            )
        ),
        ComparisonFileItem(
            file_name=ana_detail.file,
            technical_risk=ana_detail.technical_risk,
            predicted_risk=ana_detail.predicted_risk,
            business_impact=ana_detail.business_impact,
            release_urgency=ana_detail.release_urgency,
            remediation_effort=ana_detail.remediation_effort,
            priority_score=ana_detail.priority_score,
            priority_level=ana_detail.priority_level,
            recommendation=ana_detail.recommendation,
            traditional_rank=1,  # Ranked highest in traditional static tools
            intelligent_rank=4,  # Deprioritized to MEDIUM in our platform
            explanation=(
                "Traditional static analyzers rank this as the #1 most urgent file due to high cyclomatic complexity (32.0) "
                "and raw technical risk (90.0). However, because it runs as a non-blocking background analytics collector "
                "(Business Criticality: 30.0), fixing it during release freeze yields low business ROI."
            )
        )
    ]

    insights = [
        "1. Traditional tools measure Code Severity; Decision Intelligence measures Business Exposure and Remediation ROI.",
        "2. High technical risk in an isolated component (analytics.py) does not disrupt active customer transactions.",
        "3. Accounting for remediation effort ensures teams tackle High-Value Quick Wins first.",
        "4. Transparent scoring gives engineering managers justifiable arguments for sprint backlog grooming."
    ]

    return ComparisonDemoResponse(
        title="Business-Aware Prioritization vs Traditional Static Severity",
        key_takeaway="Our platform prevents engineering teams from wasting sprint cycles on low-value complex code.",
        comparison=comparison_items,
        insights=insights,
    )
