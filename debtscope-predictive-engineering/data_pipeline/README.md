# Predictive Engineering Intelligence Platform - Big Data Pipeline

[![PySpark](https://img.shields.io/badge/PySpark-4.0.4-orange.svg)](https://spark.apache.org/)
[![Python](https://img.shields.io/badge/Python-3.9%2B-blue.svg)](https://www.python.org/)
[![Tests](https://img.shields.io/badge/Tests-14%20Passed-brightgreen.svg)](tests/)
[![Architecture](https://img.shields.io/badge/Architecture-Medallion%20Lakehouse-informational.svg)](docs/ARCHITECTURE_AND_BIG_DATA.md)

An enterprise-grade Data Engineering and Big Data processing pipeline for the **Predictive Engineering Intelligence Platform for Technical Debt Prioritization**.

This pipeline transforms raw, noisy software engineering data (commits, diffs, static analysis, bugs, dependencies, and business metrics) into a clean, standardized feature dataset consumed directly by downstream Machine Learning and Business Prioritization models.

---

## 1. System Architecture

```
+-----------------------------------------------------------------------------------+
|                           Engineering Data Sources                                |
|  - Controlled Engineering Dataset (11 Relational Entities)                        |
|  - Pluggable GitHub REST API Connector (with Offline Fallback)                    |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                         Ingestion & Staging (Bronze)                              |
|  - JSON / CSV Ingestors with Schema Validation & Batch Auditing                  |
|  - Staged in data/raw/ and SQLite Transaction Store                               |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                        Data Cleaning & ETL (Silver)                               |
|  - Schema enforcement, primary-key deduplication (commits, file changes)          |
|  - Deterministic missing value imputation & outlier bounds (LOC, churn)           |
|  - Intermediate audit log: data/processed/cleaning_audit.json                     |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                   Distributed PySpark Processing Pipeline                         |
|  - Strongly-typed StructType schemas                                              |
|  - Multi-table relational joins across files, commits, issues, and releases       |
|  - Spark Window Functions: Developer Concentration & Debt Age recency             |
|  - GroupBy aggregations: Code Churn, Commit Counts, Defect Rates                  |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                         Feature Engineering Layer                                 |
|  - SEI Maintainability Index, Defect Density, Composite Dependency Risk,          |
|    Business Impact Score, Predictive Remediation Effort                           |
+----------------------------------------+------------------------------------------+
                                         |
                                         v
+-----------------------------------------------------------------------------------+
|                 Standardized Feature Dataset Contract (Gold)                      |
|  - data/features/engineering_features.json (Direct contract for Member 2 & 3)    |
|  - data/features/engineering_features.csv  (Tabular training matrix)             |
|  - data/features/engineering_features.parquet (Columnar Big Data format)          |
+-----------------------------------------------------------------------------------+
```

---

## 2. Directory Structure

```
.
├── data/
│   ├── raw/                           # Bronze tier: 11 raw engineering entity files
│   ├── processed/                     # Silver tier: Cleaned staging JSON & audit logs
│   ├── features/                      # Gold tier: Final feature dataset (JSON, CSV, Parquet)
│   └── engineering_intelligence.db   # SQLite transactional store & pipeline run audit
├── docs/
│   ├── ARCHITECTURE_AND_BIG_DATA.md   # 4 Vs, Catalyst optimizer, cluster scaling design
│   ├── DATA_SCHEMA.md                 # Complete data dictionary for raw, processed & features
│   ├── METRICS_DOCUMENTATION.md       # Mathematical definitions & derivations for all metrics
│   └── TECHNICAL_VIVA_QA.md           # Answers to all technical evaluation questions
├── src/
│   ├── data_pipeline/
│   │   ├── __init__.py
│   │   ├── data_generator.py          # Controlled relational data generator (11 entities)
│   │   ├── ingestion.py               # Batch tracking & file validation
│   │   ├── cleaning.py                # Schema guards, deduplication & imputation ETL
│   │   ├── spark_processor.py         # Distributed PySpark joins, windows & aggregations
│   │   ├── feature_engineering.py     # Maintainability Index & business scoring
│   │   ├── storage.py                 # Multi-format exports (Parquet, CSV, JSON, SQLite)
│   │   └── pipeline_runner.py         # End-to-end pipeline orchestrator
│   └── github_connector/
│       ├── __init__.py
│       └── github_ingest.py           # GitHub REST API client with offline fallback
├── tests/
│   ├── test_cleaning.py               # Missing values, duplicates, and invalid values tests
│   ├── test_schemas_and_validation.py # Type validation, empty datasets & schema guards
│   ├── test_spark_processor.py        # PySpark schemas, Window functions & aggregations
│   ├── test_feature_engineering.py    # Maintainability index & business impact math tests
│   └── test_end_to_end_pipeline.py    # Full pipeline run & output contract verification
├── pytest.ini
├── requirements.txt
├── run_pipeline.py                    # Main executable entry point
└── README.md
```

---

## 3. Quickstart & Installation

### Prerequisites
- Python 3.9+
- Java 11 or 17 (e.g. Homebrew OpenJDK 17 on macOS Apple Silicon: `/opt/homebrew/opt/openjdk@17`)

### 1. Set Up Environment & Install Dependencies
```bash
# Create Python virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### 2. Run the Complete Data Pipeline
```bash
python run_pipeline.py
```
This executes the 5 pipeline stages:
1. Validates or generates controlled engineering datasets in `data/raw/`.
2. Cleans, sanitizes, and deduplicates records into `data/processed/`.
3. Initializes PySpark and executes distributed window functions, joins, and aggregations.
4. Derives engineering intelligence features.
5. Exports the finalized dataset to `data/features/` and records run metadata into SQLite.

### 3. Run Automated Tests
```bash
pytest tests/ -v
```
All 14 automated tests verify missing value imputation, duplicate removal, invalid value sanitization, empty dataset handling, PySpark transformations, and schema contract stability.

---

## 4. Output Contract for ML & Prioritization Modules

The pipeline exports a stable contract consumed by Member 2 (ML Predictive Analytics) and Member 3 (Business-Aware Technical Debt Prioritization):

### Output Files:
- `data/features/engineering_features.json`
- `data/features/engineering_features.csv`
- `data/features/engineering_features.parquet`

### Example Output Record:
```json
{
  "repository": "core-banking-service",
  "file": "payment.py",
  "module": "payment_service",
  "developer": "dev-01",
  "commit_count": 23,
  "change_frequency": 23,
  "code_churn": 4246,
  "churn": 4246,
  "loc": 1842,
  "complexity": 41.0,
  "maintainability": 42.8,
  "code_smells": 14,
  "dependency_age": 327,
  "dependency_risk": 53.2,
  "issue_count": 8,
  "defect_count": 5,
  "issue_severity": 2.5,
  "pr_count": 17,
  "release_frequency": 0.5,
  "module_criticality": 95.0,
  "business_impact": 96.8,
  "debt_age": 49,
  "release_impact": 17.0,
  "maintenance_effort": 278.2,
  "estimated_remediation_effort": 135.6,
  "developer_concentration": 0.61,
  "defect_frequency": 2.71
}
```

---

## 5. Core Calculated Metrics Overview

| Metric | Calculation Method | Role in Debt Prioritization |
| :--- | :--- | :--- |
| **Code Churn** | $\sum (\text{additions} + \text{deletions})$ | Measures instability and volatility |
| **Change Frequency** | Total modification commits | Measures revision pace |
| **Developer Concentration** | Top contributor commits / Total commits | Quantifies "Bus Factor" and silo risks |
| **Defect Frequency** | $\frac{\text{Defects}}{\text{LOC}} \times 1,000$ | Measures defect density per KLOC |
| **Maintainability Index** | Standard SEI / Visual Studio formulation ($0-100$) | Measures ease of comprehension & refactoring |
| **Complexity** | McCabe Cyclomatic Complexity ($\ge 1.0$) | Evaluates control flow branching |
| **Dependency Risk** | Weighted sum of CVEs, version staleness, and license risks | Software supply-chain vulnerability |
| **Debt Age** | Days elapsed since earliest unresolved debt ticket | Tracks temporal decay and interest accumulation |
| **Business Impact** | Composite score from module criticality, revenue impact, SLA | Bridges engineering debt with financial priority |
| **Remediation Effort** | Predictive hours based on complexity, churn, and debt age | Used for resource planning and ROI estimation |

For formal mathematical derivations, consult [docs/METRICS_DOCUMENTATION.md](docs/METRICS_DOCUMENTATION.md).

---

## 6. Technical Evaluation (Viva) Preparation

Comprehensive explanations of key theoretical concepts:
- **Why PySpark?** See [docs/TECHNICAL_VIVA_QA.md#q1](docs/TECHNICAL_VIVA_QA.md)
- **Why Not Only Pandas?** See [docs/TECHNICAL_VIVA_QA.md#q1](docs/TECHNICAL_VIVA_QA.md)
- **The 4 Vs of Software Big Data:** See [docs/ARCHITECTURE_AND_BIG_DATA.md#1-the-4-vs-of-big-data-in-software-engineering-intelligence](docs/ARCHITECTURE_AND_BIG_DATA.md)
- **Scaling to Millions of Records:** See [docs/ARCHITECTURE_AND_BIG_DATA.md#4-scaling-to-millions-of-engineering-records](docs/ARCHITECTURE_AND_BIG_DATA.md)
- **Full Viva Q&A Guide:** See [docs/TECHNICAL_VIVA_QA.md](docs/TECHNICAL_VIVA_QA.md)
