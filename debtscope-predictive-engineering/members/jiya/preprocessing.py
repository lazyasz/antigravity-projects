"""
Member 2: Jiya - Machine Learning Preprocessing Pipeline
Module: preprocessing.py
Description: Feature scaling, categorical encoding, and training/testing split pipeline
             for engineering defect prediction models.
"""

from typing import Tuple, List, Dict, Any
import numpy as np

class MLDataPreprocessor:
    """
    Standardizes numeric code metrics and encodes categorical module archetypes.
    """

    NUMERIC_FEATURES = [
        "loc", "cyclomatic_complexity", "cognitive_complexity", "code_smells",
        "security_hotspots", "dependency_risk", "ownership_entropy",
        "commits_last_90d", "distinct_authors_last_90d", "pr_rework_rate",
        "sprint_velocity_drag_pct", "monthly_maintenance_hours", "unit_test_coverage_pct"
    ]

    CATEGORICAL_FEATURES = ["archetype"]

    def __init__(self):
        self.means: Dict[str, float] = {}
        self.stds: Dict[str, float] = {}
        self.archetype_mapping = {
            "legacy_hotspot": 0,
            "core_transactional": 1,
            "healthy_active": 2,
            "dormant_legacy": 3,
            "utility_helper": 4
        }

    def fit_transform(self, dataset: List[Dict[str, Any]]) -> Tuple[np.ndarray, np.ndarray]:
        """Fits StandardScaler on training records and transforms numeric & categorical arrays."""
        X_raw = []
        y_raw = []

        for record in dataset:
            row = []
            for feat in self.NUMERIC_FEATURES:
                val = float(record.get(feat, 0.0))
                row.append(val)
            
            # One-hot / label encoding archetype
            arch = record.get("archetype", "utility_helper")
            arch_idx = self.archetype_mapping.get(arch, 4)
            arch_one_hot = [1.0 if i == arch_idx else 0.0 for i in range(5)]
            row.extend(arch_one_hot)

            X_raw.append(row)
            y_raw.append(float(record.get("technical_risk_score", 50.0)))

        X = np.array(X_raw)
        y = np.array(y_raw)

        # Apply standard scaling on numeric features
        self.means = {self.NUMERIC_FEATURES[i]: float(np.mean(X[:, i])) for i in range(len(self.NUMERIC_FEATURES))}
        self.stds = {self.NUMERIC_FEATURES[i]: float(np.std(X[:, i]) + 1e-6) for i in range(len(self.NUMERIC_FEATURES))}

        for i in range(len(self.NUMERIC_FEATURES)):
            X[:, i] = (X[:, i] - self.means[self.NUMERIC_FEATURES[i]]) / self.stds[self.NUMERIC_FEATURES[i]]

        return X, y

if __name__ == "__main__":
    preprocessor = MLDataPreprocessor()
    print("ML Data Preprocessor initialized with features:", preprocessor.NUMERIC_FEATURES)
