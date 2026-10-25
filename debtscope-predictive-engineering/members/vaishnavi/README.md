# Vaishnavi's Subsystem: Data Engineering & Lakehouse Pipeline

## 🎯 Scope of Work
- **Subsystem**: `data_pipeline/`
- **Entities Handled**: 11 Relational Entities (Repositories, Files, Commits, Changes, Developers, Reviews, PRs, Jira Issues, Refactorings, Sonar Analyses, Incidents)
- **Core Technologies**: Apache PySpark, Python, SQLite, Apache Parquet, JSON, GitHub REST API

## 📂 Subsystem Modules
1. `data_engineering.py`: Ingestion & Medallion tier data flow (Bronze -> Silver -> Gold).
2. `pyspark_transformations.py`: PySpark windowed calculations for author ownership entropy and 90-day churn recency.
3. `feature_engineering.py`: High-order metrics (Maintainability Index, Defect Density, Dependency Risk).
4. `SPEAKING_NOTES.md`: Script & "Why This vs Why Not That" defense for Review 2.
