"""
Seed Service: Initializes a realistic demo codebase dataset.
Provides the benchmark comparison dataset demonstrating Business-Aware Prioritization.
"""

from sqlalchemy.orm import Session
from backend.database.models import (
    Repository,
    SourceFile,
    EngineeringMetric,
    TechnicalDebtItem,
    MLPrediction,
    BusinessContext,
)
from backend.services.priority_service import PriorityService
from backend.services.recommendation_service import RecommendationService


def seed_database(db: Session) -> None:
    """Seeds the database with realistic microservice files and metrics."""
    # Check if already seeded
    existing_repo = db.query(Repository).filter(Repository.name == "ecommerce-core-platform").first()
    if existing_repo:
        return

    # 1. Create Demo Repository
    repo = Repository(
        name="ecommerce-core-platform",
        url="https://github.com/enterprise/ecommerce-core-platform.git",
        default_branch="main",
    )
    db.add(repo)
    db.commit()
    db.refresh(repo)

    # 2. File definitions with metrics, ML predictions, business context, and debt items
    seed_files = [
        {
            "path": "services/payment.py",
            "name": "payment.py",
            "language": "Python",
            "loc": 680,
            "metrics": {
                "cyclomatic_complexity": 24.5,
                "cognitive_complexity": 29.0,
                "code_smells_count": 18,
                "duplication_pct": 14.5,
                "test_coverage_pct": 38.0,
                "code_churn_commits": 19,
                "bug_frequency": 9,
                "technical_risk_score": 82.0,
            },
            "prediction": {
                "predicted_future_risk": 96.0,
                "defect_probability": 0.88,
                "churn_risk_score": 92.0,
                "confidence_score": 0.94,
                "model_version": "xgboost-v1.2",
            },
            "business": {
                "business_criticality": 98.0,
                "customer_impact": 95.0,
                "module_criticality": 95.0,
                "release_proximity": 90.0,
                "sprint_urgency": 92.0,
                "maintenance_cost": 85.0,
                "estimated_remediation_effort": 30.0, # Quick win / High ROI fix!
                "domain_tag": "payment",
            },
            "debt": [
                {
                    "category": "COMPLEXITY",
                    "severity": "CRITICAL",
                    "debt_age_days": 180,
                    "description": "God method 'process_stripe_webhook' with cyclomatic complexity of 24.",
                    "line_number": 142,
                    "remediation": "Extract gateway-specific handlers into Polymorphic Strategy classes.",
                },
                {
                    "category": "TESTING",
                    "severity": "HIGH",
                    "debt_age_days": 120,
                    "description": "Missing integration tests for 3D-Secure 2.0 transaction failure callbacks.",
                    "line_number": 310,
                    "remediation": "Add mocked webhook fixtures for card decline scenarios.",
                }
            ]
        },
        {
            "path": "analytics/analytics.py",
            "name": "analytics.py",
            "language": "Python",
            "loc": 820,
            "metrics": {
                "cyclomatic_complexity": 32.0,
                "cognitive_complexity": 38.0,
                "code_smells_count": 28,
                "duplication_pct": 22.0,
                "test_coverage_pct": 15.0,
                "code_churn_commits": 4,
                "bug_frequency": 2,
                "technical_risk_score": 90.0, # Higher raw technical debt than payment.py!
            },
            "prediction": {
                "predicted_future_risk": 88.0,
                "defect_probability": 0.72,
                "churn_risk_score": 45.0,
                "confidence_score": 0.89,
                "model_version": "xgboost-v1.2",
            },
            "business": {
                "business_criticality": 30.0, # Low business criticality
                "customer_impact": 20.0,      # Low direct customer impact
                "module_criticality": 35.0,
                "release_proximity": 30.0,
                "sprint_urgency": 25.0,
                "maintenance_cost": 30.0,
                "estimated_remediation_effort": 40.0,
                "domain_tag": "analytics",
            },
            "debt": [
                {
                    "category": "COMPLEXITY",
                    "severity": "CRITICAL",
                    "debt_age_days": 320,
                    "description": "Nested aggregation loops processing batch clickstream data in memory.",
                    "line_number": 88,
                    "remediation": "Refactor into vector operations using Polars/Pandas.",
                }
            ]
        },
        {
            "path": "auth/auth_service.py",
            "name": "auth_service.py",
            "language": "Python",
            "loc": 450,
            "metrics": {
                "cyclomatic_complexity": 18.0,
                "cognitive_complexity": 20.0,
                "code_smells_count": 12,
                "duplication_pct": 8.0,
                "test_coverage_pct": 52.0,
                "code_churn_commits": 14,
                "bug_frequency": 6,
                "technical_risk_score": 76.0,
            },
            "prediction": {
                "predicted_future_risk": 85.0,
                "defect_probability": 0.81,
                "churn_risk_score": 80.0,
                "confidence_score": 0.92,
                "model_version": "xgboost-v1.2",
            },
            "business": {
                "business_criticality": 94.0,
                "customer_impact": 92.0,
                "module_criticality": 96.0,
                "release_proximity": 85.0,
                "sprint_urgency": 88.0,
                "maintenance_cost": 70.0,
                "estimated_remediation_effort": 25.0, # High ROI Quick Win!
                "domain_tag": "auth",
            },
            "debt": [
                {
                    "category": "SECURITY",
                    "severity": "CRITICAL",
                    "debt_age_days": 90,
                    "description": "Legacy session token verification lacks distributed Redis cache invalidation.",
                    "line_number": 115,
                    "remediation": "Migrate session revocation to Redis blacklist cluster.",
                }
            ]
        },
        {
            "path": "orders/order_processor.py",
            "name": "order_processor.py",
            "language": "Python",
            "loc": 950,
            "metrics": {
                "cyclomatic_complexity": 26.0,
                "cognitive_complexity": 30.0,
                "code_smells_count": 22,
                "duplication_pct": 18.0,
                "test_coverage_pct": 45.0,
                "code_churn_commits": 16,
                "bug_frequency": 7,
                "technical_risk_score": 78.0,
            },
            "prediction": {
                "predicted_future_risk": 82.0,
                "defect_probability": 0.79,
                "churn_risk_score": 75.0,
                "confidence_score": 0.90,
                "model_version": "xgboost-v1.2",
            },
            "business": {
                "business_criticality": 90.0,
                "customer_impact": 88.0,
                "module_criticality": 92.0,
                "release_proximity": 80.0,
                "sprint_urgency": 75.0,
                "maintenance_cost": 75.0,
                "estimated_remediation_effort": 70.0, # High effort -> Strategic Refactor
                "domain_tag": "orders",
            },
            "debt": [
                {
                    "category": "ARCHITECTURE",
                    "severity": "HIGH",
                    "debt_age_days": 210,
                    "description": "Synchronous inventory reserve calls block checkout worker threads.",
                    "line_number": 230,
                    "remediation": "Convert to asynchronous Kafka event-driven order saga.",
                }
            ]
        },
        {
            "path": "reports/legacy_report_generator.py",
            "name": "legacy_report_generator.py",
            "language": "Python",
            "loc": 520,
            "metrics": {
                "cyclomatic_complexity": 19.0,
                "cognitive_complexity": 22.0,
                "code_smells_count": 15,
                "duplication_pct": 25.0,
                "test_coverage_pct": 20.0,
                "code_churn_commits": 2,
                "bug_frequency": 1,
                "technical_risk_score": 65.0,
            },
            "prediction": {
                "predicted_future_risk": 55.0,
                "defect_probability": 0.45,
                "churn_risk_score": 20.0,
                "confidence_score": 0.85,
                "model_version": "xgboost-v1.2",
            },
            "business": {
                "business_criticality": 20.0,
                "customer_impact": 15.0,
                "module_criticality": 20.0,
                "release_proximity": 15.0,
                "sprint_urgency": 10.0,
                "maintenance_cost": 30.0,
                "estimated_remediation_effort": 65.0, # High effort, low value -> Deprioritized
                "domain_tag": "reports",
            },
            "debt": [
                {
                    "category": "DUPLICATION",
                    "severity": "MEDIUM",
                    "debt_age_days": 400,
                    "description": "Duplicated PDF generation logic across monthly and annual statements.",
                    "line_number": 45,
                    "remediation": "Consolidate into unified Jinja2 PDF reporting template.",
                }
            ]
        },
        {
            "path": "notifications/notification_worker.py",
            "name": "notification_worker.py",
            "language": "Python",
            "loc": 310,
            "metrics": {
                "cyclomatic_complexity": 8.0,
                "cognitive_complexity": 9.0,
                "code_smells_count": 5,
                "duplication_pct": 4.0,
                "test_coverage_pct": 82.0,
                "code_churn_commits": 6,
                "bug_frequency": 2,
                "technical_risk_score": 32.0,
            },
            "prediction": {
                "predicted_future_risk": 35.0,
                "defect_probability": 0.28,
                "churn_risk_score": 30.0,
                "confidence_score": 0.91,
                "model_version": "xgboost-v1.2",
            },
            "business": {
                "business_criticality": 45.0,
                "customer_impact": 50.0,
                "module_criticality": 40.0,
                "release_proximity": 40.0,
                "sprint_urgency": 35.0,
                "maintenance_cost": 25.0,
                "estimated_remediation_effort": 15.0, # Low effort, low risk -> Opportunistic
                "domain_tag": "notifications",
            },
            "debt": [
                {
                    "category": "CODE_SMELL",
                    "severity": "LOW",
                    "debt_age_days": 60,
                    "description": "Hardcoded email retry timeouts in dispatch queue.",
                    "line_number": 78,
                    "remediation": "Move retry parameters to environment configuration.",
                }
            ]
        }
    ]

    for item in seed_files:
        file_obj = SourceFile(
            repository_id=repo.id,
            file_path=item["path"],
            file_name=item["name"],
            language=item["language"],
            lines_of_code=item["loc"],
            is_active=True,
        )
        db.add(file_obj)
        db.commit()
        db.refresh(file_obj)

        # Metrics
        m = item["metrics"]
        metric_obj = EngineeringMetric(
            file_id=file_obj.id,
            cyclomatic_complexity=m["cyclomatic_complexity"],
            cognitive_complexity=m["cognitive_complexity"],
            code_smells_count=m["code_smells_count"],
            duplication_pct=m["duplication_pct"],
            test_coverage_pct=m["test_coverage_pct"],
            code_churn_commits=m["code_churn_commits"],
            bug_frequency=m["bug_frequency"],
            technical_risk_score=m["technical_risk_score"],
        )
        db.add(metric_obj)

        # ML Prediction
        p = item["prediction"]
        pred_obj = MLPrediction(
            file_id=file_obj.id,
            predicted_future_risk=p["predicted_future_risk"],
            defect_probability=p["defect_probability"],
            churn_risk_score=p["churn_risk_score"],
            confidence_score=p["confidence_score"],
            model_version=p["model_version"],
        )
        db.add(pred_obj)

        # Business Context
        b = item["business"]
        bctx_obj = BusinessContext(
            file_id=file_obj.id,
            business_criticality=b["business_criticality"],
            customer_impact=b["customer_impact"],
            module_criticality=b["module_criticality"],
            release_proximity=b["release_proximity"],
            sprint_urgency=b["sprint_urgency"],
            maintenance_cost=b["maintenance_cost"],
            estimated_remediation_effort=b["estimated_remediation_effort"],
            domain_tag=b["domain_tag"],
        )
        db.add(bctx_obj)

        # Technical Debt Items
        for d in item["debt"]:
            debt_item = TechnicalDebtItem(
                file_id=file_obj.id,
                debt_category=d["category"],
                severity=d["severity"],
                debt_age_days=d["debt_age_days"],
                description=d["description"],
                line_number=d["line_number"],
                remediation_guidance=d["remediation"],
            )
            db.add(debt_item)

        db.commit()

    # Calculate Priority and Recommendations across all files
    PriorityService.analyze_all_files(db, repo.id)
    RecommendationService.generate_all_recommendations(db, repo.id)
