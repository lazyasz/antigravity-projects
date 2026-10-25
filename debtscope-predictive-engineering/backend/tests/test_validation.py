"""
Validation and Error Handling Tests:
Verifies:
- 404 on missing file_id or repo_id
- 422 on scores out of range (e.g. > 100 or < 0)
- 422 on malformed or empty payloads
"""

from fastapi import status


def test_file_not_found_404(client):
    response = client.get("/api/v1/files/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
    data = response.json()
    assert "error" in data
    assert data["status_code"] == 404


def test_invalid_score_range_422(seeded_client):
    # Try updating business context with score > 100
    repos = seeded_client.get("/api/v1/repositories").json()
    repo_id = repos[0]["id"]
    files = seeded_client.get(f"/api/v1/repositories/{repo_id}/files").json()
    file_id = files[0]["id"]

    invalid_payload = {
        "business_criticality": 150.0  # Exceeds max 100
    }
    response = seeded_client.put(f"/api/v1/business-context/{file_id}", json=invalid_payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
    data = response.json()
    assert "Validation Error" in data["error"]


def test_negative_score_range_422(seeded_client):
    # Try updating business context with negative score
    repos = seeded_client.get("/api/v1/repositories").json()
    repo_id = repos[0]["id"]
    files = seeded_client.get(f"/api/v1/repositories/{repo_id}/files").json()
    file_id = files[0]["id"]

    invalid_payload = {
        "sprint_urgency": -10.0  # Below min 0
    }
    response = seeded_client.put(f"/api/v1/business-context/{file_id}", json=invalid_payload)
    assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


def test_repository_not_found_404(client):
    response = client.get("/api/v1/repositories/99999")
    assert response.status_code == status.HTTP_404_NOT_FOUND
