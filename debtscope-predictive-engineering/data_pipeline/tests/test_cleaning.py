"""
Unit tests for Data Cleaning & Validation (ETL) layer.
Verifies missing value imputation, duplicate removal, and invalid value sanitization.
"""

import pytest
from datetime import datetime, timedelta
from src.data_pipeline.cleaning import DataCleaningPipeline

@pytest.fixture
def cleaner(tmp_path):
    return DataCleaningPipeline(processed_dir=str(tmp_path / "processed"))

def test_missing_values_imputation(cleaner):
    """Verifies that null authors, null severities, and missing effort hours are imputed."""
    raw_commits = [
        {"id": "c1", "commit_hash": "hash1", "author_id": None, "commit_timestamp": "2024-01-01T00:00:00Z", "message": "msg"}
    ]
    cleaned_commits = cleaner.clean_commits(raw_commits)
    assert len(cleaned_commits) == 1
    assert cleaned_commits[0]["author_id"] == "unknown_contributor"
    assert cleaner.audit_log["nulls_imputed"] >= 1

    raw_issues = [
        {"id": "iss1", "severity": None, "remediation_effort_hours": None}
    ]
    cleaned_issues = cleaner.clean_issues(raw_issues)
    assert len(cleaned_issues) == 1
    assert cleaned_issues[0]["severity"] == "MEDIUM"
    assert cleaned_issues[0]["remediation_effort_hours"] == 10.0

def test_duplicate_records_removal(cleaner):
    """Verifies that duplicate commits and duplicate file changes are removed."""
    raw_commits = [
        {"id": "c1", "commit_hash": "dup_hash", "author_id": "dev1", "commit_timestamp": "2024-01-01T00:00:00Z"},
        {"id": "c2", "commit_hash": "dup_hash", "author_id": "dev1", "commit_timestamp": "2024-01-01T00:00:00Z"}
    ]
    cleaned = cleaner.clean_commits(raw_commits)
    assert len(cleaned) == 1
    assert cleaner.audit_log["duplicates_removed"] == 1

    raw_changes = [
        {"id": "cfc1", "commit_id": "c1", "file_id": "f1", "additions": 10, "deletions": 5, "churn": 15},
        {"id": "cfc2", "commit_id": "c1", "file_id": "f1", "additions": 10, "deletions": 5, "churn": 15}
    ]
    cleaned_changes = cleaner.clean_commit_file_changes(raw_changes)
    assert len(cleaned_changes) == 1

def test_invalid_values_sanitization(cleaner):
    """Verifies negative LOC and negative churn are sanitized to positive bounds."""
    raw_files = [
        {"id": "f1", "repo_id": "r1", "file_path": "a.py", "loc": -500, "cyclomatic_complexity": -2.0, "code_smells": -5}
    ]
    cleaned_files = cleaner.clean_files(raw_files)
    assert len(cleaned_files) == 1
    assert cleaned_files[0]["loc"] == 500
    assert cleaned_files[0]["cyclomatic_complexity"] == 1.0
    assert cleaned_files[0]["code_smells"] == 0

    raw_changes = [
        {"id": "cfc1", "commit_id": "c1", "file_id": "f1", "additions": -30, "deletions": 10, "churn": -20}
    ]
    cleaned_changes = cleaner.clean_commit_file_changes(raw_changes)
    assert cleaned_changes[0]["additions"] == 30
    assert cleaned_changes[0]["churn"] == 40

def test_future_timestamp_sanitization(cleaner):
    """Verifies future commit timestamps are clamped to current time."""
    future_time = (datetime.utcnow() + timedelta(days=365)).isoformat() + "Z"
    raw_commits = [
        {"id": "c1", "commit_hash": "future_hash", "author_id": "dev1", "commit_timestamp": future_time}
    ]
    cleaned = cleaner.clean_commits(raw_commits)
    assert len(cleaned) == 1
    # Should not equal the distant future timestamp
    assert cleaned[0]["commit_timestamp"] != future_time
