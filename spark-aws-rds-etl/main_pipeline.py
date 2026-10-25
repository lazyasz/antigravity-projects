"""
End-to-End Orchestrator for Assignment 02: Spark Cloud ETL Pipeline
Extracts from Amazon S3 -> Transforms with Apache Spark -> Loads to Amazon RDS / Cloud DB.
"""
import sys
import os
import logging
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from tabulate import tabulate

import config
from s3_manager import S3Manager
from spark_transform import get_spark_session, extract_raw_data, clean_and_transform_pipeline
from db_loader import CloudDBLoader

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("MainPipeline")


def generate_visual_dashboards(raw_audit: dict, clean_audit: dict, kpi_df: pd.DataFrame, output_path: Path):
    """Generates visual audit and analytics dashboard."""
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    plt.subplots_adjust(hspace=0.35, wspace=0.25)
    sns.set_theme(style="whitegrid")

    # 1. Missing Values Pre vs Post Cleansing
    raw_nulls = raw_audit["null_counts"]
    cols = list(raw_nulls.keys())
    null_vals = list(raw_nulls.values())
    
    sns.barplot(x=null_vals, y=cols, ax=axes[0, 0], palette="Reds_r")
    axes[0, 0].set_title("Pre-Cleansing Missing Value Distribution per Column", fontsize=13, fontweight="bold")
    axes[0, 0].set_xlabel("Missing Count")
    for i, v in enumerate(null_vals):
        axes[0, 0].text(v + 0.05, i, str(v), va="center", fontweight="bold")

    # 2. Pipeline Record Retention & Deduplication
    categories = ["Raw Ingested", "Duplicates Purged", "Cleaned Fact Table"]
    counts = [raw_audit["total_rows"], raw_audit["duplicates_count"], clean_audit["total_rows"]]
    colors = ["#3b82f6", "#ef4444", "#10b981"]
    sns.barplot(x=categories, y=counts, ax=axes[0, 1], palette=colors)
    axes[0, 1].set_title(f"Record Pipeline Throughput (DQII: {raw_audit.get('dqii_percent', 0)}%)", fontsize=13, fontweight="bold")
    axes[0, 1].set_ylabel("Records")
    for i, v in enumerate(counts):
        axes[0, 1].text(i, v + 0.3, str(v), ha="center", fontweight="bold")

    # 3. Revenue Contribution by Market (City)
    if not kpi_df.empty and "city" in kpi_df.columns and "total_revenue" in kpi_df.columns:
        kpi_sorted = kpi_df.sort_values(by="total_revenue", ascending=False).head(8)
        sns.barplot(data=kpi_sorted, x="total_revenue", y="city", ax=axes[1, 0], palette="Blues_r")
        axes[1, 0].set_title("Total Revenue by Market / City ($)", fontsize=13, fontweight="bold")
        axes[1, 0].set_xlabel("Net Revenue ($)")

    # 4. Average Order Value by City
    if not kpi_df.empty and "city" in kpi_df.columns and "avg_order_value" in kpi_df.columns:
        kpi_sorted = kpi_df.sort_values(by="avg_order_value", ascending=False).head(8)
        sns.barplot(data=kpi_sorted, x="avg_order_value", y="city", ax=axes[1, 1], palette="Purples_r")
        axes[1, 1].set_title("Average Order Value (AOV) by City ($)", fontsize=13, fontweight="bold")
        axes[1, 1].set_xlabel("AOV ($)")

    dashboard_file = output_path / "pipeline_dashboard.png"
    plt.savefig(dashboard_file, dpi=300, bbox_inches="tight")
    plt.close()
    logger.info(f"Visual dashboard saved to: {dashboard_file}")
    return dashboard_file


