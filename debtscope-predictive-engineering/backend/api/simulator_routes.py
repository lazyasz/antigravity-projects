"""
Simulator, AI Remediation Recipe, CI/CD PR Gate, and Executive Audit API Routes.
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from backend.services.simulator_service import (
    calculate_what_if_simulation,
    calculate_financial_tco_engine,
    generate_ai_remediation_recipe,
    evaluate_ci_cd_pull_request,
    generate_executive_audit_summary
)

router = APIRouter(tags=["Simulator, AI Recipes & CI/CD Intelligence"])


class WhatIfRequest(BaseModel):
    churn: int = Field(120, description="Code churn lines")
    complexity: float = Field(14.0, description="Cyclomatic complexity score")
    debt_minutes: float = Field(90.0, description="Technical debt minutes")
    experience: int = Field(5, description="Author experience commit count")
    refactoring_effort_pct: float = Field(40.0, ge=0.0, le=100.0, description="Refactoring effort percentage (0-100%)")
    developer_seniority: str = Field("Senior Engineer (6-8 yrs)", description="Assigned developer seniority")
    test_coverage_pct: float = Field(80.0, ge=0.0, le=100.0, description="Test coverage percentage (0-100%)")
    hourly_rate: float = Field(85.0, description="Hourly engineering rate in USD")
    refactoring_budget_hours: Optional[float] = Field(None, description="Allocated refactoring hours budget")
    refactoring_story_points: Optional[int] = Field(None, description="Allocated story points budget")
    risk_tolerance: str = Field("balanced", description="Risk tolerance strategy ('conservative' | 'balanced' | 'aggressive')")


class FinancialTcoRequest(BaseModel):
    hourly_rate: float = Field(85.0, ge=1.0, le=1000.0, description="Blended engineering hourly rate in USD")
    team_size: int = Field(12, ge=1, le=500, description="Total active developer headcount")
    sprint_length_weeks: int = Field(2, ge=1, le=8, description="Sprint iteration cycle in weeks")
    velocity_drag_pct: float = Field(24.5, ge=0.0, le=90.0, description="Estimated velocity slowdown percentage caused by debt")


class AiRecipeRequest(BaseModel):
    file_path: str = Field(..., description="File path (e.g. 'src/core/DataTree.java')")
    risk_score: float = Field(85.0, description="5D Priority risk score")
    debt_minutes: float = Field(120.0, description="Remediation minutes")
    complexity: float = Field(18.0, description="Cyclomatic complexity")


class ChangedFileItem(BaseModel):

    filename: str = Field(..., description="Path of modified file")
    lines_added: int = Field(0, description="Lines added")
    lines_deleted: int = Field(0, description="Lines deleted")
    cyclomatic_complexity: float = Field(8.0, description="Structural complexity")
    debt_minutes: float = Field(30.0, description="Estimated debt minutes")


class PrEvaluationRequest(BaseModel):
    pr_number: int = Field(104, description="Pull Request number")
    pr_title: str = Field("feat: Add Payment Webhook Gateway", description="Pull Request title")
    author: str = Field("developer.alex", description="PR author")
    author_experience_commits: int = Field(4, description="Author historical commits in repo")
    target_branch: str = Field("main", description="Target merge branch")
    changed_files: List[ChangedFileItem] = Field(..., description="List of modified files in PR")


@router.post("/simulator/what-if", summary="Run Interactive What-If Defect & ROI Simulation")
def run_what_if_simulation(payload: WhatIfRequest):
    """
    Evaluates ML defect predictor across simulated refactoring effort,
    developer seniority transitions, and test coverage boosts, calculating
    hours saved and financial ROI with multi-sprint projection curves.
    """
    return calculate_what_if_simulation(
        current_churn=payload.churn,
        current_complexity=payload.complexity,
        current_debt_minutes=payload.debt_minutes,
        current_experience=payload.experience,
        refactoring_effort_pct=payload.refactoring_effort_pct,
        developer_seniority=payload.developer_seniority,
        test_coverage_pct=payload.test_coverage_pct,
        hourly_rate=payload.hourly_rate,
        refactoring_budget_hours=payload.refactoring_budget_hours,
        refactoring_story_points=payload.refactoring_story_points,
        risk_tolerance=payload.risk_tolerance
    )


@router.post("/simulator/financial-tco", summary="Calculate Executive Financial TCO & Drag Interest Engine")
def run_financial_tco_calculation(payload: FinancialTcoRequest):
    """
    Converts technical debt metrics into C-suite financial figures:
    Principal Debt ($), Monthly Drag Tax ($), Payback Period, and Subsystem Breakdown.
    """
    return calculate_financial_tco_engine(
        hourly_rate=payload.hourly_rate,
        team_size=payload.team_size,
        sprint_length_weeks=payload.sprint_length_weeks,
        velocity_drag_pct=payload.velocity_drag_pct
    )


@router.post("/recommendations/ai-recipe", summary="Generate Actionable AI Refactoring Blueprint")
def generate_recipe_endpoint(payload: AiRecipeRequest):
    """
    Analyzes code smell and generates actionable step-by-step refactoring recipe
    with before/after diffs and sprint estimates.
    """
    return generate_ai_remediation_recipe(
        file_path=payload.file_path,
        risk_score=payload.risk_score,
        debt_minutes=payload.debt_minutes,
        complexity=payload.complexity
    )


@router.post("/ci-cd/evaluate-pr", summary="Evaluate Pull Request Against Pre-Merge Risk Policy Gate")
def evaluate_pr_endpoint(payload: PrEvaluationRequest):
    """
    Simulates CI/CD automated Pull Request risk evaluation, assessing peak defect probability,
    churn volume, and policy compliance before merging.
    """
    return evaluate_ci_cd_pull_request(
        pr_number=payload.pr_number,
        pr_title=payload.pr_title,
        author=payload.author,
        author_experience_commits=payload.author_experience_commits,
        target_branch=payload.target_branch,
        changed_files=[f.model_dump() for f in payload.changed_files]
    )


@router.get("/reports/executive-summary", summary="Generate Executive Technical Debt Audit Summary")
def get_executive_summary_report():
    """
    Returns high-level executive KPIs, project health grade, ROI estimates,
    and compliance certifications for PDF/Print report generation.
    """
    return generate_executive_audit_summary()
