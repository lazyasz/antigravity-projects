"""
Member 3: Dhruv (Lead) - ROI Quadrant Classification Engine
Module: quadrant_engine.py
Description: Classifies technical debt items into 4 actionable decision quadrants:
             Quick Wins, Strategic Refactoring, Opportunistic Fixes, and Deprioritized Debt.
"""

from typing import Dict, Any

class QuadrantEngine:
    """
    Classifies debt issues by Business Value (PS_base >= 60) and Remediation Effort (Effort <= 40).
    """

    QUADRANT_QUICK_WIN = "QUICK_WIN"                     # High Value, Low Effort (Sprint Top Priority)
    QUADRANT_STRATEGIC_REFACTOR = "STRATEGIC_REFACTOR"   # High Value, High Effort (Multi-sprint Epic)
    QUADRANT_OPPORTUNISTIC = "OPPORTUNISTIC"             # Low Value, Low Effort (Fill-in)
    QUADRANT_DEPRIORITIZED = "DEPRIORITIZED"             # Low Value, High Effort (Backlog)

    @classmethod
    def classify_quadrant(cls, ps_base: float, remediation_effort: float) -> Dict[str, str]:
        """Maps base priority score and effort into an actionable quadrant."""
        is_high_value = ps_base >= 60.0
        is_low_effort = remediation_effort <= 40.0

        if is_high_value and is_low_effort:
            quadrant = cls.QUADRANT_QUICK_WIN
            action = "Immediate Sprint Allocation (Top Priority ROI)"
        elif is_high_value and not is_low_effort:
            quadrant = cls.QUADRANT_STRATEGIC_REFACTOR
            action = "Schedule as Architectural Epic across Sprints"
        elif not is_high_value and is_low_effort:
            quadrant = cls.QUADRANT_OPPORTUNISTIC
            action = "Address Opportunistically during Routine Maintenance"
        else:
            quadrant = cls.QUADRANT_DEPRIORITIZED
            action = "Park in Backlog (Low ROI)"

        # Priority category tier
        if ps_base >= 80.0:
            tier = "CRITICAL"
        elif ps_base >= 60.0:
            tier = "HIGH"
        elif ps_base >= 40.0:
            tier = "MEDIUM"
        else:
            tier = "LOW"

        return {
            "quadrant": quadrant,
            "action_recommendation": action,
            "priority_tier": tier
        }

if __name__ == "__main__":
    classification = QuadrantEngine.classify_quadrant(ps_base=78.5, remediation_effort=25.0)
    print("Quadrant Classification:", classification)
