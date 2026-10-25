"""
End-to-End Pipeline Integration Test.
Verifies the complete pipeline from raw ingestion to final feature dataset export,
enforcing strict compliance with Member 2 and Member 3 output contracts.
"""

import os
import json
import pytest
from src.data_pipeline.pipeline_runner import PipelineOrchestrator

REQUIRED_CONTRACT_FIELDS = [
    "file",
    "loc",
    "complexity",
    "churn",
    "code_churn",
    "change_frequency",
    "issue_count",
    "defect_count",
    "maintainability",
    "dependency_risk",
    "business_impact",
    "repository",
    "module",
    "developer",
    "commit_count",
    "code_smells",
    "dependency_age",
    "issue_severity",
    "pr_count",
    "release_frequency",
    "module_criticality",
    "debt_age",
    "release_impact",
    "maintenance_effort",
    "estimated_remediation_effort",
    "developer_concentration",
    "defect_frequency"
]

def test_full_pipeline_execution(tmp_path):
    """Executes the full pipeline in an isolated test directory and verifies the output contract."""
    raw_dir = str(tmp_path / "raw")
    proc_dir = str(tmp_path / "processed")
    feat_dir = str(tmp_path / "features")
    db_path = str(tmp_path / "test.db")

    orchestrator = PipelineOrchestrator(
        raw_dir=raw_dir,
        processed_dir=proc_dir,
        features_dir=feat_dir,
        db_path=db_path
    )

    result = orchestrator.run()

    # 1. Pipeline status
    assert result["status"] == "SUCCESS"
    assert result["records_count"] > 0

    # 2. File artifacts existence
    json_path = os.path.join(feat_dir, "engineering_features.json")
    csv_path = os.path.join(feat_dir, "engineering_features.csv")
    parquet_path = os.path.join(feat_dir, "engineering_features.parquet")
    
    assert os.path.exists(json_path), "JSON features file missing"
    assert os.path.exists(csv_path), "CSV features file missing"
    assert os.path.exists(parquet_path), "Parquet features file missing"

    # 3. Output contract verification
    with open(json_path, "r", encoding="utf-8") as f:
        records = json.load(f)

    assert len(records) == result["records_count"]
    
    for rec in records:
        for field in REQUIRED_CONTRACT_FIELDS:
            assert field in rec, f"Missing required contract field '{field}' in record: {rec}"
            assert rec[field] is not None, f"Field '{field}' cannot be None in record: {rec}"

    # 4. Check specific values for payment.py
    payment_records = [r for r in records if r["file"] == "payment.py"]
    assert len(payment_records) == 1
    payment = payment_records[0]
    assert payment["loc"] == 1842
    assert payment["complexity"] == 41.0
    assert 40.0 <= payment["maintainability"] <= 45.0
    assert payment["business_impact"] >= 90.0
