"""
Automated Unit & Integration Tests for Google Auth, Jira Cloud, and Notion Integrations.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_auth_me_default():
    """Verify default active user profile (Lead Architect)."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "authenticated"
    assert "name" in data["user"]
    assert "role" in data["user"]
    assert "permissions" in data["user"]


def test_auth_profiles_list():
    """Verify listing of all available demo persona profiles."""
    response = client.get("/api/v1/auth/profiles")
    assert response.status_code == 200
    data = response.json()
    assert "profiles" in data
    assert "dhruv" in data["profiles"]
    assert "sarah" in data["profiles"]
    assert "alex" in data["profiles"]


def test_auth_switch_profile():
    """Verify switching personas dynamically."""
    response = client.post("/api/v1/auth/switch-profile", json={"profile_key": "sarah"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["user"]["role_code"] == "ml_engineer"
    assert data["user"]["name"] == "Sarah Jenkins"

    # Switch back to Dhruv
    client.post("/api/v1/auth/switch-profile", json={"profile_key": "dhruv"})


def test_auth_google_login_mock():
    """Verify Google token decoding and authentication."""
    mock_token = "header.eyJlbWFpbCI6ICJ0ZXN0LnVzZXJAZW5naW5lZXJpbmcub3JnIiwgIm5hbWUiOiAiVGVzdCBJbnZlc3RpZ2F0b3IifQ.signature"
    response = client.post("/api/v1/auth/google", json={"credential": mock_token})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["user"]["email"] == "test.user@engineering.org"
    assert data["user"]["name"] == "Test Investigator"


def test_integrations_status():
    """Verify status reporting for all 3 integrations."""
    response = client.get("/api/v1/integrations/status")
    assert response.status_code == 200
    data = response.json()
    assert "google_auth" in data
    assert "jira" in data
    assert "notion" in data
    assert data["jira"]["project_key"] == "DEBT"


def test_jira_create_issue():
    """Verify single Jira issue creation."""
    payload = {
        "component_name": "backend/services/payment_gateway.py",
        "priority_score": 88.5,
        "remediation_effort_hours": 16.0,
        "defect_probability": 0.82,
        "technical_risk": 91.0,
        "business_impact": 85.0,
        "roi_quadrant": "Strategic Refactoring",
        "issue_type": "Task"
    }
    response = client.post("/api/v1/integrations/jira/create-issue", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "issue_key" in data
    assert "DEBT-" in data["issue_key"]
    assert data["story_points"] == 3  # 16 hrs maps to 3 pts
    assert data["priority"] == "Highest"


def test_jira_bulk_export():
    """Verify batch export of components to a Jira sprint."""
    payload = {
        "sprint_name": "Sprint 25 Refactoring Blitz",
        "components": [
            {
                "component_name": "auth_middleware.py",
                "priority_score": 78.0,
                "remediation_effort_hours": 6.0,
                "roi_quadrant": "Quick Wins"
            },
            {
                "component_name": "db_pool.py",
                "priority_score": 62.0,
                "remediation_effort_hours": 24.0,
                "roi_quadrant": "Strategic Refactoring"
            }
        ]
    }
    response = client.post("/api/v1/integrations/jira/bulk-export", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["total_tickets_created"] == 2
    assert data["total_story_points"] > 0
    assert len(data["issues"]) == 2


def test_notion_sync_backlog():
    """Verify syncing component list into Notion database."""
    payload = {
        "components": [
            {
                "component_name": "ml_inference_pipeline.py",
                "priority_score": 92.4,
                "remediation_effort_hours": 14.0,
                "technical_risk": 89.0,
                "roi_quadrant": "Quick Wins"
            }
        ]
    }
    response = client.post("/api/v1/integrations/notion/sync", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert data["synced_count"] == 1
    assert "notion_url" in data


def test_notion_create_audit_report():
    """Verify generation of Executive Audit Report in Notion."""
    payload = {
        "title": "Q3 2026 Predictive Tech Debt Assessment",
        "total_components": 85,
        "avg_priority_score": 68.4,
        "quick_wins_count": 19,
        "critical_hotspots_count": 9
    }
    response = client.post("/api/v1/integrations/notion/create-report", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "report_id" in data
    assert "notion_url" in data
