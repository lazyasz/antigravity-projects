# Review 2 Speaking Notes & Viva Defense: Vaishnavi (Member 1)

**Role**: Data Engineering & Medallion Lakehouse Architect  
**Subsystem**: `data_pipeline/` & Data Lakehouse  
**Assigned Slides**: Slides 3 & 4 (Master Architecture & Data Engineering)

---

## 🎙️ 2-Minute Presentation Script
"Good morning, panel. I am responsible for the Data Engineering and Lakehouse subsystem of DebtScope.

In enterprise codebases, technical debt data is fragmented across version control logs, issue trackers, and static analyzers. To handle this at scale, I designed a multi-tier Medallion Lakehouse ingesting **11 normalized relational entities**—including repositories, files, commits, diff changes, developers, PRs, and Jira defect logs.

In the **Bronze Tier**, raw multi-source telemetry is staged. In the **Silver Tier**, we perform schema validation, primary key deduplication, imputation of missing code metrics, and generate an automated cleaning audit trail.

In the **Gold Tier**, we use **Apache PySpark with distributed window functions** to derive high-order engineering features—such as developer ownership entropy (the Bus Factor) and 90-day rolling commit churn recency. The final engineered feature store is exported in **Apache Parquet, JSON, and CSV** formats, feeding directly into Member 2's ML engine and Member 3's backend."

---

## 🥊 Examiner "Why This vs. Why Not That?" Justification Cheat Sheet

### Q1: Why did you use Apache PySpark instead of Pandas?
- **Answer**: Pandas is single-threaded and memory-bound to a single machine ($O(N)$ RAM), which causes Out-of-Memory (OOM) crashes when parsing large repository histories with millions of commit diffs. PySpark distributes transformations across worker partitions, optimizes execution DAGs using the **Catalyst Optimizer**, and performs partitioned window functions across millions of commit diffs with $O(1)$ memory overhead.

### Q2: Why use a 3-tier Medallion Lakehouse (Bronze -> Silver -> Gold) instead of a simple 1-step ETL script?
- **Answer**: Medallion provides **data lineage, idempotency, and non-destructive reprocessing**. Bronze preserves immutable raw telemetry. If our business metrics or feature formulas change later, we recompute features without re-querying external GitHub/Jira APIs. Silver guarantees schema validity with a `cleaning_audit.json` log, and Gold serves standardized feature contracts in Parquet format.

### Q3: Why export in Apache Parquet rather than plain CSV?
- **Answer**: Parquet is a columnar binary format with snappy compression, reducing disk storage by 75% and providing 10x faster I/O throughput during ML feature ingestion, while strictly preserving data types without floating-point precision loss.
