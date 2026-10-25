"""
Pipeline Orchestrator
Connects Ingestion, Cleaning (ETL), PySpark Distributed Processing,
Feature Engineering, and Storage/Export into a unified execution flow.
"""

import time
import uuid
from typing import Dict, Any, Optional

from .ingestion import IngestionEngine
from .cleaning import DataCleaningPipeline
from .spark_processor import SparkDataProcessor
from .feature_engineering import FeatureEngineeringPipeline
from .storage import StorageManager

class PipelineOrchestrator:
    """
    Coordinates end-to-end Big Data pipeline execution.
    """
    def __init__(self, raw_dir: str = "data/raw", processed_dir: str = "data/processed", features_dir: str = "data/features", db_path: str = "data/engineering_intelligence.db"):
        self.raw_dir = raw_dir
        self.processed_dir = processed_dir
        self.features_dir = features_dir
        self.storage_manager = StorageManager(db_path)
        self.run_id = f"run-{uuid.uuid4().hex[:8]}"

    def run(self) -> Dict[str, Any]:
        """
        Executes the complete pipeline from raw ingestion to final feature dataset.
        """
        start_time = time.time()
        print("=================================================================")
        print("  Predictive Engineering Intelligence Platform - Big Data Pipeline")
        print(f"  Run ID: {self.run_id}")
        print("=================================================================\n")

        # 1. Ingestion Layer
        print("[Step 1/5] Ingesting Engineering Data Sources...")
        ingestion = IngestionEngine(self.raw_dir, auto_generate=True)
        raw_status = ingestion.ensure_data_available()
        raw_data = ingestion.load_all()
        print(f"  -> Ingestion complete. Batch ID: {raw_status['batch_id']}. Loaded {len(raw_data)} entities.\n")

        # 2. Cleaning & ETL Layer
        print("[Step 2/5] Executing Data Cleaning & Validation (ETL)...")
        cleaner = DataCleaningPipeline(self.processed_dir)
        cleaned_data, audit_log = cleaner.clean_all(raw_data)
        print(f"  -> Duplicates Removed: {audit_log['duplicates_removed']}")
        print(f"  -> Missing Values Imputed: {audit_log['nulls_imputed']}")
        print(f"  -> Anomalies Sanitized: {audit_log['anomalies_sanitized']}")
        print("  -> Cleaned datasets staged in data/processed/\n")

        # 3. Distributed PySpark Processing Layer
        print("[Step 3/5] Launching Distributed PySpark Processing...")
        spark_processor = SparkDataProcessor(app_name="TechDebtPipeline")
        try:
            transformed_spark_df = spark_processor.process_pipeline(cleaned_data)
            print(f"  -> Spark execution plan created. Partitions: {transformed_spark_df.rdd.getNumPartitions()}")
            
            # 4. Feature Engineering Layer
            print("\n[Step 4/5] Deriving Engineering Intelligence Features...")
            fe = FeatureEngineeringPipeline()
            final_spark_df = fe.transform_features(transformed_spark_df)
            feature_records = fe.to_contract_records(final_spark_df)
            print(f"  -> Derived features computed for {len(feature_records)} software modules/files.")
        finally:
            spark_processor.stop()
            print("  -> PySpark Session gracefully closed.\n")

        # 5. Storage & Contract Export Layer
        print("[Step 5/5] Exporting Standardized Feature Dataset...")
        export_paths = self.storage_manager.export_features(feature_records, self.features_dir)
        self.storage_manager.save_features_to_sqlite(feature_records)
        
        duration = round(time.time() - start_time, 2)
        self.storage_manager.record_pipeline_run(
            run_id=self.run_id,
            batch_id=raw_status["batch_id"],
            status="SUCCESS",
            records_processed=len(feature_records),
            duration_seconds=duration,
            details={
                "exports": export_paths,
                "audit": audit_log
            }
        )

        print(f"  -> JSON Features:    {export_paths['json']}")
        print(f"  -> CSV Features:     {export_paths['csv']}")
        print(f"  -> Parquet Features: {export_paths['parquet']}")
        print(f"  -> SQLite Database:  {self.storage_manager.db_path}")
        print(f"\nPipeline Run Completed Successfully in {duration}s!")
        print("=================================================================\n")

        return {
            "run_id": self.run_id,
            "status": "SUCCESS",
            "records_count": len(feature_records),
            "duration_seconds": duration,
            "export_paths": export_paths,
            "sample_record": feature_records[0] if feature_records else None
        }

if __name__ == "__main__":
    orchestrator = PipelineOrchestrator()
    orchestrator.run()
