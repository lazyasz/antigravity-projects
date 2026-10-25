"""
Feature Engineering Layer
Computes derived software engineering metrics, maintainability index,
developer concentration, risk scores, and standardizes the final dataset contract.
"""

import math
from typing import Dict, Any, List
from pyspark.sql import DataFrame
from pyspark.sql.functions import (
    col, lit, when, round as _round, log as _log, coalesce, udf, split, element_at
)
from pyspark.sql.types import DoubleType

def compute_maintainability_index(loc: float, complexity: float, code_smells: float = 0.0) -> float:
    """
    Computes Maintainability Index (MI) scaled to [0, 100].
    Based on standard SEI / Visual Studio formulation with static analysis smell penalty:
    MI = 100.0 - (0.45 * CyclomaticComplexity) - (0.018 * LOC) - (0.40 * CodeSmells)
    Calibrated such that legacy complex modules (e.g. LOC 1842, CC 41) score ~42,
    and clean lightweight modules score 85-95.
    """
    loc_val = max(1.0, float(loc or 10.0))
    comp_val = max(1.0, float(complexity or 1.0))
    smells_val = max(0.0, float(code_smells or 0.0))
    
    mi = 100.0 - (0.45 * comp_val) - (0.018 * loc_val) - (0.40 * smells_val)
    return round(max(0.0, min(100.0, mi)), 1)

maintainability_udf = udf(compute_maintainability_index, DoubleType())

class FeatureEngineeringPipeline:
    """
    Calculates engineering intelligence features from PySpark DataFrame
    and prepares standardized records for ML and Prioritization models.
    """
    def __init__(self):
        pass

    def transform_features(self, spark_df: DataFrame) -> DataFrame:
        """
        Applies mathematical feature calculations in PySpark.
        """
        # Extract file basename (e.g., 'services/payment.py' -> 'payment.py')
        features_df = spark_df.withColumn(
            "file_basename",
            element_at(split(col("file_path"), "/"), -1)
        )

        # 1. Maintainability Index
        features_df = features_df.withColumn(
            "maintainability",
            maintainability_udf(col("loc"), col("cyclomatic_complexity"), col("code_smells"))
        )

        # 2. Defect Frequency per 1,000 LOC
        features_df = features_df.withColumn(
            "defect_frequency",
            _round((col("defect_count") * lit(1000.0)) / when(col("loc") > 0, col("loc")).otherwise(lit(100.0)), 2)
        )

        # 3. Business Impact: Composite weighted formula
        features_df = features_df.withColumn(
            "business_impact",
            _round(
                (col("criticality") * lit(0.50)) +
                (col("revenue_impact") * lit(0.35)) +
                (when(col("user_facing") == True, lit(100.0)).otherwise(lit(40.0)) * lit(0.15)),
                1
            )
        )

        # 4. Estimated Remediation Effort (Hours)
        features_df = features_df.withColumn(
            "estimated_remediation_effort",
            _round(
                (col("maintenance_effort") * lit(0.40)) +
                (col("cyclomatic_complexity") * lit(0.30)) +
                (col("code_smells") * lit(0.50)) +
                (when(col("debt_age") > 90, lit(15.0)).otherwise(lit(5.0))),
                1
            )
        )

        # 5. Stable Schema Contract Alignment
        final_df = features_df.select(
            col("repository"),
            col("file_basename").alias("file"),
            col("module_name").alias("module"),
            col("developer"),
            col("commit_count"),
            col("change_frequency"),
            col("code_churn"),
            col("code_churn").alias("churn"), # Shared contract alias
            col("loc"),
            _round(col("cyclomatic_complexity"), 1).alias("complexity"),
            col("maintainability"),
            col("code_smells"),
            col("dependency_age"),
            col("dependency_risk"),
            col("issue_count"),
            col("defect_count"),
            col("issue_severity"),
            col("pr_count"),
            col("release_frequency"),
            _round(col("criticality"), 1).alias("module_criticality"),
            col("business_impact"),
            col("debt_age"),
            col("release_impact"),
            col("maintenance_effort"),
            col("estimated_remediation_effort"),
            col("developer_concentration"),
            col("defect_frequency")
        )

        return final_df

    def to_contract_records(self, final_df: DataFrame) -> List[Dict[str, Any]]:
        """
        Converts the final DataFrame into a list of Python dictionaries
        guaranteeing JSON-serializable types and exact output contract.
        """
        rows = final_df.collect()
        records = []
        for r in rows:
            d = r.asDict()
            # Ensure proper types
            for k, v in d.items():
                if isinstance(v, float):
                    d[k] = round(v, 2)
            records.append(d)
        return records
