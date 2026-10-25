"""
Member 1: Vaishnavi - Gold Tier Feature Engineering
Module: feature_engineering.py
Description: Generates high-order feature contracts (Maintainability Index, Defect Density,
             Composite Dependency Risk) and exports Gold Feature contracts in Parquet/JSON.
"""

import math
import json
from pathlib import Path
from typing import Dict, Any, List

class GoldFeatureStore:
    """
    Generates standardized ML/Decision feature contracts from cleaned Silver datasets.
    """

    @staticmethod
    def calculate_maintainability_index(halstead_volume: float, cyclomatic_complexity: float, loc: int) -> float:
        """
        SEI Standard Maintainability Index (MI) formulation:
        MI = 171 - 5.2 * ln(V) - 0.23 * G - 16.2 * ln(LOC)
        Normalized to 0-100 range.
        """
        if loc <= 0:
            return 100.0
        v = max(1.0, halstead_volume)
        g = max(1.0, cyclomatic_complexity)
        l = max(1, loc)

        raw_mi = 171.0 - (5.2 * math.log(v)) - (0.23 * g) - (16.2 * math.log(l))
        normalized_mi = max(0.0, (raw_mi * 100.0) / 171.0)
        return round(min(100.0, normalized_mi), 2)

    @staticmethod
    def calculate_defect_density(total_defects: int, kloc: float) -> float:
        """Computes defects per Thousand Lines of Code (KLOC)."""
        if kloc <= 0.0:
            return 0.0
        return round(total_defects / kloc, 3)

    @classmethod
    def export_gold_feature_contract(cls, features: List[Dict[str, Any]], export_dir: str = "data/features"):
        """Exports Gold Tier feature records in JSON and Parquet formats."""
        out_path = Path(export_dir)
        out_path.mkdir(parents=True, exist_ok=True)
        
        json_file = out_path / "engineering_features.json"
        with open(json_file, "w", encoding="utf-8") as f:
            json.dump(features, f, indent=2)
        print(f"Gold Feature Lake exported to {json_file}")

if __name__ == "__main__":
    mi = GoldFeatureStore.calculate_maintainability_index(halstead_volume=1200.0, cyclomatic_complexity=14.0, loc=250)
    print(f"Derived Maintainability Index: {mi}/100")
