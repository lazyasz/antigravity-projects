"""
Distributed PySpark Processing Layer
Performs scalable data transformations, schema definitions, relational joins,
window functions (developer concentration, debt recency), and aggregations.
"""

import os
import sys
from typing import Dict, Any, List, Tuple
from datetime import datetime

# Guarantee Java and Python paths are set before PySpark import
if "JAVA_HOME" not in os.environ:
    if os.path.exists("/opt/homebrew/opt/openjdk@17"):
        os.environ["JAVA_HOME"] = "/opt/homebrew/opt/openjdk@17"

if "PYSPARK_PYTHON" not in os.environ:
    os.environ["PYSPARK_PYTHON"] = sys.executable

if "PYSPARK_DRIVER_PYTHON" not in os.environ:
    os.environ["PYSPARK_DRIVER_PYTHON"] = sys.executable

from pyspark.sql import SparkSession, Window
from pyspark.sql.types import (
    StructType, StructField, StringType, LongType, DoubleType, BooleanType
)
from pyspark.sql.functions import (
    col, sum as _sum, count, countDistinct, avg, max as _max, min as _min,
    when, coalesce, lit, round as _round, row_number, datediff, to_date, current_date
)

class SparkDataProcessor:
    """
    Executes distributed transformations on cleaned engineering data
    using PySpark DataFrames and Spark SQL Catalyst optimizer.
    """
    def __init__(self, app_name: str = "TechnicalDebtEngineeringPipeline"):
        self.spark = (
            SparkSession.builder
            .appName(app_name)
            .master("local[*]")
            .config("spark.sql.shuffle.partitions", "4")
            .config("spark.ui.enabled", "false")
            .config("spark.driver.bindAddress", "127.0.0.1")
            .getOrCreate()
        )
        self.spark.sparkContext.setLogLevel("ERROR")

    def stop(self):
        """Stops the active SparkSession."""
        if self.spark:
            self.spark.stop()

    def get_schemas(self) -> Dict[str, StructType]:
        """Defines strict Spark schemas for all engineering entities."""
        return {
            "files": StructType([
                StructField("id", StringType(), False),
                StructField("repo_id", StringType(), False),
                StructField("file_path", StringType(), False),
                StructField("module_name", StringType(), True),
                StructField("language", StringType(), True),
                StructField("loc", LongType(), True),
                StructField("cyclomatic_complexity", DoubleType(), True),
                StructField("cognitive_complexity", DoubleType(), True),
                StructField("code_smells", LongType(), True),
            ]),
            "commits": StructType([
                StructField("id", StringType(), False),
                StructField("repo_id", StringType(), False),
                StructField("commit_hash", StringType(), False),
                StructField("author_id", StringType(), True),
                StructField("commit_timestamp", StringType(), True),
                StructField("message", StringType(), True),
            ]),
            "commit_file_changes": StructType([
                StructField("id", StringType(), False),
                StructField("commit_id", StringType(), False),
                StructField("file_id", StringType(), False),
                StructField("additions", LongType(), True),
                StructField("deletions", LongType(), True),
                StructField("churn", LongType(), True),
                StructField("change_type", StringType(), True),
            ]),
            "issues": StructType([
                StructField("id", StringType(), False),
                StructField("repo_id", StringType(), False),
                StructField("file_id", StringType(), False),
                StructField("module_name", StringType(), True),
                StructField("issue_type", StringType(), True),
                StructField("severity", StringType(), True),
                StructField("remediation_effort_hours", DoubleType(), True),
                StructField("status", StringType(), True),
                StructField("created_at", StringType(), True),
                StructField("resolved_at", StringType(), True),
            ]),
            "defects": StructType([
                StructField("id", StringType(), False),
                StructField("repo_id", StringType(), False),
                StructField("file_id", StringType(), False),
                StructField("module_name", StringType(), True),
                StructField("bug_severity", StringType(), True),
                StructField("root_cause", StringType(), True),
                StructField("reported_at", StringType(), True),
                StructField("fixed_at", StringType(), True),
            ]),
            "pull_requests": StructType([
                StructField("id", StringType(), False),
                StructField("repo_id", StringType(), False),
                StructField("pr_number", LongType(), True),
                StructField("author_id", StringType(), True),
                StructField("title", StringType(), True),
                StructField("status", StringType(), True),
                StructField("created_at", StringType(), True),
                StructField("merged_at", StringType(), True),
                StructField("review_comments_count", LongType(), True),
            ]),
            "dependencies": StructType([
                StructField("id", StringType(), False),
                StructField("repo_id", StringType(), False),
                StructField("package_name", StringType(), True),
                StructField("current_version", StringType(), True),
                StructField("latest_version", StringType(), True),
                StructField("age_days", LongType(), True),
                StructField("vulnerabilities_count", LongType(), True),
                StructField("license_risk", DoubleType(), True),
            ]),
            "business_context": StructType([
                StructField("module_name", StringType(), False),
                StructField("criticality", DoubleType(), True),
                StructField("user_facing", BooleanType(), True),
                StructField("revenue_impact", DoubleType(), True),
                StructField("sla_tier", StringType(), True),
            ]),
            "repositories": StructType([
                StructField("id", StringType(), False),
                StructField("name", StringType(), False),
                StructField("tech_stack", StringType(), True),
                StructField("business_domain", StringType(), True),
                StructField("created_at", StringType(), True),
                StructField("business_impact_score", DoubleType(), True),
            ]),
            "releases": StructType([
                StructField("id", StringType(), False),
                StructField("repo_id", StringType(), False),
                StructField("version", StringType(), True),
                StructField("release_date", StringType(), True),
                StructField("stability_score", DoubleType(), True),
            ])
        }

    def load_dataframes(self, cleaned_data: Dict[str, List[Dict[str, Any]]]):
        """Converts cleaned Python dictionaries into strongly-typed PySpark DataFrames."""
        schemas = self.get_schemas()
        dfs = {}
        for entity_name, records in cleaned_data.items():
            if entity_name in schemas:
                schema = schemas[entity_name]
                # Filter records to only fields declared in schema
                field_names = [f.name for f in schema.fields]
                filtered_records = [{k: r.get(k) for k in field_names} for r in records]
                dfs[entity_name] = self.spark.createDataFrame(filtered_records, schema=schema)
            else:
                dfs[entity_name] = self.spark.createDataFrame(records)
        return dfs

    def process_pipeline(self, cleaned_data: Dict[str, List[Dict[str, Any]]]):
        """
        Executes distributed transformations, window functions, and joins across all entities.
        Returns transformed PySpark DataFrame.
        """
        dfs = self.load_dataframes(cleaned_data)
        
        files_df = dfs["files"].withColumnRenamed("id", "file_id")
        commits_df = dfs["commits"]
        cfc_df = dfs["commit_file_changes"]
        issues_df = dfs["issues"]
        defects_df = dfs["defects"]
        prs_df = dfs["pull_requests"]
        deps_df = dfs["dependencies"]
        biz_df = dfs["business_context"]
        repos_df = dfs["repositories"]
        releases_df = dfs["releases"]

        # -------------------------------------------------------------
        # 1. Join Commit File Changes with Commits to track Authors
        # -------------------------------------------------------------
        cfc_with_commits = (
            cfc_df.join(commits_df, cfc_df.commit_id == commits_df.id, "inner")
            .select(
                cfc_df.file_id,
                cfc_df.commit_id,
                commits_df.author_id,
                cfc_df.additions,
                cfc_df.deletions,
                cfc_df.churn,
                commits_df.commit_timestamp
            )
        )

        # -------------------------------------------------------------
        # 2. File Churn & Commit Aggregations
        # -------------------------------------------------------------
        file_metrics_agg = (
            cfc_with_commits.groupBy("file_id")
            .agg(
                _sum("churn").alias("code_churn"),
                countDistinct("commit_id").alias("commit_count"),
                count("commit_id").alias("change_frequency"),
                _sum("additions").alias("total_additions"),
                _sum("deletions").alias("total_deletions")
            )
        )

        # -------------------------------------------------------------
        # 3. Window Function: Dominant Contributor & Developer Concentration
        # -------------------------------------------------------------
        # Calculate commit counts per author per file
        author_file_counts = (
            cfc_with_commits.groupBy("file_id", "author_id")
            .agg(count("commit_id").alias("author_commit_count"))
        )
        
        window_file = Window.partitionBy("file_id").orderBy(col("author_commit_count").desc())
        
        author_ranked = (
            author_file_counts
            .withColumn("rank", row_number().over(window_file))
            .filter(col("rank") == 1)
            .select(
                col("file_id"),
                col("author_id").alias("developer"),
                col("author_commit_count")
            )
        )
        
        # Join with total commits to compute concentration ratio
        dev_concentration_df = (
            author_ranked.join(file_metrics_agg.select("file_id", "commit_count"), on="file_id", how="left")
            .withColumn(
                "developer_concentration",
                when(col("commit_count") > 0, _round(col("author_commit_count") / col("commit_count"), 3))
                .otherwise(lit(1.0))
            )
            .select("file_id", "developer", "developer_concentration")
        )

        # -------------------------------------------------------------
        # 4. Issues Aggregation & Debt Age Window Calculation
        # -------------------------------------------------------------
        # Map severity weights: CRITICAL=4, HIGH=3, MEDIUM=2, LOW=1
        issues_weighted = issues_df.withColumn(
            "severity_weight",
            when(col("severity") == "CRITICAL", lit(4.0))
            .when(col("severity") == "HIGH", lit(3.0))
            .when(col("severity") == "MEDIUM", lit(2.0))
            .otherwise(lit(1.0))
        ).withColumn(
            "issue_date",
            to_date(col("created_at"))
        )

        # Reference date for debt age calculation (using fixed 2024-03-01 to ensure reproducible metrics)
        ref_date = lit("2024-03-01")

        issues_agg = (
            issues_weighted.groupBy("file_id")
            .agg(
                count("id").alias("issue_count"),
                _round(avg("severity_weight"), 2).alias("issue_severity"),
                _round(_sum("remediation_effort_hours"), 1).alias("maintenance_effort"),
                # Debt Age: Days since earliest unresolved debt issue
                _min(
                    when(col("status") == "OPEN", datediff(to_date(ref_date), col("issue_date")))
                ).alias("debt_age")
            )
        )

        # -------------------------------------------------------------
        # 5. Defects Aggregation
        # -------------------------------------------------------------
        defects_agg = (
            defects_df.groupBy("file_id")
            .agg(count("id").alias("defect_count"))
        )

        # -------------------------------------------------------------
        # 6. Repository-Level Metrics: PRs, Releases, Dependencies
        # -------------------------------------------------------------
        prs_agg = (
            prs_df.groupBy("repo_id")
            .agg(count("id").alias("pr_count"))
        )

        releases_agg = (
            releases_df.groupBy("repo_id")
            .agg(
                count("id").alias("release_count"),
                _round(avg("stability_score"), 1).alias("avg_stability")
            )
            .withColumn("release_frequency", _round(col("release_count") / lit(6.0), 2)) # per month over 6 months
            .withColumn("release_impact", _round(lit(100.0) - col("avg_stability"), 1))
        )

        deps_agg = (
            deps_df.groupBy("repo_id")
            .agg(
                _round(avg("age_days"), 0).cast(LongType()).alias("dependency_age"),
                _sum("vulnerabilities_count").alias("total_vulns"),
                _round(avg("license_risk"), 1).alias("avg_license_risk")
            )
            .withColumn(
                "dependency_risk",
                _round(
                    (lit(0.40) * when(col("total_vulns") * 25.0 > 100.0, 100.0).otherwise(col("total_vulns") * 25.0)) +
                    (lit(0.35) * when(col("dependency_age") / 365.0 * 30.0 > 100.0, 100.0).otherwise(col("dependency_age") / 365.0 * 30.0)) +
                    (lit(0.25) * col("avg_license_risk")),
                    1
                )
            )
        )

        # -------------------------------------------------------------
        # 7. Relational Joins & Catalyst Execution Tree
        # -------------------------------------------------------------
        # Base table: files
        joined_df = (
            files_df
            # Join Repositories
            .join(repos_df.select(col("id").alias("r_id"), col("name").alias("repository")), files_df.repo_id == col("r_id"), "left")
            # Join File Metrics
            .join(file_metrics_agg, on="file_id", how="left")
            # Join Developer Concentration
            .join(dev_concentration_df, on="file_id", how="left")
            # Join Issues
            .join(issues_agg, on="file_id", how="left")
            # Join Defects
            .join(defects_agg, on="file_id", how="left")
            # Join Repository PRs
            .join(prs_agg, on="repo_id", how="left")
            # Join Repository Releases
            .join(releases_agg, on="repo_id", how="left")
            # Join Repository Dependencies
            .join(deps_agg, on="repo_id", how="left")
            # Join Business Context
            .join(biz_df, on="module_name", how="left")
        )

        # Fill nulls with deterministic safe defaults
        filled_df = (
            joined_df
            .withColumn("developer", coalesce(col("developer"), lit("unknown_dev")))
            .withColumn("commit_count", coalesce(col("commit_count"), lit(0)))
            .withColumn("change_frequency", coalesce(col("change_frequency"), lit(0)))
            .withColumn("code_churn", coalesce(col("code_churn"), lit(0)))
            .withColumn("developer_concentration", coalesce(col("developer_concentration"), lit(0.0)))
            .withColumn("issue_count", coalesce(col("issue_count"), lit(0)))
            .withColumn("defect_count", coalesce(col("defect_count"), lit(0)))
            .withColumn("issue_severity", coalesce(col("issue_severity"), lit(1.0)))
            .withColumn("maintenance_effort", coalesce(col("maintenance_effort"), lit(0.0)))
            .withColumn("debt_age", coalesce(col("debt_age"), lit(30)))
            .withColumn("pr_count", coalesce(col("pr_count"), lit(0)))
            .withColumn("release_frequency", coalesce(col("release_frequency"), lit(1.0)))
            .withColumn("release_impact", coalesce(col("release_impact"), lit(15.0)))
            .withColumn("dependency_age", coalesce(col("dependency_age"), lit(30)))
            .withColumn("dependency_risk", coalesce(col("dependency_risk"), lit(10.0)))
            .withColumn("criticality", coalesce(col("criticality"), lit(50.0)))
            .withColumn("revenue_impact", coalesce(col("revenue_impact"), lit(50.0)))
            .withColumn("user_facing", coalesce(col("user_facing"), lit(False)))
        )

        return filled_df
