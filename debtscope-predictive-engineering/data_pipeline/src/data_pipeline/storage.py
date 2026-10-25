"""
Storage Abstraction Layer
Provides SQLite relational storage for transactional MVP records and staging,
alongside file persistence for Parquet, JSON, and CSV.
"""

import os
import json
import sqlite3
import pandas as pd
from typing import Dict, Any, List, Optional

class StorageManager:
    """
    Manages local SQLite database and structured file storage for the pipeline.
    """
    def __init__(self, db_path: str = "data/engineering_intelligence.db"):
        self.db_path = db_path
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self._init_sqlite()

    def _init_sqlite(self):
        """Initializes audit and metadata tables in SQLite."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS pipeline_runs (
                run_id TEXT PRIMARY KEY,
                batch_id TEXT,
                run_timestamp TEXT,
                status TEXT,
                records_processed INTEGER,
                duration_seconds REAL,
                details TEXT
            )
            """)
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS feature_store (
                file_id TEXT PRIMARY KEY,
                repository TEXT,
                file TEXT,
                module TEXT,
                business_impact REAL,
                maintainability REAL,
                complexity REAL,
                churn INTEGER,
                feature_json TEXT,
                updated_at TEXT
            )
            """)
            conn.commit()

    def record_pipeline_run(self, run_id: str, batch_id: str, status: str, records_processed: int, duration_seconds: float, details: Dict[str, Any]):
        """Logs a pipeline execution run."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO pipeline_runs (run_id, batch_id, run_timestamp, status, records_processed, duration_seconds, details)
            VALUES (?, ?, datetime('now'), ?, ?, ?, ?)
            """, (run_id, batch_id, status, records_processed, duration_seconds, json.dumps(details)))
            conn.commit()

    def save_features_to_sqlite(self, features: List[Dict[str, Any]]):
        """Persists feature records into SQLite table for relational querying."""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            for record in features:
                cursor.execute("""
                INSERT OR REPLACE INTO feature_store (file_id, repository, file, module, business_impact, maintainability, complexity, churn, feature_json, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """, (
                    record.get("file", ""),
                    record.get("repository", ""),
                    record.get("file", ""),
                    record.get("module", ""),
                    record.get("business_impact", 0.0),
                    record.get("maintainability", 0.0),
                    record.get("complexity", 0.0),
                    record.get("code_churn", record.get("churn", 0)),
                    json.dumps(record)
                ))
            conn.commit()

    @staticmethod
    def export_features(features: List[Dict[str, Any]], output_dir: str = "data/features") -> Dict[str, str]:
        """
        Exports feature records in JSON, CSV, and Parquet formats.
        """
        os.makedirs(output_dir, exist_ok=True)
        json_path = os.path.join(output_dir, "engineering_features.json")
        csv_path = os.path.join(output_dir, "engineering_features.csv")
        parquet_path = os.path.join(output_dir, "engineering_features.parquet")
        
        # Save JSON
        with open(json_path, "w", encoding="utf-8") as f:
            json.dump(features, f, indent=2)
            
        # Save CSV and Parquet via Pandas
        df = pd.DataFrame(features)
        df.to_csv(csv_path, index=False)
        try:
            df.to_parquet(parquet_path, index=False)
        except Exception:
            # Fallback if pyarrow is still installing
            pass
            
        return {
            "json": json_path,
            "csv": csv_path,
            "parquet": parquet_path
        }
