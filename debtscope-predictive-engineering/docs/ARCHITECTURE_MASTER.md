# Master System Architecture: Predictive Engineering Intelligence Platform

This document presents the complete end-to-end system architecture of the **Predictive Engineering Intelligence Platform for Technical Debt Prioritization**, uniting the contributions of all 4 members.

---

## 1. High-Level Architectural Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    1. DATA SOURCES & INGESTION (M1)                                |
|  - Controlled 11 Relational Entities (repositories, files, commits, diffs, PRs, issues, defects)    |
|  - Pluggable GitHub REST API Connector (Live Telemetry & Fallback Ingestion)                       |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                2. MEDALLION LAKEHOUSE PIPELINE (M1)                                |
|  - Bronze Tier (Raw Staging in JSON / SQLite)                                                      |
|  - Silver Tier (Data Cleaning, Primary Key Deduplication, Outlier Handling, Cleaning Audit Log)    |
|  - Distributed PySpark Engine (Window Functions for Developer Concentration & Recency, Joins)      |
|  - Feature Derivation (Maintainability Index, Defect Density, Composite Dependency Risk)           |
|  - Gold Tier Output: data/features/engineering_features.json                                       |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                             3. MACHINE LEARNING RISK ENGINE (M2)                                   |
|  - Supervised Random Forest Regressor (300 Estimators, Max Depth 12)                              |
|  - Multi-Feature Preprocessing (StandardScaler, OneHotEncoder, MinMaxScaler)                       |
|  - Predicts Defect Probability (0.0 to 1.0) & Technical Risk Score (0 to 100)                      |
|  - Generates Feature Importance Rankings & Hotspot Risk Tags                                       |
|  - Persisted Model Artifact: ml_engine/models/rf_defect_model.pkl                                  |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                         4. CORE DECISION INTELLIGENCE BACKEND (M3 / Lead)                          |
|  - Multi-Dimensional Relational Database (SQLAlchemy ORM on SQLite)                               |
|  - 5-Dimensional Decision Engine Formula:                                                          |
|       PS_base = 0.35 * TR + 0.30 * BI + 0.15 * U + 0.10 * MC + 0.10 * DA                           |
|       PS_final = clamp(0.85 * PS_base + 0.15 * (100 - Effort), 0, 100)                             |
|  - Remediation ROI Classification (Quick Wins, Strategic Refactoring, Deprioritized)               |
|  - FastAPI REST API Platform with Swagger & ReDoc (Port 8000)                                      |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                               5. EXECUTIVE REACT WEB DASHBOARD (M4)                                |
|  - Responsive SPA built with React 19 + Vite + TailwindCSS 4                                      |
|  - Executive Overview KPI Health Cards (Maintainability, Total Debt, Hotspots, Defect Probability)  |
|  - Interactive Recharts Visualizations (Priority Matrix Quadrant, Risk Distribution, Risk Trend)   |
|  - Deep-Dive File Intelligence View & AI Refactoring Copilot Shell                                 |
+----------------------------------------------------------------------------------------------------+
```

---

## 2. Subsystem Descriptions

### 2.1 Big Data Pipeline (`data_pipeline/` — Member 1)
- **Engine**: Apache PySpark with lazy execution DAG and Catalyst Optimizer.
- **Relational Model**: Normalizes 11 software engineering entities.
- **Transformations**: PySpark Window functions compute developer concentration (Bus Factor) and debt age recency.
- **Storage**: Exports in JSON, CSV, and Parquet columnar format.

### 2.2 Machine Learning Engine (`ml_engine/` — Member 2)
- **Algorithm**: Random Forest Regressor with 300 decision trees.
- **Target**: Continuous Composite Technical Risk ($0-100$).
- **Performance**: $R^2 = 0.9885$, $\text{MAE} = 1.0855$, $\text{RMSE} = 1.5786$.
- **Explainability**: Top risk drivers include `archetype_legacy_hotspot` (40.7%), `ownership_entropy` (15.0%), and `sprint_velocity_drag_pct` (13.9%).

### 2.3 Core Decision Intelligence Backend (`backend/` — Member 3)
- **Framework**: FastAPI (ASGI asynchronous loop) + SQLAlchemy ORM.
- **Prioritization Logic**: Bridges code health with business economics by incorporating customer impact, revenue tier, release proximity, and remediation effort.
- **Endpoints**: `/api/v1/priorities`, `/api/v1/metrics`, `/api/v1/predictions`, `/api/v1/hotspots`, `/api/v1/recommendations`, `/api/v1/files/{id}`.

### 2.4 Executive Dashboard (`frontend/` — Member 4)
- **Framework**: React 19, Vite, TailwindCSS 4, React Router DOM v7, Recharts, Lucide Icons.
- **Pages**: Dashboard, Technical Debt, Predictions, Priorities, Hotspots, File Intelligence, Copilot.
- **Resilience**: Connects to live FastAPI endpoints with automatic fallback to mock data.
