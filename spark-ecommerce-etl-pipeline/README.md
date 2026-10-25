# Cloud Data Engineering Lab — Assignment No. 02
## Cloud-Based ETL Pipeline: Amazon S3 $\to$ Apache Spark $\to$ Amazon RDS MySQL

---

## 1. Assignment Title
**Develop an ETL Pipeline Using Apache Spark to Extract, Transform, and Load Data from Amazon S3 into Amazon RDS (MySQL).**

---

## 2. Objective
The objective of this assignment is to design, implement, and validate an automated, cloud-native **Extract, Transform, and Load (ETL)** pipeline. The pipeline ingests raw customer transaction datasets stored in an **Amazon S3** bucket, performs comprehensive data cleaning, deduplication, schema enforcement, and feature derivation using **Apache Spark (PySpark)**, and loads the transformed dataset into a relational cloud database (**Amazon RDS MySQL**) using **Spark JDBC**.

---

## 3. End-to-End Architecture

```text
+-----------------------------------+
|      Amazon S3 (Cloud Storage)    |
|   Bucket: cde-lab1-dhruv-upload-bucket  |
|   Key:    upload_csv2.csv         |
+-----------------+-----------------+
                  |
                  | [1] Extraction (AWS SDK / PySpark CSV Reader)
                  v
+-----------------------------------+
|     Apache Spark / PySpark Engine |
|   - Deduplication (dropDuplicates)|
|   - Whitespace Trimming           |
|   - Schema & Null Handling        |
|   - Derived Field (Category Tier) |
+-----------------+-----------------+
                  |
                  | [2] JDBC Load (com.mysql.cj.jdbc.Driver)
                  v
+-----------------------------------+
|    Amazon RDS MySQL (Cloud DB)    |
|   Instance: db.t3.micro (Free Tier)
|   Database: etl_database          |
|   Table:    customers             |
+-----------------+-----------------+
                  |
                  | [3] Data Verification & SQL Analysis
                  v
+-----------------------------------+
|     SQL Verification & Reports    |
|   - SELECT * FROM customers       |
|   - Aggregations & Groupings      |
+-----------------------------------+
```

---

## 4. Technologies Used
* **Apache Spark / PySpark 3.5+**: Distributed data processing and transformation engine.
* **Python 3.13 / 3.14**: Primary scripting language.
* **MySQL Connector/J (8.3.0)**: Type-4 JDBC driver facilitating high-performance Spark-to-MySQL connectivity.
* **PyMySQL & Cryptography**: Direct relational connectivity for pre-checks and SQL verification.
* **Boto3 & AWS CLI v2**: Programmatic AWS resource management and object retrieval.
* **Java 17 (OpenJDK LTS)**: JVM runtime for Spark execution.

---

## 5. AWS Services Used
1. **Amazon S3 (Simple Storage Service)**: Scalable object storage holding the source CSV dataset (`cde-lab1-dhruv-upload-bucket`).
2. **Amazon RDS (Relational Database Service)**: Managed MySQL database instance hosting the target `etl_database` and `customers` table.
3. **AWS IAM (Identity and Access Management)**: Access control and credential management for S3 object retrieval and RDS operations.
4. **Amazon VPC / Security Groups**: Network firewall rules managing inbound port 3306 JDBC traffic.

---

## 6. Project Structure

```text
assignment-02-spark-etl/
│
├── data/
│   ├── upload_csv2.csv          # Lab 1 baseline dataset mirror
│   └── customers.csv            # Extended customer dataset for transformation testing
│
├── drivers/
│   └── mysql-connector-j-8.3.0.jar # Official MySQL JDBC Driver for Spark
│
├── src/
│   ├── etl_pipeline.py          # Complete PySpark ETL pipeline (Phases 6, 7, 8, 10, 11)
│   └── verify_data.py           # SQL verification utility via PyMySQL (Phase 9)
│
├── sql/
│   ├── create_tables.sql        # Table DDL for etl_database.customers
│   └── verification_queries.sql # Lab verification and reporting queries
│
├── run_pipeline.ps1             # PowerShell launcher for one-click lab demonstration
├── .env                         # Secrets and environment configurations (excluded from git)
├── .env.example                 # Template for required environment variables
├── .gitignore                   # Excludes credentials, venv, and cache
├── requirements.txt             # Python project dependencies
└── README.md                    # Comprehensive documentation and screenshot guide
```

---

## 7. Prerequisites
* **Java**: OpenJDK 17 LTS or higher installed and `JAVA_HOME` configured.
* **Python**: Python 3.10+ (tested with Python 3.13).
* **AWS CLI**: Version 2.x installed and authenticated.
* **Amazon RDS MySQL**: Instance running and accessible on port 3306.

---

## 8. AWS CLI Verification
Before running the pipeline, verify active AWS credentials:

