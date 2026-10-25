# Technical Evaluation Round (Viva) Q&A Guide

Comprehensive, technically rigorous answers for all evaluation questions regarding the Data Engineering and Big Data Pipeline for the **Predictive Engineering Intelligence Platform**.

---

### Q1: Why are we using PySpark instead of only Pandas?
**Answer:**
Pandas is designed for single-node in-memory processing. It loads all DataFrames into the driver's local RAM and relies on single-threaded execution for most transformations. When processing software engineering datasets from large repositories (e.g. millions of commits, granular file diffs, AST tokens), Pandas faces severe limitations:
1. **Out-of-Memory (OOM) Crashes:** When dataset size exceeds available RAM, Pandas crashes immediately. PySpark automatically spills intermediate partitions to disk when memory limits are reached.
2. **Lack of Horizontal Scalability:** Pandas cannot scale across a cluster of machines. PySpark distributes DataFrame partitions across multiple worker nodes.
3. **Execution Plan Optimization:** Pandas evaluates operations eagerly (e.g. filtering after loading the entire file). PySpark employs **lazy evaluation** and the **Catalyst Optimizer**, which optimizes execution plans by reordering operations, pushing filters down to the storage layer, and generating efficient JVM bytecode.
4. **Fault Tolerance:** PySpark preserves RDD lineage graphs. If an executor node crashes during a shuffle stage, PySpark recomputes only the lost partition rather than restarting the entire job.

---

### Q2: What makes this a Big Data pipeline?
**Answer:**
This pipeline satisfies the classical **4 Vs of Big Data**:
1. **Volume:** Large enterprise codebases generate tens of millions of commit changes, millions of lines of diff logs, and massive static analysis reports.
2. **Velocity:** In continuous integration and deployment (CI/CD) environments, engineering data streams continuously via webhooks with every pull request, build, and test run.
3. **Variety:** The pipeline ingests diverse data formats: relational tables (developers, releases), semi-structured JSON trees (AST analysis, GitHub API payloads, issue logs), and unstructured text (commit messages, pull request review discussions).
4. **Veracity:** Raw engineering data is notoriously noisy, containing duplicate commits, bot-generated patches, missing effort estimates, and conflicting timestamps that demand a multi-stage validation and cleaning architecture.

---

### Q3: How does the ETL pipeline work?
**Answer:**
The ETL pipeline follows a Medallion architecture:
1. **Extraction / Ingestion:** The `IngestionEngine` verifies raw file availability across 11 entities, attaches a unique batch ID, and logs timestamps. If raw files are absent, it initializes controlled datasets.
2. **Transform / Cleaning:** The `DataCleaningPipeline` validates schemas, sanitizes negative or out-of-range metrics (e.g. negative LOC or churn), deduplicates primary keys (commit hashes, file-change pairs), and deterministically imputes missing fields.
3. **Distributed Processing:** The `SparkDataProcessor` loads cleaned records into strongly typed PySpark DataFrames with explicit `StructType` schemas, executes distributed window functions for developer concentration and debt age, performs multi-table relational joins, and computes aggregations.
4. **Feature Engineering:** Computes composite metrics (Maintainability Index, Defect Frequency, Business Impact, Estimated Remediation Effort).
5. **Loading / Export:** Stores finalized datasets in `data/features/` across JSON, CSV, and Parquet formats, and logs run metadata into an SQLite transactional store.

---

### Q4: How are missing values and dirty records handled?
**Answer:**
We employ deterministic, domain-specific imputation rather than arbitrary dropping:
- **Author Information:** Missing commit authors are imputed with `"unknown_contributor"`.
- **Issue Severity:** Unspecified issue severities are defaulted to `"MEDIUM"`.
- **Remediation Effort:** Missing effort hours are imputed based on the ticket's severity: `CRITICAL -> 32.0h`, `HIGH -> 20.0h`, `MEDIUM -> 10.0h`, `LOW -> 4.0h`.
- **Negative Metrics:** Outlier negative additions or lines of code are sanitized using absolute value bounds.
- **Future Timestamps:** Commit timestamps beyond the current UTC time are clamped to the current timestamp.
- **Deduplication:** Primary key sets (commit hashes, file paths, issue IDs) are tracked during ETL, filtering duplicate records before PySpark DataFrame loading. Every cleaning operation is logged in `cleaning_audit.json`.

---

