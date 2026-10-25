# Assignment No: 02 - Enterprise Cloud ETL Pipeline with Apache Spark
## Amazon S3 (Cloud Storage) ➔ PySpark Distributed Engine ➔ Amazon RDS (Cloud Database)

[![Apache Spark](https://img.shields.io/badge/Apache_Spark-3.5%2B-E25A1C?style=flat&logo=apachespark&logoColor=white)](https://spark.apache.org/)
[![AWS S3](https://img.shields.io/badge/AWS-S3-569A31?style=flat&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![AWS RDS](https://img.shields.io/badge/AWS-RDS-527FFF?style=flat&logo=amazonrds&logoColor=white)](https://aws.amazon.com/rds/)
[![Python](https://img.shields.io/badge/Python-3.10%20%7C%203.11%20%7C%203.12%20%7C%203.14-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)
[![Jupyter Notebook](https://img.shields.io/badge/Jupyter-Notebook-F37626?style=flat&logo=jupyter&logoColor=white)](https://jupyter.org/)

An enterprise-grade, cloud-native **Extract, Transform, and Load (ETL)** pipeline built with **Apache Spark (PySpark)** and **Amazon Web Services (AWS)**. The pipeline extracts dirty transactional data from **Amazon S3**, applies distributed cleansing, statistical imputation, deduplication, schema validation, and feature engineering, and loads the structured data directly into an **Amazon RDS / Cloud-based Relational Database** (PostgreSQL/MySQL), while exporting processed analytics artifacts back to the S3 data lake layer.

---

## 1. System Architecture

```mermaid
graph LR
    subgraph Cloud Storage (AWS S3)
        S3Raw[s3://.../raw/raw_transactions.csv]
    end

    subgraph PySpark Distributed Engine
        E[S3 Extractor] -->|inferSchema=False| T1[Text & Currency Normalization]
        T1 -->|approxQuantile & Mean| T2[Statistical Imputation Engine]
        T2 -->|dropDuplicates| T3[Deduplication & Quality Gates]
        T3 -->|Segmentations & Aggregations| T4[Analytical Metric Layer]
    end

    subgraph Cloud Relational Database (AWS RDS)
        T3 -->|Batch Load| RDS1[(RDS: clean_transactions)]
        T4 -->|Batch Load| RDS2[(RDS: kpi_market_summary)]
        T3 -->|Audit Trail| RDS3[(RDS: data_quality_audit_log)]
    end

    subgraph Processed Data Lake (AWS S3)
        T3 -.->|Cloud Export| S3Clean[s3://.../processed/clean_transactions.csv]
        T4 -.->|Cloud Export| S3KPI[s3://.../processed/kpi_market_summary.csv]
    end

    S3Raw --> E
```

---

## 2. Key Pipeline Components

### A. Cloud Extraction (Amazon S3)
* **Storage Bucket**: Dedicated S3 bucket `spark-etl-pipeline-assignment2-dhruv` in AWS region `eu-north-1`.
* **Automated Provisioning**: Programmatically detects, provisions, and manages bucket lifecycle via `boto3`.
* **Ingestion Integrity**: Ingests raw data as string types (`inferSchema=False`) to prevent malformed currency symbols and formatting errors from being dropped.

### B. PySpark Distributed Processing
* **Missing Value Imputation**:
  * **Numerical Fields**: Median imputation for `age` (using `approxQuantile` for outlier resilience) and Mean imputation for `annual_income`, `purchase_amount`, and `store_rating`.
  * **Categorical Fields**: Mode (most frequent) imputation for `gender`, default fallback for `city` (`"Unknown"`).
  * **Temporal Fields**: Default fallback for `transaction_date` (`"2023-01-01"`).
* **Sanitization & Standardization**:
  * Strips currency characters (`$`) and formatting commas (`,`).
  * Normalizes text casing (e.g. `M`/`male`/`MALE` ➔ `Male`).
  * Trims whitespace and standardizes column headers to `snake_case`.
* **Deduplication**: Identifies and drops redundant transactions by primary business keys.
* **Feature Engineering**:
  * `customer_segment`: `Budget` (<$55K), `Standard` ($55K-$75K), `Premium` (>$75K).
  * `age_group`: `Young Adult (<30)`, `Adult (30-45)`, `Senior (>45)`.
  * `spending_tier`: `Low (<$150)`, `Medium ($150-$350)`, `High (>$350)`.
* **Aggregated Market KPIs**:
  * City-level summary table computing Total Revenue, Average Order Value (AOV), Average Customer Rating, and Unique Customers.

### C. Cloud Database Loading (Amazon RDS)
* **High-Throughput Batch Loading**: Writes normalized DataFrames into target database tables:
  1. `clean_transactions`: Cleansed, validated fact table.
  2. `kpi_market_summary`: Aggregated analytical summary table.
  3. `data_quality_audit_log`: Pipeline execution audit trail.
* **Dual Execution Support**: Native connectivity to **Amazon RDS (PostgreSQL / MySQL)** with local SQLite simulation for zero-cost verification.

---

## 3. Data Quality & Audit Results

The pipeline computes a **Data Quality Improvement Index (DQII)**:

$$\text{DQII \%} = \frac{\text{Nulls Imputed} + (\text{Duplicates Purged} \times \text{Columns})}{\text{Total Cells in Raw Dataset}} \times 100$$

| Metric | Pre-Cleansing (Raw) | Post-Cleansing (Cleaned) | Delta / Improvement |
| :--- | :---: | :---: | :---: |
| **Total Rows** | 28 | 25 | -3 duplicate records purged |
| **Missing Values (Nulls)** | 23 | **0** | 100% Imputed |
| **Duplicate Records** | 2 | **0** | 0 Duplicates Remaining |
| **Schema Completeness** | Dirty Strings | Validated Casted Types | 100% Validated |
| **DQII Index** | — | — | **15.36%** |

---

## 4. Repository File Structure

```text
spark_aws_rds_etl/
├── README.md                      # Comprehensive project documentation
├── requirements.txt               # PySpark, boto3, sqlalchemy, pymysql dependencies
├── .env.example                   # AWS and RDS database configuration template
├── .gitignore                     # Git ignore rules
├── config.py                      # Centralized configuration and DB URI builders
├── s3_manager.py                  # Amazon S3 cloud storage manager
├── spark_transform.py             # PySpark transformation & imputation engine
├── db_loader.py                   # Amazon RDS & Cloud DB loader
├── main_pipeline.py               # End-to-end orchestrated pipeline runner
├── test_pipeline.py               # Automated unit & integration test suite
├── generate_notebook.py           # Script to generate Jupyter submission
├── assignment_2_spark_etl.ipynb   # Interactive Jupyter Notebook
├── sample_data/
│   └── raw_transactions.csv       # Source messy dataset
└── output/
    ├── pipeline_dashboard.png     # Data quality & analytics visual dashboard
    └── cloud_rds_simulated.db     # Simulated cloud database table exports
```

---

## 5. Quickstart & Execution Guide

### Step 1: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and set your credentials (if connecting to a remote RDS instance):
```bash
cp .env.example .env
```

### Step 3: Run the End-to-End Cloud Pipeline
```bash
python main_pipeline.py
```

### Step 4: Run the Automated Test Suite
```bash
python test_pipeline.py
```

### Step 5: Explore the Interactive Jupyter Notebook
Open and run `assignment_2_spark_etl.ipynb` in Jupyter Lab, VS Code, or Google Colab.