```powershell
aws --version
aws sts get-caller-identity
aws configure list
```

**Discovered Identity:**
* **Account**: `256663926441`
* **IAM User**: `arn:aws:iam::256663926441:user/upload-csv-user`
* **Default Region**: `eu-north-1`

---

## 9. S3 Input Location
The raw CSV file was established in Assignment 01:
* **S3 URI**: `s3://cde-lab1-dhruv-upload-bucket/upload_csv2.csv`
* **Region**: `eu-north-1`

---

## 10. Amazon RDS Configuration Guide

If creating an Amazon RDS MySQL instance for the lab:

1. **Navigate to AWS Console** $\to$ **RDS** $\to$ **Databases** $\to$ **Create database**.
2. **Database Engine**: MySQL (Community Edition).
3. **Template**: Free tier (e.g., `db.t3.micro` or `db.t4g.micro`).
4. **DB Instance Identifier**: `cde-mysql-db` (or custom name).
5. **Master Username**: `admin`.
6. **Master Password**: Create a strong password and save it in `.env`.
7. **Public Access**: Select **Yes** (allows local Spark application to connect).
8. **VPC Security Group**: Ensure Inbound Rule allows **Type: MySQL/Aurora (Port 3306)** from **My IP**.
9. **Initial Database Name** (under Additional configuration): `etl_database`.

---

## 11. Environment Variables Configuration

Create a `.env` file in the project root:

```ini
# ==============================================================================
# AWS & Amazon S3 Configuration
# ==============================================================================
AWS_REGION=eu-north-1
S3_BUCKET=cde-lab1-dhruv-upload-bucket
S3_FILE_KEY=upload_csv2.csv

# ==============================================================================
# Amazon RDS MySQL Configuration
# ==============================================================================
RDS_HOST=your-rds-endpoint.eu-north-1.rds.amazonaws.com
RDS_PORT=3306
RDS_DATABASE=etl_database
RDS_USERNAME=admin
RDS_PASSWORD=your_secure_rds_password

# ==============================================================================
# Spark JDBC Configuration
# ==============================================================================
JDBC_JAR_PATH=drivers/mysql-connector-j-8.3.0.jar
```

> [!CAUTION]
> Never commit `.env` to Git. The `.gitignore` file is pre-configured to ignore `.env`.

---

## 12. How to Run the Pipeline

### Step 1: Install Dependencies
```powershell
.\.venv\Scripts\pip install -r requirements.txt
```

### Step 2: Initialize Database Table (Optional if using JDBC auto-table)
Run the SQL DDL in your SQL client or Workbench:
```sql
CREATE DATABASE IF NOT EXISTS etl_database;
USE etl_database;

CREATE TABLE IF NOT EXISTS customers (
    customer_id INT PRIMARY KEY,
    name VARCHAR(100),
    age INT,
    city VARCHAR(100),
    purchase_amount DECIMAL(10,2),
    purchase_category VARCHAR(50),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Step 3: Execute the PySpark ETL Pipeline
Run the pipeline:
```powershell
.\.venv\Scripts\python src/etl_pipeline.py
```
Or use the launcher script:
```powershell
.\run_pipeline.ps1
```

---

## 13. ETL Execution Phases

### Phase 6: Extraction
Reads raw CSV from S3 bucket `cde-lab1-dhruv-upload-bucket/upload_csv2.csv`.
```python
df = spark.read \
    .option("header", "true") \
    .option("inferSchema", "true") \
    .csv(extracted_path)
```

### Phase 7: Transformation
1. **Deduplication**: `df = df.dropDuplicates()`
2. **Whitespace Cleaning**: `trim(col("name"))`, `trim(col("city"))`
3. **Type Casting & Null Handling**: 
   - `age` cast to `IntegerType`, nulls filled with 21.
   - `purchase_amount` cast to `DoubleType`, nulls filled with 0.0.
4. **Business Field Derivation**:
   - `purchase_category`:
     - `< 3000` $\to$ `Low`
     - `3000 - 5000` $\to$ `Medium`
     - `> 5000` $\to$ `High`

### Phase 8: JDBC Load into RDS MySQL
Loads the transformed DataFrame using Spark JDBC:
```python
transformed_df.write \
    .format("jdbc") \
    .option("url", jdbc_url) \
    .option("dbtable", "customers") \
    .option("user", rds_username) \
    .option("password", rds_password) \
    .option("driver", "com.mysql.cj.jdbc.Driver") \
    .mode("append") \
    .save()
```

### Phase 9: SQL Verification
Execute `python src/verify_data.py` to run verification queries:
* Total row count.
* Table preview.
* City-wise aggregations.
* Purchase category segmentation.

---

## 14. Expected Execution Output

When executing `python src/etl_pipeline.py`:

```text
===========================================================================
  AWS CLOUD DATA ENGINEERING - ASSIGNMENT 02 ETL PIPELINE
  Amazon S3  -->  Apache Spark  -->  Amazon RDS MySQL
