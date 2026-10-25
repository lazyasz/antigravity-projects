"""
Unit tests for deterministic recommendation engine and sprint capacity planner.
"""

from backend.services.recommendation_service import RecommendationService
from backend.services.priority_service import PriorityService
from backend.database.models import SourceFile


def test_recommendation_generation_rules(seeded_db):
    """Verifies deterministic mapping of priority levels to actionable engineering directives."""
    recs = RecommendationService.get_recommendations_response(seeded_db)
    assert len(recs) > 0

    for r in recs:
        if r.priority_level == "CRITICAL":
            assert "Refactor immediately" in r.recommendation_type
            assert "Current Sprint" in r.sprint_target
            assert r.estimated_story_points >= 3
        elif r.priority_level == "HIGH":
            assert "current sprint" in r.recommendation_type.lower()
        elif r.priority_level == "LOW":
            assert "Monitor" in r.recommendation_type


def test_sprint_plan_budget_allocation(seeded_db):
    """Verifies that sprint planner stays within story point capacity while prioritizing critical items."""
    sprint_plan = RecommendationService.get_sprint_plan(seeded_db, capacity_points=15)
    assert sprint_plan.allocated_points <= 15
    assert len(sprint_plan.items) > 0

    # Ensure highest priority items are allocated first
    scores = [item.priority_score for item in sprint_plan.items]
    assert scores == sorted(scores, reverse=True)
