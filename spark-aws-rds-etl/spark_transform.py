"""
PySpark Transformation & Cleansing Module for Cloud ETL Pipeline
Implements robust statistical imputation, deduplication, schema validation, and feature engineering.
"""
import logging
from typing import Tuple, Dict, Any
from pyspark.sql import SparkSession, DataFrame
from pyspark.sql import functions as F
from pyspark.sql.types import (
    StructType, StructField, StringType, IntegerType, DoubleType, DateType
)
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("SparkTransform")


def get_spark_session(app_name: str = config.SPARK_APP_NAME) -> SparkSession:
    """Initializes a local or cluster PySpark session optimized for cloud ETL workloads."""
    builder = (
        SparkSession.builder
        .appName(app_name)
        .master(config.SPARK_MASTER)
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.sql.shuffle.partitions", "4")
        .config("spark.driver.memory", "2g")
        .config("spark.ui.enabled", "false")
    )
    spark = builder.getOrCreate()
    spark.sparkContext.setLogLevel("WARN")
    return spark


def extract_raw_data(spark: SparkSession, source_path: str) -> DataFrame:
    """
    Ingests raw dataset with inferSchema=False to preserve raw formatting
    and enable explicit string-level data cleaning.
    """
    logger.info(f"Extracting raw data from: {source_path}")
    raw_df = spark.read.option("header", "true").option("inferSchema", "false").csv(source_path)
    return raw_df


def audit_data_quality(df: DataFrame, phase: str = "Raw") -> Dict[str, Any]:
    """Computes total rows, column null counts, and duplicates for audit reporting."""
    total_rows = df.count()
    null_counts = {}
    for col_name in df.columns:
        null_count = df.filter(F.col(col_name).isNull() | (F.trim(F.col(col_name)) == "")).count()
        null_counts[col_name] = null_count
    
    unique_rows = df.dropDuplicates().count()
    duplicates_count = total_rows - unique_rows

    logger.info(f"[{phase} Audit] Total Rows: {total_rows}, Duplicates: {duplicates_count}, Total Nulls: {sum(null_counts.values())}")
    return {
        "phase": phase,
        "total_rows": total_rows,
        "duplicates_count": duplicates_count,
        "null_counts": null_counts,
        "total_nulls": sum(null_counts.values())
    }


