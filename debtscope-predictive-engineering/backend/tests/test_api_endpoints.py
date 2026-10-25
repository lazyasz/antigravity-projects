"""
Integration tests for all FastAPI REST API endpoints.
Tests:
- GET /health
- POST /analyze
- GET /repositories
- GET /metrics
- GET /technical-debt
- GET /predictions
- POST /predictions/ingest
- GET /hotspots
- GET /priorities
- GET /recommendations
- GET /files/{file_id}
- GET /comparison/demo
"""

from fastapi import status


def test_health_check(client):
    response = client.get("/health")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "healthy"
    assert data["database"] == "connected"


def test_list_repositories(seeded_client):
    response = seeded_client.get("/api/v1/repositories")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["name"] == "ecommerce-core-platform"
    assert data[0]["file_count"] >= 5


def test_list_metrics(seeded_client):
    response = seeded_client.get("/api/v1/metrics")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 5
    assert "technical_risk_score" in data[0]
    assert "lines_of_code" in data[0]


def test_list_technical_debt(seeded_client):
    response = seeded_client.get("/api/v1/technical-debt")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert "debt_category" in data[0]


def test_predictions_endpoints(seeded_client):
    # GET predictions
    response = seeded_client.get("/api/v1/predictions")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1

    # Ingest prediction
    file_id = data[0]["file_id"]
    ingest_payload = {
        "file_id": file_id,
        "predicted_future_risk": 99.0,
        "defect_probability": 0.95,
        "churn_risk_score": 90.0,
        "confidence_score": 0.98,
        "model_version": "xgboost-v2.0"
    }
    post_res = seeded_client.post("/api/v1/predictions/ingest", json=ingest_payload)
    assert post_res.status_code == status.HTTP_201_CREATED
    assert post_res.json()["predicted_future_risk"] == 99.0


def test_hotspots_endpoint(seeded_client):
    response = seeded_client.get("/api/v1/hotspots")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert "hotspot_type" in data[0]


def test_priorities_endpoint(seeded_client):
    response = seeded_client.get("/api/v1/priorities")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert data[0]["rank"] == 1
    assert data[0]["priority_score"] >= data[-1]["priority_score"]


def test_recommendations_endpoint(seeded_client):
    response = seeded_client.get("/api/v1/recommendations")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) >= 1
    assert "recommendation_type" in data[0]
    assert "action_summary" in data[0]


def test_file_detail_endpoint_contract(seeded_client):
    """
    Verifies that the API response strictly matches the Part 8 schema contract:
    {
      "file": "payment.py",
      "technical_risk": 82.0,
      "predicted_risk": 96.0,
      "business_impact": 98.0,
      "remediation_effort": 30.0,
      "release_urgency": 90.0,
      "priority_score": ...,
      "priority_level": "CRITICAL",
      "recommendation": "Refactor immediately"
    }
    """
    # Find payment file id
    repos = seeded_client.get("/api/v1/repositories").json()
    repo_id = repos[0]["id"]
    files = seeded_client.get(f"/api/v1/repositories/{repo_id}/files").json()
    payment_file = next(f for f in files if "payment" in f["file_name"])

    response = seeded_client.get(f"/api/v1/files/{payment_file['id']}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()

    # Exact field names check
    assert "file" in data
    assert "technical_risk" in data
    assert "predicted_risk" in data
    assert "business_impact" in data
    assert "remediation_effort" in data
    assert "release_urgency" in data
    assert "priority_score" in data
    assert "priority_level" in data
    assert "recommendation" in data
    assert "breakdown" in data

    assert data["file"] == "payment.py"
    assert data["priority_level"] == "CRITICAL"
    assert "Refactor immediately" in data["recommendation"]


def test_analyze_endpoint(seeded_client):
    response = seeded_client.post("/api/v1/analyze", json={})
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["status"] == "success"
    assert data["analyzed_files_count"] >= 5
    assert len(data["top_priorities"]) >= 1


def test_comparison_demo_endpoint(seeded_client):
    response = seeded_client.get("/api/v1/comparison/demo")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "comparison" in data
    assert len(data["comparison"]) == 2
    # Verify payment.py is intelligent rank 1
    assert data["comparison"][0]["file_name"] == "payment.py"
    assert data["comparison"][0]["intelligent_rank"] == 1
