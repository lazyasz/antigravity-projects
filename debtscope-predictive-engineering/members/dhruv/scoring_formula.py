"""
Member 3: Dhruv (Lead) - 5-Dimensional Mathematical Scoring Formula
Module: scoring_formula.py
Description: Proprietary 5-Dimensional Multi-Criteria Decision Engine combining
             Technical Risk, Business Impact, Release Urgency, Maintenance Cost, and Effort.
"""

from typing import Dict, Any

class ScoringFormulaEngine:
    """
    Implements the 5-Dimensional Technical Debt Prioritization Formula:
    
    TR_comp = 0.50 * TR_static + 0.50 * TR_ml
    BI_comp = 0.50 * BC + 0.35 * CI + 0.15 * MC
    U_comp = 0.60 * ReleaseProximity + 0.40 * SprintUrgency
    PS_base = 0.35*TR_comp + 0.30*BI_comp + 0.15*U_comp + 0.10*MaintenanceCost + 0.10*DebtAge_norm
    PS_final = clamp(0.85 * PS_base + 0.15 * (100 - Effort), 0, 100)
    ROI_Score = (PS_base / max(15, Effort)) * 100
    """

    # Formula Weights (Sum = 1.00)
    W_TR = 0.35
    W_BI = 0.30
    W_U = 0.15
    W_M = 0.10
    W_A = 0.10
    W_EFFORT = 0.15

    @classmethod
    def compute_composite_scores(
        cls,
        tr_static: float,
        tr_ml: float,
        business_criticality: float,
        customer_impact: float,
        module_criticality: float,
        release_proximity: float,
        sprint_urgency: float,
        maintenance_cost: float,
        debt_age_days: int,
        remediation_effort: float
    ) -> Dict[str, float]:
        """Calculates dimensional composites and final effort-adjusted priority score."""
        
        # Step 1: Composite Technical Risk
        tr_comp = (0.50 * tr_static) + (0.50 * tr_ml)

        # Step 2: Composite Business Impact
        bi_comp = (0.50 * business_criticality) + (0.35 * customer_impact) + (0.15 * module_criticality)

        # Step 3: Composite Urgency
        u_comp = (0.60 * release_proximity) + (0.40 * sprint_urgency)

        # Step 4: Normalized Debt Age (Capped at 365 days)
        age_norm = min(100.0, (debt_age_days / 365.0) * 100.0)

        # Step 5: Baseline Priority Score
        ps_base = (
            (cls.W_TR * tr_comp) +
            (cls.W_BI * bi_comp) +
            (cls.W_U * u_comp) +
            (cls.W_M * maintenance_cost) +
            (cls.W_A * age_norm)
        )

        # Step 6: Effort-Adjusted Final Priority & ROI Index
        ps_final = (1.0 - cls.W_EFFORT) * ps_base + cls.W_EFFORT * (100.0 - remediation_effort)
        ps_final = max(0.0, min(100.0, ps_final))

        roi_score = (ps_base / max(15.0, remediation_effort)) * 100.0

        return {
            "tr_comp": round(tr_comp, 2),
            "bi_comp": round(bi_comp, 2),
            "u_comp": round(u_comp, 2),
            "age_norm": round(age_norm, 2),
            "ps_base": round(ps_base, 2),
            "ps_final": round(ps_final, 2),
            "roi_score": round(roi_score, 2),
            "remediation_effort": round(remediation_effort, 2)
        }

if __name__ == "__main__":
    result = ScoringFormulaEngine.compute_composite_scores(
        tr_static=75.0, tr_ml=82.0, business_criticality=90.0, customer_impact=85.0,
        module_criticality=80.0, release_proximity=70.0, sprint_urgency=80.0,
        maintenance_cost=60.0, debt_age_days=180, remediation_effort=25.0
    )
    print("5D Priority Result:", result)
