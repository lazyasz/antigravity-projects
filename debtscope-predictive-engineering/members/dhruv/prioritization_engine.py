"""
Member 3: Dhruv (Lead) - Full Prioritization Engine Service
Module: prioritization_engine.py
Description: Full-stack bridge uniting Member 1 features, Member 2 ML predictions,
             and Member 3 business context into prioritized debt records.
"""

from typing import List, Dict, Any
from members.dhruv.scoring_formula import ScoringFormulaEngine
from members.dhruv.quadrant_engine import QuadrantEngine

class PrioritizationEngineService:
    """
    Executes end-to-end prioritization across codebase debt records.
    """

    @classmethod
    def prioritize_file_records(cls, raw_features: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Takes aggregated feature inputs and produces sorted, classified debt priorities."""
        ranked_results = []

        for record in raw_features:
            tr_static = float(record.get("static_risk_score", 50.0))
            tr_ml = float(record.get("predicted_ml_risk", tr_static))
            bc = float(record.get("business_criticality", 60.0))
            ci = float(record.get("customer_impact", 50.0))
            mc = float(record.get("module_criticality", 50.0))
            rp = float(record.get("release_proximity", 50.0))
            su = float(record.get("sprint_urgency", 50.0))
            mcost = float(record.get("maintenance_cost", 40.0))
            age = int(record.get("debt_age_days", 90))
            effort = float(record.get("remediation_effort", 35.0))

            scores = ScoringFormulaEngine.compute_composite_scores(
                tr_static=tr_static, tr_ml=tr_ml, business_criticality=bc,
                customer_impact=ci, module_criticality=mc, release_proximity=rp,
                sprint_urgency=su, maintenance_cost=mcost, debt_age_days=age,
                remediation_effort=effort
            )

            quadrant_info = QuadrantEngine.classify_quadrant(
                ps_base=scores["ps_base"],
                remediation_effort=effort
            )

            ranked_results.append({
                "file_id": record.get("file_id", "f-unknown"),
                "file_path": record.get("file_path", "unknown.py"),
                "module_name": record.get("module_name", "Core"),
                **scores,
                **quadrant_info
            })

        # Sort descending by effort-adjusted final priority score
        ranked_results.sort(key=lambda x: x["ps_final"], reverse=True)
        return ranked_results

if __name__ == "__main__":
    test_data = [
        {"file_id": "f-1", "file_path": "services/payments.py", "static_risk_score": 85.0, "predicted_ml_risk": 90.0, "business_criticality": 95.0, "remediation_effort": 20.0},
        {"file_id": "f-2", "file_path": "utils/logger.py", "static_risk_score": 60.0, "predicted_ml_risk": 40.0, "business_criticality": 20.0, "remediation_effort": 70.0}
    ]
    results = PrioritizationEngineService.prioritize_file_records(test_data)
    print(f"Prioritized {len(results)} records. Top item: {results[0]['file_path']} (Score: {results[0]['ps_final']}, Quadrant: {results[0]['quadrant']})")
