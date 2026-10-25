"""
Integration tests for PySpark distributed processing layer.
Verifies DataFrame operations, window functions, and relational joins.
"""

import pytest
from src.data_pipeline.spark_processor import SparkDataProcessor

@pytest.fixture(scope="module")
def spark_processor():
    processor = SparkDataProcessor(app_name="SparkTestRunner")
    yield processor
    processor.stop()

def test_spark_processor_pipeline_transformations(spark_processor):
    """Verifies that SparkDataProcessor transforms mock cleaned data and executes Window joins."""
    mock_cleaned = {
        "files": [
            {"id": "f1", "repo_id": "r1", "file_path": "services/auth.py", "module_name": "auth", "language": "Python", "loc": 500, "cyclomatic_complexity": 10.0, "cognitive_complexity": 8.0, "code_smells": 2}
        ],
        "commits": [
            {"id": "c1", "repo_id": "r1", "commit_hash": "h1", "author_id": "dev1", "commit_timestamp": "2024-01-01T10:00:00Z", "message": "feat: init"},
            {"id": "c2", "repo_id": "r1", "commit_hash": "h2", "author_id": "dev1", "commit_timestamp": "2024-01-02T10:00:00Z", "message": "feat: update"}
        ],
        "commit_file_changes": [
            {"id": "cfc1", "commit_id": "c1", "file_id": "f1", "additions": 100, "deletions": 10, "churn": 110, "change_type": "ADD"},
            {"id": "cfc2", "commit_id": "c2", "file_id": "f1", "additions": 20, "deletions": 5, "churn": 25, "change_type": "MODIFY"}
        ],
        "issues": [
            {"id": "iss1", "repo_id": "r1", "file_id": "f1", "module_name": "auth", "issue_type": "BUG", "severity": "HIGH", "remediation_effort_hours": 15.0, "status": "OPEN", "created_at": "2024-01-05T00:00:00Z", "resolved_at": None}
        ],
        "defects": [
            {"id": "d1", "repo_id": "r1", "file_id": "f1", "module_name": "auth", "bug_severity": "HIGH", "root_cause": "NullPointer", "reported_at": "2024-01-10T00:00:00Z", "fixed_at": None}
        ],
        "pull_requests": [
            {"id": "pr1", "repo_id": "r1", "pr_number": 1, "author_id": "dev1", "title": "PR 1", "status": "MERGED", "created_at": "2024-01-01T00:00:00Z", "merged_at": "2024-01-02T00:00:00Z", "review_comments_count": 2}
        ],
        "dependencies": [
            {"id": "dep1", "repo_id": "r1", "package_name": "flask", "current_version": "2.0.0", "latest_version": "3.0.0", "age_days": 180, "vulnerabilities_count": 0, "license_risk": 5.0}
        ],
        "business_context": [
            {"module_name": "auth", "criticality": 80.0, "user_facing": True, "revenue_impact": 75.0, "sla_tier": "Tier-1"}
        ],
        "repositories": [
            {"id": "r1", "name": "auth-service", "tech_stack": "Python", "business_domain": "Auth", "created_at": "2023-01-01T00:00:00Z", "business_impact_score": 80.0}
        ],
        "releases": [
            {"id": "rel1", "repo_id": "r1", "version": "v1.0.0", "release_date": "2024-01-15T00:00:00Z", "stability_score": 90.0}
        ]
    }

    result_df = spark_processor.process_pipeline(mock_cleaned)
    assert result_df is not None
    
    rows = result_df.collect()
    assert len(rows) == 1
    row = rows[0].asDict()
    
    # Verify aggregations
    assert row["code_churn"] == 135
    assert row["commit_count"] == 2
    assert row["change_frequency"] == 2
    assert row["issue_count"] == 1
    assert row["defect_count"] == 1
    
    # Verify window function result (dev1 authored both commits -> concentration = 1.0)
    assert row["developer"] == "dev1"
    assert row["developer_concentration"] == 1.0
