"""
Unit & Integration Tests for Member 2 ML Engine
"""

import os
import pytest
import numpy as np
from ml_engine.src.predictor import MLDefectPredictor
from ml_engine.src.explainability import get_feature_importances

project_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
model_path = os.path.join(project_root, "models", "rf_defect_model.pkl")


def test_model_artifact_exists():
    assert os.path.exists(model_path), "Trained model pickle artifact must exist."


def test_single_prediction():
    predictor = MLDefectPredictor(model_path=model_path)
    sample = {
        "lines_of_code": 1200,
        "cyclomatic_complexity": 35.0,
        "cognitive_complexity": 28.0,
        "code_smells_count": 12,
        "code_duplication_pct": 15.0,
        "security_hotspots_count": 2,
        "churn_lines_last_30d": 3500,
        "unit_test_coverage_pct": 30.0,
        "defects_reported_last_90d": 4,
    }
    res = predictor.predict_single(sample)
    assert 0.0 <= res["predicted_risk_score"] <= 100.0
    assert 0.0 <= res["predicted_defect_probability"] <= 1.0
    assert res["predicted_risk_level"] in ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    assert isinstance(res["is_hotspot"], bool)


def test_feature_importances_ranking():
    importances = get_feature_importances(model_path=model_path, top_n=5)
    assert len(importances) == 5
    assert all("feature" in item and "importance" in item for item in importances)
    assert importances[0]["importance"] >= importances[1]["importance"]
