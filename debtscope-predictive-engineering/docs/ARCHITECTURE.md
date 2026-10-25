# DebtScope: Master System Architecture

This document specifies the end-to-end architecture of **DebtScope: Predictive Engineering Intelligence Platform for Technical Debt Prioritization**.

---

## 🏗️ High-Level System Architecture Diagram

```
+----------------------------------------------------------------------------------------------------+
|                                    1. DATA SOURCES & INGESTION (Vaishnavi)                         |
|  - Controlled 11 Relational Entities (repositories, files, commits, diffs, PRs, issues, defects)    |
|  - Pluggable GitHub REST API Connector (Live Telemetry & Fallback Ingestion)                       |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                                2. MEDALLION LAKEHOUSE PIPELINE (Vaishnavi)                         |
|  - Bronze Tier (Raw Staging in JSON / SQLite)                                                      |
|  - Silver Tier (Data Cleaning, Primary Key Deduplication, Outlier Handling, Cleaning Audit Log)    |
|  - Distributed PySpark Engine (Window Functions for Developer Concentration & Recency, Joins)      |
|  - Feature Derivation (Maintainability Index, Defect Density, Composite Dependency Risk)           |
|  - Gold Tier Output: data/features/engineering_features.json & Parquet                             |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                             3. MACHINE LEARNING RISK ENGINE (Jiya)                                 |
|  - Supervised Random Forest Regressor (300 Estimators, Max Depth 12)                              |
|  - Multi-Feature Preprocessing (StandardScaler, OneHotEncoder)                                     |
|  - Predicts Defect Probability (0.0 to 1.0) & Technical Risk Score (0 to 100) | R² = 0.9885         |
|  - Generates Feature Importance Rankings & Hotspot Risk Tags via MDI                               |
|  - Persisted Model Artifact: ml_engine/models/rf_defect_model.pkl                                  |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                         4. CORE DECISION INTELLIGENCE BACKEND (Dhruv - Lead)                       |
|  - Multi-Dimensional Relational Database (SQLAlchemy ORM on SQLite)                               |
|  - 5-Dimensional Decision Engine Formula:                                                          |
|       PS_base = 0.35 * TR + 0.30 * BI + 0.15 * U + 0.10 * MC + 0.10 * DA                           |
|       PS_final = clamp(0.85 * PS_base + 0.15 * (100 - Effort), 0, 100)                             |
|       ROI_Score = (PS_base / max(15, Effort)) * 100                                                |
|  - Remediation ROI Classification (Quick Wins, Strategic Refactoring, Opportunistic, Backlog)      |
|  - FastAPI REST API Platform with Swagger & ReDoc (Port 8000)                                      |
+-------------------------------------------------+--------------------------------------------------+
                                                  |
                                                  v
+----------------------------------------------------------------------------------------------------+
|                               5. EXECUTIVE REACT WEB DASHBOARD (Adesh)                             |
|  - Responsive SPA built with React 19 + Vite + TailwindCSS 4                                      |
|  - Executive Overview KPI Health Cards (Maintainability, Total Debt, Hotspots, Defect Probability)  |
|  - Interactive Recharts Visualizations (Priority Matrix Quadrant, Risk Distribution, Risk Trend)   |
|  - Deep-Dive File Intelligence View & AI Refactoring Copilot Shell                                 |
+----------------------------------------------------------------------------------------------------+
```

---

## 🔄 Subsystem Specifications

### 1. Data Engineering Pipeline (`members/vaishnavi/` & `data_pipeline/`)
- **Engine**: Apache PySpark with lazy DAG physical execution and Catalyst Optimizer.
- **Relational Model**: Normalizes 11 software engineering entities.
- **Transformations**: PySpark Window functions compute developer concentration (Bus Factor) and debt age recency.
- **Storage**: Exports in JSON, CSV, and Parquet columnar format.

### 2. Machine Learning Engine (`members/jiya/` & `ml_engine/`)
- **Algorithm**: Random Forest Regressor with 300 decision trees.
- **Target**: Continuous Composite Technical Risk ($0-100$).
- **Performance**: $R^2 = 0.9885$, $\text{MAE} = 1.0855$, $\text{RMSE} = 1.5786$.
- **Explainability**: Top risk drivers include `archetype_legacy_hotspot` (40.7%), `ownership_entropy` (15.0%), and `sprint_velocity_drag_pct` (13.9%).

### 3. Core Decision Intelligence Backend (`members/dhruv/` & `backend/`)
- **Framework**: FastAPI (ASGI asynchronous loop) + SQLAlchemy ORM.
- **Prioritization Logic**: Bridges code health with business economics by incorporating customer impact, revenue tier, release proximity, and remediation effort.
- **Endpoints**: `/api/v1/priorities`, `/api/v1/metrics`, `/api/v1/predictions`, `/api/v1/hotspots`, `/api/v1/recommendations`.

### 4. Executive Dashboard (`members/adesh/` & `frontend/`)
- **Framework**: React 19, Vite, TailwindCSS 4, Recharts, Lucide Icons.
- **Views**: Dashboard, Technical Debt, Predictions, Priorities, Hotspots, File Intelligence, Copilot.
- **Resilience**: Connects to live FastAPI endpoints with automatic fallback to mock data.
