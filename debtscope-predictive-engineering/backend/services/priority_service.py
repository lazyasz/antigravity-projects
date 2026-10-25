"""
Priority Engine: Core business-aware decision intelligence service.
Calculates transparent, multi-factor technical debt priority scores, ROI indices, and ranks.
"""

from typing import List, Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import desc
from backend.database.models import (
    SourceFile,
    EngineeringMetric,
    MLPrediction,
    BusinessContext,
    PriorityScore,
    TechnicalDebtItem,
)
from backend.schemas.priority import ScoreBreakdown, FileDetailResponse, RankedFilePriority
from backend.config import settings


class PriorityService:
    @staticmethod
    def calculate_file_priority(db: Session, file_id: int) -> Optional[PriorityScore]:
        file_obj = db.query(SourceFile).filter(SourceFile.id == file_id).first()
        if not file_obj:
            return None

        # 1. Fetch Metrics & Technical Risk
        metric = file_obj.metrics
        static_tech_risk = metric.technical_risk_score if metric else 40.0

        # 2. Fetch ML Prediction
        prediction = file_obj.prediction
        ml_risk = prediction.predicted_future_risk if prediction else static_tech_risk

        # Composite Technical Risk (50% static + 50% ML)
        composite_tech_risk = (0.50 * static_tech_risk) + (0.50 * ml_risk)

        # 3. Fetch Business Context
        bctx = file_obj.business_context
        biz_crit = bctx.business_criticality if bctx else 50.0
        cust_impact = bctx.customer_impact if bctx else 50.0
        mod_crit = bctx.module_criticality if bctx else 50.0
        rel_prox = bctx.release_proximity if bctx else 50.0
        sprint_urg = bctx.sprint_urgency if bctx else 50.0
        maint_cost = bctx.maintenance_cost if bctx else 50.0
        effort = bctx.estimated_remediation_effort if bctx else 50.0

        # Composite Business Impact
        composite_business_impact = (0.50 * biz_crit) + (0.35 * cust_impact) + (0.15 * mod_crit)

        # Composite Release / Sprint Urgency
        composite_urgency = (0.60 * rel_prox) + (0.40 * sprint_urg)

        # Debt Age Analysis
        debt_items = file_obj.debt_items
        max_debt_age = max([d.debt_age_days for d in debt_items], default=30)
        normalized_debt_age = min(100.0, (max_debt_age / 365.0) * 100.0)

        # Baseline Priority Score (0–100)
        baseline_score = (
            (settings.WEIGHT_TECHNICAL_RISK * composite_tech_risk) +
            (settings.WEIGHT_BUSINESS_IMPACT * composite_business_impact) +
            (settings.WEIGHT_RELEASE_URGENCY * composite_urgency) +
            (settings.WEIGHT_MAINTENANCE_COST * maint_cost) +
            (settings.WEIGHT_DEBT_AGE * normalized_debt_age)
        )

        # Effort & ROI Adjustment
        # ROI Score = Value / max(15, Effort) * 100
        roi_score = (baseline_score / max(15.0, effort)) * 100.0

        # Final Priority Score accounting for remediation effort (higher ROI gives boost, high effort gives gentle damping)
        final_score = (
            (1.0 - settings.WEIGHT_REMEDIATION_EFFORT) * baseline_score +
            settings.WEIGHT_REMEDIATION_EFFORT * (100.0 - effort)
        )
        final_score = max(0.0, min(100.0, final_score))

        # Categorize Priority Level
        if final_score >= 80.0 or (composite_business_impact >= 85.0 and composite_tech_risk >= 75.0):
            priority_level = "CRITICAL"
        elif final_score >= 60.0:
            priority_level = "HIGH"
        elif final_score >= 40.0:
            priority_level = "MEDIUM"
        else:
            priority_level = "LOW"

        # Determine Quadrant
        if baseline_score >= 60.0 and effort <= 40.0:
            quadrant = "QUICK_WIN"
        elif baseline_score >= 60.0 and effort > 40.0:
            quadrant = "STRATEGIC_REFACTOR"
        elif baseline_score < 60.0 and effort <= 40.0:
            quadrant = "OPPORTUNISTIC"
        else:
            quadrant = "DEPRIORITIZED"

        # Save or Update PriorityScore in DB
        priority_record = file_obj.priority_score
        if not priority_record:
            priority_record = PriorityScore(
                file_id=file_id,
                composite_technical_risk=round(composite_tech_risk, 2),
                composite_business_impact=round(composite_business_impact, 2),
                urgency_score=round(composite_urgency, 2),
                baseline_score=round(baseline_score, 2),
                final_priority_score=round(final_score, 2),
                priority_level=priority_level,
                roi_score=round(roi_score, 2),
                quadrant=quadrant,
                rank=1,
            )
            db.add(priority_record)
        else:
            priority_record.composite_technical_risk = round(composite_tech_risk, 2)
            priority_record.composite_business_impact = round(composite_business_impact, 2)
            priority_record.urgency_score = round(composite_urgency, 2)
            priority_record.baseline_score = round(baseline_score, 2)
            priority_record.final_priority_score = round(final_score, 2)
            priority_record.priority_level = priority_level
            priority_record.roi_score = round(roi_score, 2)
            priority_record.quadrant = quadrant

        db.commit()
        db.refresh(priority_record)
        return priority_record

    @classmethod
    def analyze_all_files(cls, db: Session, repo_id: Optional[int] = None) -> List[PriorityScore]:
        query = db.query(SourceFile).filter(SourceFile.is_active == True)
        if repo_id:
            query = query.filter(SourceFile.repository_id == repo_id)
        
        files = query.all()
        scores = []
        for f in files:
            score = cls.calculate_file_priority(db, f.id)
            if score:
                scores.append(score)

        # Update Ranks based on final_priority_score descending
        scores_sorted = sorted(scores, key=lambda s: s.final_priority_score, reverse=True)
        for idx, s in enumerate(scores_sorted, start=1):
            s.rank = idx

        db.commit()
        return scores_sorted

    @classmethod
    def get_ranked_priorities(
        cls,
        db: Session,
        repo_id: Optional[int] = None,
        priority_level: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[RankedFilePriority]:
        query = db.query(PriorityScore).join(SourceFile).filter(SourceFile.is_active == True)
        if repo_id:
            query = query.filter(SourceFile.repository_id == repo_id)
        if priority_level:
            query = query.filter(PriorityScore.priority_level == priority_level.upper())

        scores = query.order_by(PriorityScore.rank.asc()).offset(offset).limit(limit).all()

        results = []
        for s in scores:
            file_obj = s.file
            bctx = file_obj.business_context
            rec = file_obj.recommendations[0] if file_obj.recommendations else None
            recommendation_text = rec.action_summary if rec else f"Schedule review for {s.priority_level} priority"

            results.append(
                RankedFilePriority(
                    rank=s.rank,
                    file_id=file_obj.id,
                    file_name=file_obj.file_name,
                    file_path=file_obj.file_path,
                    language=file_obj.language,
                    lines_of_code=file_obj.lines_of_code,
                    technical_risk=s.composite_technical_risk,
                    predicted_risk=file_obj.prediction.predicted_future_risk if file_obj.prediction else s.composite_technical_risk,
                    business_impact=s.composite_business_impact,
                    remediation_effort=bctx.estimated_remediation_effort if bctx else 50.0,
                    release_urgency=s.urgency_score,
                    priority_score=s.final_priority_score,
                    priority_level=s.priority_level,
                    recommendation=recommendation_text,
                    quadrant=s.quadrant,
                    roi_score=s.roi_score,
                )
            )
        return results

    @classmethod
    def get_file_detail_response(cls, db: Session, file_id: int) -> Optional[FileDetailResponse]:
        file_obj = db.query(SourceFile).filter(SourceFile.id == file_id).first()
        if not file_obj:
            return None

        # Ensure priority is computed
        score = file_obj.priority_score
        if not score:
            score = cls.calculate_file_priority(db, file_id)

        metric = file_obj.metrics
        prediction = file_obj.prediction
        bctx = file_obj.business_context
        debt_items = file_obj.debt_items
        rec = file_obj.recommendations[0] if file_obj.recommendations else None

        static_risk = metric.technical_risk_score if metric else 40.0
        ml_risk = prediction.predicted_future_risk if prediction else static_risk
        biz_crit = bctx.business_criticality if bctx else 50.0
        cust_imp = bctx.customer_impact if bctx else 50.0
        mod_crit = bctx.module_criticality if bctx else 50.0
        rel_prox = bctx.release_proximity if bctx else 50.0
        sprint_urg = bctx.sprint_urgency if bctx else 50.0
        maint_cost = bctx.maintenance_cost if bctx else 50.0
        effort = bctx.estimated_remediation_effort if bctx else 50.0

        max_age = max([d.debt_age_days for d in debt_items], default=30)
        norm_age = min(100.0, (max_age / 365.0) * 100.0)

        breakdown = ScoreBreakdown(
            static_technical_risk=round(static_risk, 2),
            predicted_ml_risk=round(ml_risk, 2),
            composite_technical_risk=score.composite_technical_risk,
            business_criticality=round(biz_crit, 2),
            customer_impact=round(cust_imp, 2),
            module_criticality=round(mod_crit, 2),
            composite_business_impact=score.composite_business_impact,
            release_proximity=round(rel_prox, 2),
            sprint_urgency=round(sprint_urg, 2),
            composite_urgency=score.urgency_score,
            maintenance_cost=round(maint_cost, 2),
            debt_age_days=max_age,
            normalized_debt_age=round(norm_age, 2),
            baseline_priority_score=score.baseline_score,
            remediation_effort_factor=round(effort, 2),
            effort_deduction_or_boost=round((100.0 - effort) * settings.WEIGHT_REMEDIATION_EFFORT, 2),
        )

        debt_list = [
            {
                "id": d.id,
                "category": d.debt_category,
                "severity": d.severity,
                "debt_age_days": d.debt_age_days,
                "description": d.description,
                "line_number": d.line_number,
                "remediation_guidance": d.remediation_guidance,
            }
            for d in debt_items
        ]

        rec_name = rec.recommendation_type if rec else ("Refactor immediately" if score.priority_level == "CRITICAL" else "Monitor")
        rec_action = rec.action_summary if rec else ("Allocate senior engineer immediately" if score.priority_level == "CRITICAL" else "Monitor during routine updates")

        return FileDetailResponse(
            file=file_obj.file_name,
            file_id=file_obj.id,
            file_path=file_obj.file_path,
            repository_id=file_obj.repository_id,
            repository_name=file_obj.repository.name if file_obj.repository else "Unknown",
            technical_risk=score.composite_technical_risk,
            predicted_risk=round(ml_risk, 2),
            business_impact=score.composite_business_impact,
            remediation_effort=round(effort, 2),
            release_urgency=score.urgency_score,
            priority_score=score.final_priority_score,
            priority_level=score.priority_level,
            recommendation=rec_name,
            action_summary=rec_action,
            quadrant=score.quadrant,
            roi_score=score.roi_score,
            breakdown=breakdown,
            technical_debt_items=debt_list,
        )