### Q5: How is Code Churn calculated?
**Answer:**
Code Churn represents the total code volatility of a file or module over time. It is calculated by summing all line additions and line deletions across all commits modifying that file:
$$\text{Code Churn}(f) = \sum_{c \in \text{Commits}(f)} \left( \text{additions}(c, f) + \text{deletions}(c, f) \right)$$
In PySpark, this is executed as a distributed `groupBy("file_id")` with `_sum("churn")`.

---

### Q6: How is Change Frequency calculated?
**Answer:**
Change Frequency measures the number of discrete modification events touching a file over the observation period:
$$\text{Change Frequency}(f) = |\text{CommitEvents}(f)|$$
While code churn measures the volume of altered lines, change frequency measures temporal revision frequency. High change frequency combined with high churn strongly indicates unstable, bug-prone modules.

---

### Q7: How is Developer Concentration calculated?
**Answer:**
Developer Concentration measures knowledge centralization ("Bus Factor") on a file. It is the proportion of total commits authored by the dominant contributor:
$$\text{Developer Concentration}(f) = \frac{\text{Commits by Top Author}(f)}{\text{Total Commits}(f)}$$
In PySpark, we implement this using a Window function partitioned by `file_id` and ordered by `author_commit_count` descending, extracting the top contributor with `row_number() == 1`, and dividing by total file commits. A concentration near `1.0` signals a high-risk knowledge silo.

---

### Q8: How would this pipeline scale to millions of engineering records?
**Answer:**
To scale to enterprise dimensions:
1. **Cluster Execution:** Transition from local PySpark to an Apache Spark cluster running on Kubernetes, AWS EMR, or Databricks with dynamic executor allocation.
2. **Data Partitioning:** Partition commit logs by `(repo_id, year, month)` and files by `repo_id`. This enables partition pruning, skipping irrelevant data during queries.
3. **Columnar Parquet & Delta Lake:** Replace JSON staging with Delta Lake on object storage (S3/GCS), enabling ACID transactions, Parquet dictionary compression, and footer-based data skipping.
4. **Broadcast Joins:** Use PySpark's `broadcast()` hint for small reference tables (e.g. `business_context` and `repositories`), eliminating expensive shuffle operations across the cluster.
5. **Streaming Ingestion:** Deploy Apache Kafka to ingest commit and CI/CD webhooks in real time, processed incrementally via Spark Structured Streaming.

---

### Q9: What is the difference between structured and semi-structured engineering data?
**Answer:**
- **Structured Data:** Adheres to a strict tabular schema with fixed columns and relational keys. Examples: relational developer tables, release version logs, and bug defect counts.
- **Semi-Structured Data:** Does not conform to rigid table schemas but contains internal hierarchy, tags, and markers. Examples: Abstract Syntax Trees (ASTs) generated by language parsers, GitHub REST API JSON payloads, and CI/CD pipeline step output logs.
In our pipeline, semi-structured JSON inputs are parsed and enforced into strongly-typed `StructType` schemas in PySpark to ensure consistent relational operations.

---

### Q10: How could GitHub, Jira, and CI/CD eventually become additional sources?
**Answer:**
The pipeline is designed with a pluggable extraction architecture:
- **GitHub Ingestor:** Connects to GitHub's REST / GraphQL APIs to extract commit histories, pull requests, code reviews, and Git diffs.
- **Jira / Linear Connector:** Pulls sprint tickets, story points, bug fix velocity, and historical time-to-resolution into the `issues` and `defects` tables.
- **CI/CD Connector (GitHub Actions / Jenkins):** Ingests build logs, test failure rates, code coverage reports, and deployment rollback telemetry into the `releases` and `defects` tables.

---

### Q11: What are the limitations and assumptions of our controlled dataset?
**Answer:**
1. **Controlled Scope:** The dataset simulates 4 representative repositories and 11 core modules across different languages (Python, Go) and business tiers to provide a deterministic, verifiable benchmark for technical evaluation.
2. **Discrete Time Windows:** Commits and tickets are modeled over a fixed 6-month historical window.
3. **Static Analysis Heuristics:** Maintainability and cognitive complexity scores represent standardized approximations based on McCabe and Halstead literature rather than live language compiler AST walks.
4. **Business Context Modeling:** Business criticality and revenue impact are modeled from domain product specifications. In production, these would synchronize with enterprise ERP or product management systems.
