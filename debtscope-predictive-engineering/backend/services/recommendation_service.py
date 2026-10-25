"""
Recommendation Engine: Deterministic rule-based decision logic.
Converts priority scores and ROI quadrants into actionable engineering recommendations.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from backend.database.models import SourceFile, PriorityScore, Recommendation
from backend.schemas.recommendation import RecommendationResponse, SprintPlanSummary


class RecommendationService:
    @staticmethod
    def generate_file_recommendation(db: Session, file_id: int) -> Optional[Recommendation]:
        file_obj = db.query(SourceFile).filter(SourceFile.id == file_id).first()
        if not file_obj:
            return None

        score = file_obj.priority_score
        if not score:
            return None

        bctx = file_obj.business_context
        effort = bctx.estimated_remediation_effort if bctx else 50.0

        # Deterministic Rule Mapping based on Priority Level & Quadrant
        if score.priority_level == "CRITICAL":
            rec_type = "Refactor immediately"
            action_summary = "Immediate senior engineer allocation, write integration tests, and initiate refactoring."
            rationale = (
                f"High combined technical risk ({score.composite_technical_risk}) in business-critical module "
                f"({score.composite_business_impact}) under high release/sprint urgency ({score.urgency_score})."
            )
            sprint_target = "Current Sprint (Hotfix/Blocker)"
            story_points = 8 if effort > 60 else (5 if effort > 30 else 3)

        elif score.priority_level == "HIGH":
            rec_type = "Address during current sprint"
            action_summary = "Include in current sprint technical debt allocation; refactor offending high-complexity functions."
            rationale = (
                f"Significant technical debt ({score.composite_technical_risk}) impacting key product workflows "
                f"({score.composite_business_impact}). High ROI fix ({score.roi_score:.1f})."
            )
            sprint_target = "Current Sprint"
            story_points = 5 if effort > 50 else 3

        elif score.priority_level == "MEDIUM":
            rec_type = "Schedule for upcoming sprint"
            action_summary = "Log debt ticket in backlog; review test coverage and refactor during next scheduled feature cycle."
            rationale = (
                f"Moderate debt impact ({score.composite_technical_risk}). Component has manageable business risk "
                f"({score.composite_business_impact}) but requires monitoring."
            )
            sprint_target = "Upcoming Sprint"
            story_points = 3 if effort > 40 else 2

        else: # LOW
            rec_type = "Monitor"
            action_summary = "No immediate refactoring needed; enforce linting rules and fix opportunistically during maintenance."
            rationale = (
                f"Low priority score ({score.final_priority_score:.1f}). Peripheral utility or low business exposure."
            )
            sprint_target = "Backlog / Maintenance"
            story_points = 1

        # Check existing recommendation
        rec_obj = file_obj.recommendations[0] if file_obj.recommendations else None
        if not rec_obj:
            rec_obj = Recommendation(
                file_id=file_id,
                recommendation_type=rec_type,
                action_summary=action_summary,
                rationale=rationale,
                sprint_target=sprint_target,
                estimated_story_points=story_points,
            )
            db.add(rec_obj)
        else:
            rec_obj.recommendation_type = rec_type
            rec_obj.action_summary = action_summary
            rec_obj.rationale = rationale
            rec_obj.sprint_target = sprint_target
            rec_obj.estimated_story_points = story_points

        db.commit()
        db.refresh(rec_obj)
        return rec_obj

    @classmethod
    def generate_all_recommendations(cls, db: Session, repo_id: Optional[int] = None) -> List[Recommendation]:
        query = db.query(SourceFile).filter(SourceFile.is_active == True)
        if repo_id:
            query = query.filter(SourceFile.repository_id == repo_id)
        
        files = query.all()
        recs = []
        for f in files:
            r = cls.generate_file_recommendation(db, f.id)
            if r:
                recs.append(r)
        return recs

    @classmethod
    def get_recommendations_response(
        cls,
        db: Session,
        repo_id: Optional[int] = None,
        recommendation_type: Optional[str] = None
    ) -> List[RecommendationResponse]:
        query = db.query(Recommendation).join(SourceFile).filter(SourceFile.is_active == True)
        if repo_id:
            query = query.filter(SourceFile.repository_id == repo_id)
        if recommendation_type:
            query = query.filter(Recommendation.recommendation_type.ilike(f"%{recommendation_type}%"))

        recs = query.all()
        results = []
        for r in recs:
            file_obj = r.file
            score = file_obj.priority_score
            results.append(
                RecommendationResponse(
                    id=r.id,
                    file_id=file_obj.id,
                    file_name=file_obj.file_name,
                    file_path=file_obj.file_path,
                    recommendation_type=r.recommendation_type,
                    action_summary=r.action_summary,
                    rationale=r.rationale,
                    sprint_target=r.sprint_target,
                    estimated_story_points=r.estimated_story_points,
                    priority_level=score.priority_level if score else "UNKNOWN",
                    priority_score=score.final_priority_score if score else 0.0,
                    created_at=r.created_at,
                )
            )
        # Sort by priority score descending
        results.sort(key=lambda x: x.priority_score, reverse=True)
        return results

    @classmethod
    def get_sprint_plan(cls, db: Session, capacity_points: int = 25) -> SprintPlanSummary:
        recs = cls.get_recommendations_response(db)
        allocated = []
        total_points = 0

        # Prioritize CRITICAL and HIGH recommendations
        for r in recs:
            if total_points + r.estimated_story_points <= capacity_points:
                allocated.append(r)
                total_points += r.estimated_story_points

        return SprintPlanSummary(
            sprint_name="Sprint 24 - Technical Debt Hardening",
            target_capacity_points=capacity_points,
            allocated_points=total_points,
            candidate_files_count=len(allocated),
            items=allocated,
        )
