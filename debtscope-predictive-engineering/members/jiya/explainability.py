"""
Member 2: Jiya - Feature Explainability & Driver Analysis
Module: explainability.py
Description: Computes MDI (Mean Decrease in Impurity / Gini) feature importance rankings
             to explain causal drivers of technical debt risk.
"""

from typing import List, Dict, Any
import numpy as np

class FeatureExplainabilityEngine:
    """
    Ranks causal feature drivers behind high-risk software components.
    """

    FEATURE_NAMES = [
        "loc", "cyclomatic_complexity", "cognitive_complexity", "code_smells",
        "security_hotspots", "dependency_risk", "ownership_entropy",
        "commits_last_90d", "distinct_authors_last_90d", "pr_rework_rate",
        "sprint_velocity_drag_pct", "monthly_maintenance_hours", "unit_test_coverage_pct",
        "archetype_legacy_hotspot", "archetype_core_transactional",
        "archetype_healthy_active", "archetype_dormant_legacy", "archetype_utility_helper"
    ]

    @classmethod
    def get_ranked_feature_importance(cls, model) -> List[Dict[str, Any]]:
        """Extracts and sorts feature importance percentages from trained Random Forest model."""
        importances = model.feature_importances_
        sorted_indices = np.argsort(importances)[::-1]

        ranked = []
        for rank, idx in enumerate(sorted_indices, 1):
            feat_name = cls.FEATURE_NAMES[idx] if idx < len(cls.FEATURE_NAMES) else f"feature_{idx}"
            pct = round(float(importances[idx] * 100.0), 2)
            ranked.append({
                "rank": rank,
                "feature": feat_name,
                "importance_pct": pct
            })
        return ranked

if __name__ == "__main__":
    print("Feature Explainability Engine initialized for MDI Importance ranking.")
