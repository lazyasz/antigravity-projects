# API Integration Contract

This document provides the frontend team and ML/Data pipeline engineers with the exact schema definitions and endpoints exposed by the decision intelligence platform.

**Base URL**: `http://localhost:8000/api/v1`  
**Interactive Docs**: `http://localhost:8000/docs` (OpenAPI / Swagger UI)  
**Alternative Docs**: `http://localhost:8000/redoc`

---

## 1. Primary Prioritization & Analysis Endpoints

### `GET /files/{file_id}`
Returns complete deep-dive file details with mathematical breakdown matching Part 8 of the platform specification.

**Response `200 OK`**:
```json
{
  "file": "payment.py",
  "file_id": 1,
  "file_path": "services/payment.py",
  "repository_id": 1,
  "repository_name": "ecommerce-core-platform",
  "technical_risk": 89.0,
  "predicted_risk": 96.0,
  "business_impact": 96.5,
  "remediation_effort": 30.0,
  "release_urgency": 90.8,
  "priority_score": 84.58,
  "priority_level": "CRITICAL",
  "recommendation": "Refactor immediately",
  "action_summary": "Immediate senior engineer allocation, write integration tests, and initiate refactoring.",
  "quadrant": "QUICK_WIN",
  "roi_score": 290.51,
  "breakdown": {
    "static_technical_risk": 82.0,
    "predicted_ml_risk": 96.0,
    "composite_technical_risk": 89.0,
    "business_criticality": 98.0,
    "customer_impact": 95.0,
    "module_criticality": 95.0,
    "composite_business_impact": 96.5,
    "release_proximity": 90.0,
    "sprint_urgency": 92.0,
    "composite_urgency": 90.8,
    "maintenance_cost": 85.0,
    "debt_age_days": 180,
    "normalized_debt_age": 49.32,
    "baseline_priority_score": 83.62,
    "remediation_effort_factor": 30.0,
    "effort_deduction_or_boost": 10.5
  },
  "technical_debt_items": [
    {
      "id": 1,
      "category": "COMPLEXITY",
      "severity": "CRITICAL",
      "debt_age_days": 180,
      "description": "God method 'process_stripe_webhook' with cyclomatic complexity of 24.",
      "line_number": 142,
      "remediation_guidance": "Extract gateway-specific handlers into Polymorphic Strategy classes."
    }
  ]
}
```

---

### `GET /priorities`
Returns ranked technical debt backlog sorted by business-aware Priority Score.

**Query Parameters**:
- `repository_id` (optional `int`)
- `priority_level` (optional `str`: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
- `limit` (optional `int`, default `50`)
- `offset` (optional `int`, default `0`)

**Response `200 OK`**:
```json
[
  {
    "rank": 1,
    "file_id": 1,
    "file_name": "payment.py",
    "file_path": "services/payment.py",
    "language": "Python",
    "lines_of_code": 680,
    "technical_risk": 89.0,
    "predicted_risk": 96.0,
    "business_impact": 96.5,
    "remediation_effort": 30.0,
    "release_urgency": 90.8,
    "priority_score": 84.58,
    "priority_level": "CRITICAL",
    "recommendation": "Immediate senior engineer allocation, write integration tests, and initiate refactoring.",
    "quadrant": "QUICK_WIN",
    "roi_score": 290.51
  }
]
```

---

### `GET /comparison/demo`
Live comparison endpoint demonstrating that technical risk alone does NOT determine remediation priority.

**Response `200 OK`**:
```json
{
  "title": "Business-Aware Prioritization vs Traditional Static Severity",
  "key_takeaway": "Our platform prevents engineering teams from wasting sprint cycles on low-value complex code.",
  "comparison": [
    {
      "file_name": "payment.py",
      "technical_risk": 89.0,
      "predicted_risk": 96.0,
      "business_impact": 96.5,
      "release_urgency": 90.8,
      "remediation_effort": 30.0,
      "priority_score": 84.58,
      "priority_level": "CRITICAL",
      "recommendation": "Refactor immediately",
      "traditional_rank": 2,
      "intelligent_rank": 1,
      "explanation": "Even though technical risk (82.0) was slightly lower than analytics.py (90.0), payment.py is ranked #1 CRITICAL because it protects core revenue checkout, faces high customer blast radius (95.0), and has a fast remediation turnaround (Effort: 30.0)."
    },
    {
      "file_name": "analytics.py",
      "technical_risk": 89.0,
      "predicted_risk": 88.0,
      "business_impact": 27.25,
      "release_urgency": 28.0,
      "remediation_effort": 40.0,
      "priority_score": 56.0,
      "priority_level": "MEDIUM",
      "recommendation": "Schedule for upcoming sprint",
      "traditional_rank": 1,
      "intelligent_rank": 4,
      "explanation": "Traditional static analyzers rank this as the #1 most urgent file due to high cyclomatic complexity (32.0) and raw technical risk (90.0). However, because it runs as a non-blocking background analytics collector (Business Criticality: 30.0), fixing it during release freeze yields low business ROI."
    }
  ],
  "insights": [
    "1. Traditional tools measure Code Severity; Decision Intelligence measures Business Exposure and Remediation ROI.",
    "2. High technical risk in an isolated component (analytics.py) does not disrupt active customer transactions.",
    "3. Accounting for remediation effort ensures teams tackle High-Value Quick Wins first.",
    "4. Transparent scoring gives engineering managers justifiable arguments for sprint backlog grooming."
  ]
}
```

---

## 2. Ingestion Endpoints (For ML & Data Pipeline Teams)

### `POST /predictions/ingest`
Ingests Member 2 ML model outputs.

**Request Payload**:
```json
{
  "file_id": 1,
  "predicted_future_risk": 96.0,
  "defect_probability": 0.88,
  "churn_risk_score": 92.0,
  "confidence_score": 0.94,
  "model_version": "xgboost-v1.2"
}
```

### `POST /metrics/ingest`
Ingests Member 1 static analysis metrics.

**Request Payload**:
```json
{
  "file_id": 1,
  "cyclomatic_complexity": 24.5,
  "cognitive_complexity": 29.0,
  "code_smells_count": 18,
  "duplication_pct": 14.5,
  "test_coverage_pct": 38.0,
  "code_churn_commits": 19,
  "bug_frequency": 9
}
```

### `PUT /business-context/{file_id}`
Updates business context parameters in real time.

**Request Payload**:
```json
{
  "business_criticality": 95.0,
  "customer_impact": 90.0,
  "release_proximity": 85.0,
  "sprint_urgency": 90.0,
  "estimated_remediation_effort": 25.0
}
```
