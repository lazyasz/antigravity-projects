"""
Tests for Simulator, AI Remediation Recipe, CI/CD PR Gate, and Executive Audit Features.
"""

import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_what_if_simulation_endpoint():
    """Tests the interactive What-If ML defect and financial ROI calculator."""
    payload = {
        "churn": 150,
        "complexity": 18.0,
        "debt_minutes": 180.0,
        "experience": 4,
        "refactoring_effort_pct": 50.0,
        "developer_seniority": "Senior Engineer (6-8 yrs)",
        "test_coverage_pct": 85.0,
        "hourly_rate": 90.0
    }
    response = client.post("/api/simulator/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "baseline" in data
    assert "simulated" in data
    assert "impact" in data
    assert data["impact"]["faults_prevented"] >= 0
    assert data["impact"]["dollar_savings"] >= 0
    assert data["impact"]["total_hours_saved"] >= 0


def test_ai_remediation_recipe_endpoint():
    """Tests generation of actionable AI refactoring recipe and code diffs."""
    payload = {
        "file_path": "src/core/OrderManager.java",
        "risk_score": 88.0,
        "debt_minutes": 150.0,
        "complexity": 22.0
    }
    response = client.post("/api/recommendations/ai-recipe", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "identified_smell" in data
    assert "recipe_steps" in data
    assert len(data["recipe_steps"]) > 0
    assert "code_diff" in data
    assert "before" in data["code_diff"]
    assert "after" in data["code_diff"]


def test_ci_cd_pr_evaluation_passed():
    """Tests CI/CD PR quality gate for low-risk changes."""
    payload = {
        "pr_number": 101,
        "pr_title": "docs: update API documentation",
        "author": "dev.junior",
        "author_experience_commits": 10,
        "target_branch": "main",
        "changed_files": [
            {
                "filename": "docs/readme.md",
                "lines_added": 15,
                "lines_deleted": 2,
                "cyclomatic_complexity": 1.0,
                "debt_minutes": 5.0
            }
        ]
    }
    response = client.post("/api/ci-cd/evaluate-pr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["gate_status"] == "PASSED"
    assert "file_assessments" in data


def test_ci_cd_pr_evaluation_blocked():
    """Tests CI/CD PR quality gate blocking critical high-risk code."""
    payload = {
        "pr_number": 102,
        "pr_title": "feat: massive refactor without tests",
        "author": "dev.junior",
        "author_experience_commits": 1,
        "target_branch": "main",
        "changed_files": [
            {
                "filename": "src/core/CoreEngine.java",
                "lines_added": 500,
                "lines_deleted": 120,
                "cyclomatic_complexity": 35.0,
                "debt_minutes": 350.0
            }
        ]
    }
    response = client.post("/api/ci-cd/evaluate-pr", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["gate_status"] == "BLOCKED"
    assert data["summary"]["requires_senior_approval"] is True


def test_executive_audit_summary_report():
    """Tests executive audit summary endpoint."""
    response = client.get("/api/reports/executive-summary")
    assert response.status_code == 200
    data = response.json()
    assert "overall_health_grade" in data
    assert "executive_kpis" in data
    assert "top_hotspot_actions" in data
    assert len(data["compliance_certifications"]) > 0


def test_financial_tco_calculation_endpoint():
    """Tests executive financial TCO and interest rate calculations."""
    payload = {
        "hourly_rate": 90.0,
        "team_size": 15,
        "sprint_length_weeks": 2,
        "velocity_drag_pct": 25.0
    }
    response = client.post("/api/simulator/financial-tco", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "kpis" in data
    assert "subsystems" in data
    assert "twelve_month_projection" in data
    assert data["kpis"]["principal_debt_usd"] > 0
    assert data["kpis"]["monthly_interest_drag_usd"] > 0
    assert data["kpis"]["payback_period_months"] > 0
    assert len(data["subsystems"]) == 5
    assert len(data["twelve_month_projection"]) == 12