def clean_and_transform_pipeline(spark: SparkSession, raw_df: DataFrame) -> Tuple[DataFrame, DataFrame, Dict[str, Any]]:
    """
    Executes complete end-to-end PySpark transformation:
    1. Schema & column normalization
    2. Character sanitization (stripping '$', ',', extra spaces)
    3. Missing value statistical imputation (median for age, mean for finances, mode for categorical)
    4. Deduplication
    5. Data type casting & schema enforcement
    6. Feature engineering (customer segments, age groups)
    7. Aggregated analytical KPI calculation (market summary)
    """
    raw_audit = audit_data_quality(raw_df, phase="Raw")
    df = raw_df

    # 1. Normalize Column Names to snake_case
    for col_name in df.columns:
        clean_col = col_name.strip().lower().replace(" ", "_").replace("-", "_")
        df = df.withColumnRenamed(col_name, clean_col)

    # 2. String trimming and currency character stripping
    for col_name in df.columns:
        df = df.withColumn(col_name, F.trim(F.col(col_name)))

    df = df.withColumn(
        "annual_income",
        F.regexp_replace(F.col("annual_income"), r"[\$,]", "")
    ).withColumn(
        "purchase_amount",
        F.regexp_replace(F.col("purchase_amount"), r"[\$,]", "")
    )

    # Standardize Gender casing
    df = df.withColumn(
        "gender",
        F.when(F.lower(F.col("gender")).isin(["m", "male"]), "Male")
        .when(F.lower(F.col("gender")).isin(["f", "female"]), "Female")
        .otherwise(F.col("gender"))
    )

    # Convert numeric candidates for statistical calculations
    df_temp_num = (
        df
        .withColumn("age_num", F.col("age").cast(IntegerType()))
        .withColumn("income_num", F.col("annual_income").cast(DoubleType()))
        .withColumn("purchase_num", F.col("purchase_amount").cast(DoubleType()))
        .withColumn("rating_num", F.col("store_rating").cast(DoubleType()))
    )

    # 3. Compute Statistical Imputation Values
    # A. Median for Age (resilient against outliers)
    median_age = df_temp_num.approxQuantile("age_num", [0.5], 0.01)
    default_age = int(median_age[0]) if median_age else 32

    # B. Mean for financial metrics
    stats = df_temp_num.select(
        F.mean("income_num").alias("avg_income"),
        F.mean("purchase_num").alias("avg_purchase"),
        F.mean("rating_num").alias("avg_rating")
    ).collect()[0]

    avg_income = round(float(stats["avg_income"] or 65000.0), 2)
    avg_purchase = round(float(stats["avg_purchase"] or 200.0), 2)
    avg_rating = round(float(stats["avg_rating"] or 4.2), 1)

    # C. Mode for Gender
    mode_gender_row = df.filter(F.col("gender").isNotNull() & (F.col("gender") != "")).groupBy("gender").count().orderBy(F.desc("count")).first()
    mode_gender = mode_gender_row["gender"] if mode_gender_row else "Male"

    # Apply Imputations
    df_imputed = df.withColumn(
        "age",
        F.when(F.col("age").isNull() | (F.col("age") == ""), F.lit(str(default_age))).otherwise(F.col("age"))
    ).withColumn(
        "annual_income",
        F.when(F.col("annual_income").isNull() | (F.col("annual_income") == ""), F.lit(str(avg_income))).otherwise(F.col("annual_income"))
    ).withColumn(
        "purchase_amount",
        F.when(F.col("purchase_amount").isNull() | (F.col("purchase_amount") == ""), F.lit(str(avg_purchase))).otherwise(F.col("purchase_amount"))
    ).withColumn(
        "store_rating",
        F.when(F.col("store_rating").isNull() | (F.col("store_rating") == ""), F.lit(str(avg_rating))).otherwise(F.col("store_rating"))
    ).withColumn(
        "gender",
        F.when(F.col("gender").isNull() | (F.col("gender") == ""), F.lit(mode_gender)).otherwise(F.col("gender"))
    ).withColumn(
        "city",
        F.when(F.col("city").isNull() | (F.col("city") == ""), F.lit("Unknown")).otherwise(F.col("city"))
    ).withColumn(
        "transaction_date",
        F.when(F.col("transaction_date").isNull() | (F.col("transaction_date") == ""), F.lit("2023-01-01")).otherwise(F.col("transaction_date"))
    )

    # 4. Deduplication
    # Deduplicate on primary business key: transaction_id
    df_dedup = df_imputed.dropDuplicates(["transaction_id"])

    # 5. Type Casting & Schema Enforcement
    df_clean = (
        df_dedup
        .withColumn("age", F.col("age").cast(IntegerType()))
        .withColumn("annual_income", F.round(F.col("annual_income").cast(DoubleType()), 2))
        .withColumn("purchase_amount", F.round(F.col("purchase_amount").cast(DoubleType()), 2))
        .withColumn("store_rating", F.round(F.col("store_rating").cast(DoubleType()), 1))
        .withColumn("transaction_date", F.to_date(F.col("transaction_date"), "yyyy-MM-dd"))
    )

    # 6. Feature Engineering (Analytical Enhancements)
    df_enriched = (
        df_clean
        .withColumn(
            "customer_segment",
            F.when(F.col("annual_income") < 55000, "Budget")
            .when(F.col("annual_income") <= 75000, "Standard")
            .otherwise("Premium")
        )
        .withColumn(
            "age_group",
            F.when(F.col("age") < 30, "Young Adult (<30)")
            .when(F.col("age") <= 45, "Adult (30-45)")
            .otherwise("Senior (>45)")
        )
        .withColumn(
            "spending_tier",
            F.when(F.col("purchase_amount") < 150, "Low (<$150)")
            .when(F.col("purchase_amount") <= 350, "Medium ($150-$350)")
            .otherwise("High (>$350)")
        )
    )

    # 7. Aggregated Analytical Summary (Market KPIs)
    kpi_summary_df = (
        df_enriched
        .groupBy("city")
        .agg(
            F.count("transaction_id").alias("total_transactions"),
            F.countDistinct("customer_id").alias("unique_customers"),
            F.round(F.sum("purchase_amount"), 2).alias("total_revenue"),
            F.round(F.avg("purchase_amount"), 2).alias("avg_order_value"),
            F.round(F.avg("store_rating"), 2).alias("avg_store_rating"),
            F.round(F.avg("annual_income"), 2).alias("avg_customer_income")
        )
        .orderBy(F.desc("total_revenue"))
    )

    # Post-Transformation Quality Audit & Assertions
    clean_audit = audit_data_quality(df_enriched, phase="Cleaned")

    # Calculate Data Quality Improvement Index (DQII)
    cells_raw = raw_audit["total_rows"] * len(raw_df.columns)
    dqii = ((raw_audit["total_nulls"] + (raw_audit["duplicates_count"] * len(raw_df.columns))) / cells_raw) * 100 if cells_raw > 0 else 0.0

    audit_report = {
        "raw": raw_audit,
        "clean": clean_audit,
        "dqii_percent": round(dqii, 2),
        "imputation_rules": {
            "age_median": default_age,
            "annual_income_mean": avg_income,
            "purchase_amount_mean": avg_purchase,
            "store_rating_mean": avg_rating,
            "gender_mode": mode_gender,
            "city_default": "Unknown",
            "date_default": "2023-01-01"
        }
    }

    # Quality Gate Assertion: Assert zero nulls remain in essential fields
    nulls_remaining = clean_audit["total_nulls"]
    assert nulls_remaining == 0, f"Quality gate failed: {nulls_remaining} nulls remain after cleaning!"

    logger.info(f"Transformation successfully completed! DQII Index: {audit_report['dqii_percent']}%")
    return df_enriched, kpi_summary_df, audit_report
