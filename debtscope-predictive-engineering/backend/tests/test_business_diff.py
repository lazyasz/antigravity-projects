"""
Key Differentiator Unit Test:
Demonstrates that technical risk alone does NOT determine priority.
Verifies that 'payment.py' (high business impact) gets higher priority score and rank
than 'analytics.py' (high technical risk, low business impact).
"""

from backend.database.models import SourceFile
from backend.services.priority_service import PriorityService


def test_business_aware_differentiation(seeded_db):
    """
    Core project verification:
    analytics.py: Technical Risk = 90.0, Business Impact = 30.0
    payment.py:   Technical Risk = 82.0, Business Impact = 98.0

    Even though analytics.py has higher raw technical debt, payment.py must receive
    a higher Priority Score and be categorized as CRITICAL vs MEDIUM.
    """
    payment_file = seeded_db.query(SourceFile).filter(SourceFile.file_name == "payment.py").first()
    analytics_file = seeded_db.query(SourceFile).filter(SourceFile.file_name == "analytics.py").first()

    assert payment_file is not None, "payment.py must exist in seeded database"
    assert analytics_file is not None, "analytics.py must exist in seeded database"

    pay_detail = PriorityService.get_file_detail_response(seeded_db, payment_file.id)
    ana_detail = PriorityService.get_file_detail_response(seeded_db, analytics_file.id)

    # 1. Verify Raw Technical Risk
    assert ana_detail.technical_risk >= pay_detail.technical_risk or ana_detail.breakdown.static_technical_risk > pay_detail.breakdown.static_technical_risk

    # 2. Verify Business Impact Gap
    assert pay_detail.business_impact > 85.0
    assert ana_detail.business_impact < 40.0

    # 3. Assert Business-Aware Decision Engine Priority Score
    assert pay_detail.priority_score > ana_detail.priority_score, (
        f"payment.py score ({pay_detail.priority_score}) must be strictly greater than "
        f"analytics.py score ({ana_detail.priority_score})"
    )

    # 4. Assert Categorization
    assert pay_detail.priority_level == "CRITICAL"
    assert ana_detail.priority_level in ["MEDIUM", "LOW"]

    # 5. Assert Action Recommendations
    assert "Refactor immediately" in pay_detail.recommendation
    assert pay_detail.recommendation != ana_detail.recommendation
