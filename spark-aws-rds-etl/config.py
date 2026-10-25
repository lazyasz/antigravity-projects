"""
Configuration Module for Assignment 02: Spark Cloud ETL Pipeline
Supports Amazon Web Services (S3, RDS) and resilient fallback execution.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
BASE_DIR = Path(__file__).resolve().parent
SAMPLE_DATA_DIR = BASE_DIR / "sample_data"
SAMPLE_DATA_FILE = SAMPLE_DATA_DIR / "raw_transactions.csv"
OUTPUT_DIR = BASE_DIR / "output"
OUTPUT_DIR.mkdir(exist_ok=True)

# Load environment variables from .env if present
load_dotenv(BASE_DIR / ".env")

# AWS S3 Settings
AWS_REGION = os.getenv("AWS_REGION", "eu-north-1")
AWS_S3_BUCKET = os.getenv("AWS_S3_BUCKET", "spark-etl-pipeline-assignment2-dhruv")
AWS_S3_RAW_KEY = os.getenv("AWS_S3_RAW_KEY", "raw/raw_transactions.csv")
AWS_S3_PROCESSED_PREFIX = os.getenv("AWS_S3_PROCESSED_PREFIX", "processed/")

# Database (Amazon RDS / Cloud DB) Settings
DB_ENGINE = os.getenv("DB_ENGINE", "sqlite").lower()  # 'postgresql', 'mysql', or 'sqlite'
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = int(os.getenv("DB_PORT", "3306" if DB_ENGINE == "mysql" else "5432"))
DB_NAME = os.getenv("DB_NAME", "spark_assignment2_rds")
DB_USER = os.getenv("DB_USER", "admin")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
SQLITE_DB_PATH = str(OUTPUT_DIR / "cloud_rds_simulated.db")

# Spark Settings
SPARK_APP_NAME = os.getenv("SPARK_APP_NAME", "Spark_AWS_S3_to_RDS_ETL")
SPARK_MASTER = os.getenv("SPARK_MASTER", "local[*]")


def get_db_url() -> str:
    """Returns SQLAlchemy connection URL based on configured engine."""
    if DB_ENGINE == "postgresql":
        return f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    elif DB_ENGINE == "mysql":
        return f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    else:
        # SQLite fallback simulating cloud relational target
        return f"sqlite:///{SQLITE_DB_PATH}"


def get_jdbc_url() -> str:
    """Returns standard JDBC connection string for Spark DataFrameWriter."""
    if DB_ENGINE == "postgresql":
        return f"jdbc:postgresql://{DB_HOST}:{DB_PORT}/{DB_NAME}"
    elif DB_ENGINE == "mysql":
        return f"jdbc:mysql://{DB_HOST}:{DB_PORT}/{DB_NAME}?useSSL=false&allowPublicKeyRetrieval=true"
    else:
        return f"jdbc:sqlite:{SQLITE_DB_PATH}"
