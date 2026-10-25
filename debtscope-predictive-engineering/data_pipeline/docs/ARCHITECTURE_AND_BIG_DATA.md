# Big Data Architecture & Distributed Processing Guide

This document details the Big Data architecture, distributed computation rationale, and scaling design of the **Predictive Engineering Intelligence Platform**.

---

## 1. The 4 Vs of Big Data in Software Engineering Intelligence

Software engineering analytics exhibits all four hallmarks of Big Data problems:

```
+-----------------------------------------------------------------------------------+
|                            THE 4 Vs OF CODEBASE ANALYTICS                         |
+-----------------------------------------------------------------------------------+
|  1. VOLUME    | Enterprise monorepos (e.g. Google, Linux, Kubernetes) contain      |
|               | tens of millions of commits, billions of AST tokens, and terabytes|
|               | of CI/CD build logs.                                              |
|  2. VELOCITY  | Continuous integration pipelines trigger thousands of commits, PR |
|               | checks, test runs, and deployments every hour.                     |
|  3. VARIETY   | Mix of structured SQL tables, semi-structured JSON payloads,      |
|               | unstructured git diffs, AST syntax trees, and telemetry traces.   |
|  4. VERACITY  | Noisy author names, automated bot commits, malformed tickets,     |
|               | missing effort estimates, and flaky test logs require rigorous ETL.|
+-----------------------------------------------------------------------------------+
```

---

## 2. Multi-Tier Medallion Data Architecture

The pipeline implements the industry-standard **Lakehouse Medallion Architecture**:

```
+-------------------+        +----------------------+        +------------------------+
|   BRONZE LAYER    |  ETL   |     SILVER LAYER     | Spark  |       GOLD LAYER       |
|    (Raw Tier)     | =====> |   (Sanitized Tier)   | =====> |    (Feature Store)     |
|                   |        |                      |        |                        |
| - 11 Raw Entities |        | - Schema Validated   |        | - Standard ML Contract |
| - JSON / API logs |        | - Deduplicated       |        | - Parquet / CSV / JSON |
| - Unaltered State |        | - Imputed Nulls      |        | - SQLite Query Store   |
+-------------------+        +----------------------+        +------------------------+
```

1. **Bronze (Raw Ingestion)**: Immutable records preserved in `data/raw/` with unique batch run IDs.
2. **Silver (Cleaned & Validated)**: Staged in `data/processed/` with strict data types, deduplicated keys, and outlier boundaries.
3. **Gold (Curated Feature Store)**: Stored in `data/features/` in columnar Parquet, CSV, and record JSON formats ready for ML training and dashboard consumption.

---

## 3. Distributed PySpark Processing Internals

### 3.1 Why PySpark Over In-Memory Pandas?

| Capability | Single-Node Pandas | Distributed PySpark |
| :--- | :--- | :--- |
| **Memory Limit** | Bound to single machine RAM; crashes on OOM | Spills to disk, scales across hundreds of worker nodes |
| **Execution Model** | Eager execution (evaluates immediately step-by-step) | Lazy evaluation (builds Directed Acyclic Graph - DAG) |
| **Optimization** | Minimal internal execution optimization | **Catalyst Optimizer** performs predicate pushdown & join reordering |
| **Fault Tolerance** | None; script crash loses all progress | RDD lineage graphs enable automatic task recomputation |
| **Window Analytics** | Slow single-threaded iterative loops | Parallel distributed partition windows across cluster cores |

### 3.2 Catalyst Query Optimizer & Physical Plan
When PySpark executes our transformations:
1. **Analysis**: Resolves table column references and types against `StructType` schemas.
2. **Logical Planning**: Generates logical operators (Filter, Project, Join, Aggregate).
3. **Optimized Logical Plan**: Pushes filters down directly to the data source so unneeded records are never read into memory.
4. **Physical Planning**: Chooses optimal distributed join strategies (`BroadcastHashJoin` for small reference tables like `business_context`, `SortMergeJoin` or `ShuffleHashJoin` for large tables like `commit_file_changes`).
5. **Code Generation**: Compiles Java bytecode via Tungsten engine for cache-conscious execution.

### 3.3 PySpark Window Operations
For complex metrics like **Developer Concentration**:
- Standard SQL requires expensive self-joins and subqueries.
- PySpark uses `Window.partitionBy("file_id").orderBy(col("author_commit_count").desc())`:
  - Partitions data physically across worker executors by `file_id`.
  - Executes in-memory row numbering (`row_number()`) in parallel without cross-node network shuffles.

---

## 4. Scaling to Millions of Engineering Records

To scale this pipeline from MVP to enterprise repositories containing $10^7$ commits and $10^5$ files:

### 1. Partitioning Strategy
- **Commits & File Changes**: Partition by `(repo_id, commit_year_month)`.
- **Issues & Defects**: Partition by `(repo_id, status)`.
- Prevents full-table scans by restricting Spark queries to specific time and repository partitions.

### 2. Storage Format: Apache Parquet & Delta Lake
- Columnar layout stores data by column rather than row.
- Highly efficient Snappy / ZSTD dictionary encoding compresses storage by $70\%-85\%$.
- Statistics embedded in Parquet footers (`min`/`max` per row group) allow Spark to skip non-matching row groups entirely (**Data Skipping**).

### 3. Cluster Infrastructure
- **Compute**: Deploy on Apache Spark on Kubernetes, AWS EMR, or Databricks.
- **Resource Sizing**: Dynamic executor allocation scaling from 2 to 64 nodes based on pending shuffle stages.
- **Object Storage**: AWS S3, Google Cloud Storage, or MinIO backend.

### 4. Real-Time Streaming Ingestion
- For continuous engineering intelligence, replace batch polling with an **Apache Kafka** event bus:
  - GitHub / GitLab webhooks emit commit, PR, and review events to Kafka topics (`git.events`).
  - **Spark Structured Streaming** micro-batches consume from Kafka and update the feature store incrementally with low latency.
