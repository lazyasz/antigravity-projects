# Assignment No. 02 — ETL Pipeline Using Apache Spark
## Cloud Data Engineering Lab

---

## 1. Assignment Title
**Develop an ETL Pipeline Using Spark to Extract, Transform, and Load Data from Cloud Storage into a Cloud-Based Database.**

---

## 2. Objective
The objective of this assignment is to build and demonstrate an automated, enterprise-grade **Extract, Transform, and Load (ETL)** data pipeline using **Apache Spark (PySpark)**. The pipeline extracts raw customer datasets stored in **Amazon S3** cloud object storage, applies distributed data cleaning, deduplication, schema validation, and business attribute derivation in Spark memory, and loads the structured data into an **Amazon RDS (MySQL)** cloud relational database via **Spark JDBC**.

---

## 3. Architecture

```text
+-------------------------------------------------------+
|             Cloud Storage: Amazon S3                  |
|   Bucket: cde-lab1-dhruv-upload-bucket                |
|   Object: upload_csv2.csv (CSV dataset)               |
+---------------------------+---------------------------+
                            |
                            | [1] Extraction (Boto3 / PySpark CSV Reader)
                            v
+-------------------------------------------------------+
|             Apache Spark / PySpark 4.2.0              |
|   • Schema Enforcement & Null Handling                |
|   • Whitespace Cleaning & Case Normalization          |
|   • Deduplication (dropDuplicates)                    |
|   • Feature Derivation (purchase_category)            |
+---------------------------+---------------------------+
                            |
                            | [2] JDBC Load (com.mysql.cj.jdbc.Driver)
                            v
+-------------------------------------------------------+
|          Cloud Database: Amazon RDS MySQL             |
|   Instance: cde-mysql-db (db.t4g.micro)               |
|   Database: etl_database                              |
|   Target Table: customers                             |
+---------------------------+---------------------------+
                            |
                            | [3] Post-Load SQL Verification
                            v
+-------------------------------------------------------+
|            Amazon RDS MySQL Data Verification         |
|   • Row count validation (SELECT COUNT(*))            |
|   • Data preview & schema confirmation                |
|   • City aggregations & category segmentation         |
+-------------------------------------------------------+
```

---

## 4. Technologies & Services Used
* **Apache Spark / PySpark 4.2.0**: High-throughput distributed data transformation engine.
* **Amazon Web Services (AWS)**:
  * **Amazon S3**: Object storage holding raw CSV files (`cde-lab1-dhruv-upload-bucket`).
  * **Amazon RDS**: Managed relational database running MySQL Community Edition (`cde-mysql-db`).
  * **Amazon VPC & Security Groups**: Network firewall and routing (`vpc-04caa7c89ea538a89`, `rds-spark-sg`).
  * **AWS IAM & AWS CLI v2**: Identity and programmatic access (`upload-csv-user`).
* **MySQL Connector/J (8.3.0)**: Type-4 JDBC driver for Spark-to-MySQL data loading.
* **Python 3.13 / 3.14 & PyMySQL / SQLAlchemy**: Direct SQL execution and relational verification.
* **Java 17 (OpenJDK LTS)**: JVM runtime for Spark distributed computation.

---

## 5. Execution Steps
1. **Environment & Identity Check**: Authenticated via AWS CLI (`aws sts get-caller-identity`), verified S3 access, and validated Java 17 and PySpark runtime environments.
2. **Cloud Source Inspection**: Verified that the source dataset `upload_csv2.csv` is uploaded and active in the Amazon S3 bucket `cde-lab1-dhruv-upload-bucket`.
3. **Cloud Database Provisioning**: Verified Amazon RDS MySQL instance `cde-mysql-db` is running in `Available` state with public accessibility and port 3306 open.
4. **Spark Pipeline Launch**: Executed `python src/etl_pipeline.py` with MySQL JDBC jar loaded.
5. **Data Extraction (E)**: Extracted raw records from `s3://cde-lab1-dhruv-upload-bucket/upload_csv2.csv` into a PySpark DataFrame.
6. **Data Transformation (T)**:
   * Trimmed whitespace from text fields (`name`, `city`).
   * Checked and eliminated duplicate rows (`dropDuplicates()`).
   * Enforced strict datatypes (`IntegerType` for `age`, `DoubleType` for `purchase_amount`).
   * Imputed null values with default business rules.
   * Derived calculated business dimension `purchase_category` (`Low`, `Medium`, `High`).
   * Assigned surrogate primary key `customer_id`.
7. **Database Load (L)**: Batch-loaded the transformed DataFrame into Amazon RDS MySQL table `etl_database.customers` using Spark JDBC.
8. **Relational Verification**: Executed `python src/verify_data.py` to query Amazon RDS directly and confirm row counts, schema mapping, and analytics summaries.

---

## 6. Screenshot Evidence Index

| No. | Screenshot File | Description / Proof |
| :---: | :--- | :--- |
| **01** | `01_environment.png` | Shows AWS CLI authentication (`upload-csv-user`, Account: `256663926441`) and S3 bucket listing. |
| **02** | `02_source_data.png` | Shows AWS Console Amazon S3 bucket `cde-lab1-dhruv-upload-bucket` hosting `upload_csv2.csv`. |
| **03** | `03_aws_vpc_configuration.png` | Shows AWS Console Amazon VPC details (`vpc-04caa7c89ea538a89`) configured for database connectivity. |
| **04** | `04_aws_rds_database_instance.png` | Shows AWS Console Amazon RDS dashboard confirming `cde-mysql-db` status is **Available**. |
| **05** | `05_aws_rds_connectivity_security.png` | Shows AWS Console RDS endpoint (`cde-mysql-db...rds.amazonaws.com:3306`), security group, and Public Accessibility enabled. |
| **06** | `06_spark_etl_pipeline_command.png` | Shows the terminal command `python src/etl_pipeline.py` launching the PySpark ETL job. |
| **07** | `07_spark_extract_and_transform.png` | Shows Spark connecting to S3, extracting 3 records, previewing raw schema, and executing all data transformations. |
| **08** | `08_spark_jdbc_load_rds_success.png` | Shows the transformed schema, Spark JDBC connection to RDS MySQL, successful 3-record write, and `[8] ETL completed successfully`. |
| **09** | `09_rds_mysql_verification_command.png` | Shows the terminal command `python src/verify_data.py` initiating direct RDS validation. |
| **10** | `10_rds_mysql_database_verification.png` | Shows direct Amazon RDS MySQL query output validating 3 records loaded in table `customers` with aggregations. |
| **11** | `11_data_quality_audit_dashboard.png` | Shows the visual Enterprise Data Quality Dashboard (null imputation, deduplication, 100% completeness profile). |
| **12** | `12_business_insights_dashboard.png` | Shows the Executive Business Insights Dashboard with financial KPIs, city sales breakdown, and customer segmentation. |

---

## 7. Final Result
The end-to-end cloud ETL pipeline successfully extracted the raw CSV dataset from **Amazon S3**, processed and transformed the data inside the **Apache Spark** distributed engine, and loaded the finalized records into **Amazon RDS MySQL**. Direct post-load SQL queries confirmed 100% data fidelity and schema conformity between Spark and the cloud database.