===========================================================================
[*] Loaded MySQL JDBC Driver from: drivers/mysql-connector-j-8.3.0.jar

[1] Connecting to AWS/S3 (Region: eu-north-1, Bucket: cde-lab1-dhruv-upload-bucket)...
[2] Reading CSV from S3 (s3://cde-lab1-dhruv-upload-bucket/upload_csv2.csv)...
[+] Successfully fetched 'upload_csv2.csv' from S3 bucket 'cde-lab1-dhruv-upload-bucket'!
[3] Extracted records: 3

--- Extracted Data Preview (First 5 rows) ---
+-----+---+------+
|Name |Age|City  |
+-----+---+------+
|Rahul|20 |Pune  |
|Amit |21 |Mumbai|
|Sneha|20 |Nashik|
+-----+---+------+

--- Extracted Schema ---
root
 |-- Name: string (nullable = true)
 |-- Age: integer (nullable = true)
 |-- City: string (nullable = true)

[4] Applying transformations...
[5] Records after transformation: 3 (Duplicates removed: 0)

--- Transformed Data Preview ---
+-----------+-----+---+------+---------------+-----------------+
|customer_id|name |age|city  |purchase_amount|purchase_category|
+-----------+-----+---+------+---------------+-----------------+
|1          |Rahul|20 |Pune  |3000.0         |Medium           |
|2          |Amit |21 |Mumbai|3150.0         |Medium           |
|3          |Sneha|20 |Nashik|3000.0         |Medium           |
+-----------+-----+---+------+---------------+-----------------+

--- Transformed Schema ---
root
 |-- customer_id: integer (nullable = true)
 |-- name: string (nullable = true)
 |-- age: integer (nullable = false)
 |-- city: string (nullable = true)
 |-- purchase_amount: double (nullable = true)
 |-- purchase_category: string (nullable = false)

[6] Connecting to RDS MySQL instance at cde-mysql.c123.eu-north-1.rds.amazonaws.com:3306/etl_database...
[7] Loading data into 'customers' table via Spark JDBC...
[+] Successfully loaded 3 records into Amazon RDS MySQL table 'customers'!

===========================================================================
[8] ETL completed successfully
===========================================================================
```

---

## 15. Common Errors and Solutions

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| `AccessDenied on s3:GetObject` | IAM user lacks read policy on S3 bucket. | Attach `AmazonS3ReadOnlyAccess` or `s3:GetObject` policy to the IAM user. |
| `Communications link failure` | RDS security group blocks inbound port 3306. | In AWS RDS Security Group, add inbound rule for MySQL/Aurora (Port 3306) from `My IP`. |
| `No suitable driver found for jdbc:mysql` | MySQL JDBC Driver jar missing from Spark classpath. | Ensure `mysql-connector-j-8.3.0.jar` is in `drivers/` and configured in `.env`. |
| `Access denied for user 'admin'@'%'` | Incorrect RDS username or password. | Check and update `RDS_USERNAME` and `RDS_PASSWORD` in `.env`. |

---

## 16. Lab Demonstration / Screenshots Required

For lab submission, capture the following 10 screenshots:

1. **AWS CLI Authentication**: Terminal output showing `aws sts get-caller-identity`.
2. **S3 Bucket with CSV**: AWS Console S3 bucket `cde-lab1-dhruv-upload-bucket` showing `upload_csv2.csv`.
3. **Amazon RDS Instance**: AWS Console RDS showing MySQL instance status **Available** and Public Accessibility **Yes**.
4. **RDS Security Group**: Inbound rule showing TCP port 3306 open.
5. **Spark Project Structure**: IDE Explorer showing `src/`, `data/`, `drivers/`, `sql/`, `.env`, `README.md`.
6. **Spark Extraction Output**: Terminal log showing `[1] Connecting to AWS/S3`, `[2] Reading CSV`, `[3] Extracted records`.
7. **Transformation Output**: Terminal log showing `[4] Applying transformations` with transformed schema & preview.
8. **JDBC Load Execution**: Terminal log showing `[6] Connecting to RDS` and `[7] Loading data into customers table`.
9. **SQL Verification in RDS**: Terminal output of `python src/verify_data.py` or MySQL Workbench showing query results.
10. **Final Successful ETL Execution**: Complete pipeline terminal output ending with `[8] ETL completed successfully`.

---

## 17. Conclusion
This lab demonstrates a real-world cloud data engineering architecture. By combining **Amazon S3** for resilient raw data lake storage, **Apache Spark** for distributed in-memory data processing, and **Amazon RDS** for structured analytical querying, the pipeline provides high reliability, schema integrity, and automated cloud synchronization.