def run_etl_pipeline():
    print("=" * 80)
    print("🚀 STARTING ASSIGNMENT 02: SPARK AWS CLOUD ETL PIPELINE")
    print("=" * 80)

    # -------------------------------------------------------------------------
    # STEP 1: EXTRACT FROM AMAZON S3 CLOUD STORAGE
    # -------------------------------------------------------------------------
    print("\n[STEP 1/5] Initializing Amazon S3 Cloud Storage...")
    s3 = S3Manager()
    s3.ensure_bucket_exists()
    
    # Upload raw transactional data to S3
    s3.upload_raw_dataset(config.SAMPLE_DATA_FILE, config.AWS_S3_RAW_KEY)
    
    # Download cloud object to local staging for Spark processing
    staging_raw_path = config.OUTPUT_DIR / "staged_from_s3_raw.csv"
    s3.download_to_local(config.AWS_S3_RAW_KEY, staging_raw_path)
    
    # -------------------------------------------------------------------------
    # STEP 2: DISTRIBUTED TRANSFORMATION WITH APACHE SPARK
    # -------------------------------------------------------------------------
    print("\n[STEP 2/5] Initializing Apache Spark Session & Distributed Processing...")
    spark = get_spark_session()
    
    # Ingest from staged cloud extraction
    raw_spark_df = extract_raw_data(spark, str(staging_raw_path))
    print(f"Raw DataFrame Ingested: {raw_spark_df.count()} rows, {len(raw_spark_df.columns)} columns")

    # Clean, Impute, Deduplicate, Validate & Aggregate
    clean_df, kpi_df, audit_report = clean_and_transform_pipeline(spark, raw_spark_df)
    audit_report["raw"]["dqii_percent"] = audit_report["dqii_percent"]

    print("\n" + "=" * 50)
    print("📊 DATA QUALITY AUDIT & IMPUTATION SUMMARY")
    print("=" * 50)
    print(f"• Pre-Cleansing Total Rows:    {audit_report['raw']['total_rows']}")
    print(f"• Duplicate Rows Purged:       {audit_report['raw']['duplicates_count']}")
    print(f"• Total Missing Values Imputed:{audit_report['raw']['total_nulls']}")
    print(f"• Post-Cleansing Total Rows:   {audit_report['clean']['total_rows']}")
    print(f"• Post-Cleansing Nulls:        {audit_report['clean']['total_nulls']}")
    print(f"• Data Quality Index (DQII):   {audit_report['dqii_percent']}%")
    print("=" * 50)

    # -------------------------------------------------------------------------
    # STEP 3: LOAD INTO AMAZON RDS / CLOUD DATABASE
    # -------------------------------------------------------------------------
    print("\n[STEP 3/5] Connecting to Cloud Database (Amazon RDS Engine)...")
    db_loader = CloudDBLoader()
    db_loader.test_connection()

    # Load Cleansed Fact Table
    db_loader.load_dataframe(clean_df, "clean_transactions", if_exists="replace")
    
    # Load Aggregated Analytical KPI Table
    db_loader.load_dataframe(kpi_df, "kpi_market_summary", if_exists="replace")
    
    # Log Audit Trail
    db_loader.log_pipeline_audit(audit_report, status="SUCCESS")

    # -------------------------------------------------------------------------
    # STEP 4: EXPORT TO CLOUD DATA LAKE (AMAZON S3)
    # -------------------------------------------------------------------------
    print("\n[STEP 4/5] Exporting Cleansed Artifacts Back to Amazon S3...")
    clean_pdf = clean_df.toPandas()
    kpi_pdf = kpi_df.toPandas()

    clean_csv_str = clean_pdf.to_csv(index=False)
    kpi_csv_str = kpi_pdf.to_csv(index=False)

    s3.upload_dataframe_as_csv(clean_csv_str, f"{config.AWS_S3_PROCESSED_PREFIX}clean_transactions.csv")
    s3.upload_dataframe_as_csv(kpi_csv_str, f"{config.AWS_S3_PROCESSED_PREFIX}kpi_market_summary.csv")

    # -------------------------------------------------------------------------
    # STEP 5: VERIFICATION & DASHBOARD REPORTING
    # -------------------------------------------------------------------------
    print("\n[STEP 5/5] Generating Verification Reports & Visual Dashboards...")
    db_clean_check = db_loader.fetch_table_summary("clean_transactions")
    db_kpi_check = db_loader.fetch_table_summary("kpi_market_summary")

    print("\n--- SAMPLE RECORDS IN CLOUD DATABASE (clean_transactions) ---")
    print(tabulate(db_clean_check.head(5), headers="keys", tablefmt="fancy_grid"))

    print("\n--- AGGREGATED MARKET KPIS IN CLOUD DATABASE (kpi_market_summary) ---")
    print(tabulate(db_kpi_check.head(6), headers="keys", tablefmt="fancy_grid"))

    dashboard_file = generate_visual_dashboards(audit_report["raw"], audit_report["clean"], db_kpi_check, config.OUTPUT_DIR)

    # Stop Spark Session
    spark.stop()

    print("\n" + "=" * 80)
    print("✅ ASSIGNMENT 02 ETL PIPELINE COMPLETED SUCCESSFULLY!")
    print(f"• Cloud Source: S3 bucket '{config.AWS_S3_BUCKET}'")
    print(f"• Cloud Database Target: '{config.DB_ENGINE.upper()}' database '{config.DB_NAME}'")
    print(f"• Output Visualizations: {dashboard_file}")
    print("=" * 80)


if __name__ == "__main__":
    run_etl_pipeline()
