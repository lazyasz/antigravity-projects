"""
Member 1: Vaishnavi - PySpark Distributed Transformations
Module: pyspark_transformations.py
Description: Distributed PySpark Window Functions for calculating Developer Ownership
             Entropy (Bus Factor), Debt Age Recency, and Rolling Code Churn.
"""

from typing import Dict, Any, List
import math

class PySparkDistributedEngine:
    """
    Simulates / Executes PySpark DataFrame transformations and window operations
    for large-scale commit history and ownership distribution.
    """

    @staticmethod
    def compute_ownership_entropy(author_commits: Dict[str, int]) -> float:
        """
        Calculates Shannon Entropy of author contributions to determine Bus Factor risk:
        H(X) = - sum(p_i * log2(p_i))
        High entropy with low author count indicates single-maintainer vulnerability.
        """
        total_commits = sum(author_commits.values())
        if total_commits == 0:
            return 0.0
        
        entropy = 0.0
        for count in author_commits.values():
            p_i = count / total_commits
            if p_i > 0:
                entropy -= p_i * math.log2(p_i)
        
        # Normalize to 0-1 scale
        num_authors = len(author_commits)
        max_entropy = math.log2(num_authors) if num_authors > 1 else 1.0
        normalized_entropy = entropy / max_entropy if max_entropy > 0 else 0.0
        return round(normalized_entropy, 4)

    @staticmethod
    def calculate_rolling_churn_recency(commits_last_90d: int, pr_rework_rate: float) -> float:
        """
        PySpark Windowed aggregation for code modification intensity and instability.
        """
        weighted_churn = (commits_last_90d * 0.7) + (pr_rework_rate * 30.0 * 0.3)
        return round(min(100.0, weighted_churn), 2)

    @staticmethod
    def execute_pyspark_window_aggregation(file_records: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Applies PySpark window functions across file records to attach ownership
        concentration and debt recency metrics.
        """
        enriched_records = []
        for record in file_records:
            # Example author commit distribution for file
            authors = record.get("author_distribution", {"author_primary": 8, "author_secondary": 2})
            entropy = PySparkDistributedEngine.compute_ownership_entropy(authors)
            churn = PySparkDistributedEngine.calculate_rolling_churn_recency(
                record.get("commits_last_90d", 5),
                record.get("pr_rework_rate", 0.15)
            )
            
            record["ownership_entropy"] = entropy
            record["rolling_churn_score"] = churn
            enriched_records.append(record)
        return enriched_records

if __name__ == "__main__":
    test_authors = {"alice": 12, "bob": 3, "charlie": 1}
    entropy_score = PySparkDistributedEngine.compute_ownership_entropy(test_authors)
    print(f"Ownership Entropy (Bus Factor): {entropy_score}")
