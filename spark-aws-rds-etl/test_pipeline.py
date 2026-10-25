"""
Unit and Integration Test Suite for Spark Cloud ETL Pipeline
Tests S3 operations, PySpark transformations, Quality Gates, and Database Loader.
"""
import sys
import unittest
from pathlib import Path
import pandas as pd

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

import config
from s3_manager import S3Manager
from spark_transform import get_spark_session, extract_raw_data, clean_and_transform_pipeline, audit_data_quality
from db_loader import CloudDBLoader


class TestSparkETLPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.spark = get_spark_session("TestSparkPipeline")
        cls.s3 = S3Manager()
        cls.db_loader = CloudDBLoader()

    @classmethod
    def tearDownClass(cls):
        cls.spark.stop()

    def test_01_s3_bucket_connectivity(self):
        """Test S3 bucket accessibility."""
        exists = self.s3.ensure_bucket_exists()
        self.assertTrue(exists, "S3 bucket should exist and be accessible.")

    def test_02_s3_upload_and_download(self):
        """Test uploading raw dataset to S3 and downloading it."""
        upload_success = self.s3.upload_raw_dataset(config.SAMPLE_DATA_FILE, "test/test_transactions.csv")
        self.assertTrue(upload_success, "File should upload to S3 successfully.")

        test_dest = config.OUTPUT_DIR / "test_download.csv"
        download_success = self.s3.download_to_local("test/test_transactions.csv", test_dest)
        self.assertTrue(download_success, "File should download from S3 successfully.")
        self.assertTrue(test_dest.exists(), "Downloaded test file must exist on disk.")

    def test_03_spark_transformation_and_quality_gates(self):
        """Test PySpark data cleansing, statistical imputation, and quality assertions."""
        raw_df = extract_raw_data(self.spark, str(config.SAMPLE_DATA_FILE))
        raw_count = raw_df.count()
        self.assertGreater(raw_count, 0, "Raw dataset must contain rows.")

        clean_df, kpi_df, audit = clean_and_transform_pipeline(self.spark, raw_df)

        # Assert zero nulls remain
        self.assertEqual(audit["clean"]["total_nulls"], 0, "Cleaned dataset must have 0 nulls.")
        
        # Assert duplicates were purged
        self.assertLessEqual(audit["clean"]["total_rows"], raw_count, "Cleaned row count should be <= raw count.")
        self.assertGreater(audit["raw"]["duplicates_count"], 0, "Raw dataset had duplicates that should be purged.")

        # Assert DQII index is positive
        self.assertGreater(audit["dqii_percent"], 0, "Data Quality Improvement Index should be positive.")

        # Assert KPI summary is generated
        kpi_count = kpi_df.count()
        self.assertGreater(kpi_count, 0, "KPI Summary DataFrame must have aggregated market records.")

    def test_04_database_load_and_retrieval(self):
        """Test database table writing and query validation."""
        raw_df = extract_raw_data(self.spark, str(config.SAMPLE_DATA_FILE))
        clean_df, kpi_df, audit = clean_and_transform_pipeline(self.spark, raw_df)

        loaded_clean = self.db_loader.load_dataframe(clean_df, "test_clean_table", if_exists="replace")
        self.assertEqual(loaded_clean, clean_df.count(), "Loaded rows must match Spark count.")

        queried_df = self.db_loader.fetch_table_summary("test_clean_table")
        self.assertEqual(len(queried_df), clean_df.count(), "Queried rows must match loaded count.")


if __name__ == "__main__":
    unittest.main(verbosity=2)
