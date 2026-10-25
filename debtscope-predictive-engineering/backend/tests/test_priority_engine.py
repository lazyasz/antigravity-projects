"""
Unit tests for Priority Engine mathematical formulas, clamping, weighting, and ROI quadrants.
"""

from backend.services.priority_service import PriorityService
from backend.services.data_service import DataService
from backend.schemas.repository import RepositoryCreate, SourceFileCreate
from backend.schemas.metrics import EngineeringMetricCreate, TechnicalDebtItemCreate
from backend.schemas.prediction import MLPredictionCreate
from backend.schemas.business_context import BusinessContextCreate


def test_static_technical_risk_computation():
    """Verifies that static technical risk calculation scales correctly between 0 and 100."""
    # High risk file: high complexity, many smells, poor coverage
    high_risk = DataService.compute_static_technical_risk(
        cyclomatic_complexity=35.0,
        code_smells_count=25,
        duplication_pct=25.0,
        test_coverage_pct=10.0,
        code_churn_commits=15,
        bug_frequency=8,
    )
    assert 80.0 <= high_risk <= 100.0

    # Low risk file: simple code, zero smells, high coverage
    low_risk = DataService.compute_static_technical_risk(
        cyclomatic_complexity=3.0,
        code_smells_count=0,
        duplication_pct=0.0,
        test_coverage_pct=95.0,
        code_churn_commits=1,
        bug_frequency=0,
    )
    assert 0.0 <= low_risk <= 25.0


def test_priority_score_bounds_and_quadrant(db_session):
    """Verifies that priority scores never exceed 0-100 and quadrants are properly assigned."""
    repo = DataService.get_or_create_repository(
        db_session, RepositoryCreate(name="test-repo", url="https://github.com/test/repo.git")
    )
    file_obj = DataService.get_or_create_file(
        db_session,
        SourceFileCreate(repository_id=repo.id, file_path="core/test.py", file_name="test.py", language="Python", lines_of_code=200)
    )

    # Ingest Metrics
    DataService.ingest_engineering_metric(
        db_session,
        EngineeringMetricCreate(
            file_id=file_obj.id,
            cyclomatic_complexity=20.0,
            cognitive_complexity=22.0,
            code_smells_count=10,
            duplication_pct=10.0,
            test_coverage_pct=40.0,
            technical_risk_score=75.0,
        )
    )

    # Ingest ML Prediction
    PredictionService_mock = MLPredictionCreate(
        file_id=file_obj.id,
        predicted_future_risk=80.0,
        defect_probability=0.75,
        churn_risk_score=70.0,
        confidence_score=0.9,
    )
    from backend.services.prediction_service import PredictionService
    PredictionService.ingest_prediction(db_session, PredictionService_mock)

    # Ingest Business Context (High Criticality, Low Effort -> Quick Win)
    from backend.services.business_service import BusinessService
    BusinessService.get_or_create_business_context(
        db_session,
        BusinessContextCreate(
            file_id=file_obj.id,
            business_criticality=90.0,
            customer_impact=85.0,
            module_criticality=90.0,
            release_proximity=80.0,
            sprint_urgency=85.0,
            maintenance_cost=70.0,
            estimated_remediation_effort=25.0, # Low effort
            domain_tag="checkout",
        )
    )

    # Ingest Debt Item
    DataService.add_technical_debt_item(
        db_session,
        TechnicalDebtItemCreate(
            file_id=file_obj.id,
            debt_category="COMPLEXITY",
            severity="HIGH",
            debt_age_days=100,
            description="Refactor complex checkout validation",
        )
    )

    # Calculate Priority
    score = PriorityService.calculate_file_priority(db_session, file_obj.id)
    assert score is not None
    assert 0.0 <= score.final_priority_score <= 100.0
    assert score.priority_level in ["CRITICAL", "HIGH"]
    assert score.quadrant == "QUICK_WIN"
    assert score.roi_score > 200.0
