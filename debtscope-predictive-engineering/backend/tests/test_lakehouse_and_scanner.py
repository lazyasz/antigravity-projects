"""
Tests for Lakehouse Data Quality Audits and Repository Scanner Endpoints
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_lakehouse_quality_audit_endpoint():
    response = client.get("/api/lakehouse/quality-audit")
    assert response.status_code == 200
    data = response.json()
    assert "total_checks" in data
    assert "passed_checks" in data
    assert "pass_rate_pct" in data
    assert "audit_logs" in data
    assert isinstance(data["audit_logs"], list)

def test_lakehouse_lineage_endpoint():
    response = client.get("/api/lakehouse/lineage-overview")
    assert response.status_code == 200
    data = response.json()
    assert "layers" in data
    assert "bronze" in data["layers"]
    assert "silver" in data["layers"]
    assert "gold" in data["layers"]

def test_lakehouse_ml_metrics_endpoint():
    response = client.get("/api/lakehouse/ml-metrics")
    assert response.status_code == 200
    data = response.json()
    assert "regression_td_dataset" in data or "status" in data

def test_scan_repository_endpoint():
    response = client.post("/api/repositories/scan", json={"url": "https://github.com/apache/zookeeper"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "repository" in data
    assert "files" in data
    assert len(data["files"]) > 0

def test_scan_live_shorthand_flask():
    response = client.post("/api/repositories/scan", json={"url": "pallets/flask"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "flask" in data["repository"]["name"].lower()
    assert "summary" in data
    assert data["summary"]["total_files_analyzed"] > 0
    assert len(data["files"]) > 0

def test_scan_live_url_fastapi():
    response = client.post("/api/repositories/scan", json={"url": "https://github.com/tiangolo/fastapi"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert "fastapi" in data["repository"]["name"].lower()
    assert len(data["files"]) > 0

