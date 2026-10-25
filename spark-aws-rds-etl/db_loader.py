"""
Database Loader Module for Amazon RDS / Cloud-Based Database
Supports Spark DataFrame persistence into Amazon RDS (PostgreSQL/MySQL) and local simulated cloud DB.
"""
import logging
import pandas as pd
from sqlalchemy import create_engine, text, inspect
from typing import Dict, Any
from pyspark.sql import DataFrame
import config

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("DBLoader")


class CloudDBLoader:
    def __init__(self, db_url: str = None):
        self.db_url = db_url or config.get_db_url()
        self.engine = create_engine(self.db_url, pool_pre_ping=True)
        self.engine_name = config.DB_ENGINE

    def test_connection(self) -> bool:
        """Tests the database connection against Amazon RDS / Cloud Database."""
        try:
            with self.engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            logger.info(f"Database connection to '{self.engine_name.upper()}' verified successfully.")
            return True
        except Exception as e:
            logger.warning(f"Connection test to '{self.engine_name}' failed: {e}")
            return False

    def load_dataframe(self, spark_df: DataFrame, table_name: str, if_exists: str = "replace") -> int:
        """
        Loads a PySpark DataFrame into the target Cloud Database table.
        Converts Spark DataFrame to Pandas for high-compatibility batch insertion.
        """
        try:
            pdf = spark_df.toPandas()
            row_count = len(pdf)
            logger.info(f"Loading {row_count} records into cloud table '{table_name}' ({if_exists})...")
            
            with self.engine.begin() as conn:
                pdf.to_sql(table_name, conn, if_exists=if_exists, index=False)
            
            logger.info(f"Successfully loaded {row_count} rows into '{table_name}'.")
            return row_count
        except Exception as e:
            logger.error(f"Failed to load table '{table_name}': {e}")
            raise e

    def log_pipeline_audit(self, audit_report: Dict[str, Any], status: str = "SUCCESS"):
        """Records an execution audit log entry in the cloud database."""
        try:
            audit_df = pd.DataFrame([{
                "execution_timestamp": pd.Timestamp.now(),
                "status": status,
                "raw_rows": audit_report["raw"]["total_rows"],
                "clean_rows": audit_report["clean"]["total_rows"],
                "duplicates_purged": audit_report["raw"]["duplicates_count"],
                "nulls_imputed": audit_report["raw"]["total_nulls"],
                "dqii_percent": audit_report["dqii_percent"]
            }])
            with self.engine.begin() as conn:
                audit_df.to_sql("data_quality_audit_log", conn, if_exists="append", index=False)
            logger.info("Pipeline audit metrics logged to 'data_quality_audit_log'.")
        except Exception as e:
            logger.warning(f"Could not log audit metrics: {e}")

    def fetch_table_summary(self, table_name: str) -> pd.DataFrame:
        """Retrieves and inspects the loaded table from the cloud database."""
        try:
            with self.engine.connect() as conn:
                df = pd.read_sql_query(f"SELECT * FROM {table_name}", conn)
            return df
        except Exception as e:
            logger.error(f"Error querying '{table_name}': {e}")
            return pd.DataFrame()


if __name__ == "__main__":
    loader = CloudDBLoader()
    loader.test_connection()
