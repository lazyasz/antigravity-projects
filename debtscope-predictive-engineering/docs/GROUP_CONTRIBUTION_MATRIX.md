# Group Contribution Matrix & Deliverables Mapping

**Project Title**: Predictive Engineering Intelligence Platform for Technical Debt Prioritization  
**Academic Program**: Project-Based Learning (PBL) — 5th Semester  
**Team Structure**: 4 Members  

---

## 👥 Member Roles & Deliverables Overview

| Member | Assigned Subsystem | Core Responsibilities & Modules | Key Technologies & Frameworks | Primary Output Artifacts |
| :--- | :--- | :--- | :--- | :--- |
| **Member 1** | **Data Engineering & Big Data Pipeline** (`data_pipeline/`) | - Big Data Ingestion (11 Relational Entities)<br>- Medallion Architecture (Bronze/Silver/Gold)<br>- ETL Cleaning, Deduplication, & Imputation<br>- PySpark Distributed Transformations & Windowing<br>- Feature Engineering (Maintainability, Complexity) | Apache PySpark, Python, SQLite, Apache Parquet, GitHub REST API | `data/features/engineering_features.json`<br>`data/features/engineering_features.csv`<br>`data/features/engineering_features.parquet`<br>`docs/ARCHITECTURE_AND_BIG_DATA.md` |
| **Member 2** | **Machine Learning & Defect Analytics Engine** (`ml_engine/`) | - Historical Engineering Dataset Preprocessing<br>- Supervised Random Forest Risk Model (300 Trees)<br>- Multi-factor Defect Probability Scoring<br>- Hotspot Identification & R² Evaluation<br>- Feature Importance & Explainability Driver Ranking | Scikit-Learn, Pandas, NumPy, Matplotlib, Seaborn, Pickle | `ml_engine/models/rf_defect_model.pkl`<br>`ml_engine/src/predictor.py`<br>`ml_engine/src/explainability.py`<br>`docs/ML_MODEL_SPECIFICATION.md` |
| **Member 3 (Lead / Dhruv)** | **Core Decision Engine & Backend Platform** (`backend/`) | - 5D Mathematical Prioritization Decision Engine<br>- Business Impact & Release Proximity Integration<br>- Remediation Effort & ROI Quadrant Matrix<br>- FastAPI REST Platform & Pydantic v2 Contracts<br>- SQLAlchemy Relational Database & Full Stack Bridge | FastAPI, Pydantic v2, SQLAlchemy, SQLite, Uvicorn, Pytest | `backend/main.py`<br>`backend/services/priority_service.py`<br>`docs/MATHEMATICAL_FORMULA.md`<br>`docs/API_CONTRACT.md`<br>`docs/TECHNICAL_VIVA_QA_MASTER.md` |
| **Member 4** | **Executive Web Dashboard & Frontend** (`frontend/`) | - Modern Responsive Single Page Application<br>- KPI Health Cards & Metrics Overview<br>- Priority Matrix Chart & Defect Risk Visualizations<br>- Interactive Debt Log & File Intelligence Explorer<br>- AI Refactoring Copilot Shell Interface | React 19, Vite, TailwindCSS 4, Recharts, Lucide Icons, Axios | `frontend/src/App.jsx`<br>`frontend/src/pages/Dashboard.jsx`<br>`frontend/src/pages/Priorities.jsx`<br>`frontend/src/charts/PriorityMatrix.jsx`<br>`frontend/src/services/api.js` |

---

## 🔄 End-to-End Inter-Member Data Contract Flow

```
[ Member 1: PySpark Data Pipeline ]
       │
       │ Output: engineering_features.json (11 Relational Entities)
       ▼
[ Member 2: Random Forest ML Model ]
       │
       │ Output: Defect Probability (0-1.0), Predicted Technical Risk (0-100)
       ▼
[ Member 3: Decision Engine Backend ]
       │
       │ Combines: Static Metrics (M1) + ML Risk (M2) + Business Context (M3)
       │ Computes: 5D Priority Score, ROI Quadrant, Quick Wins, Sprint Plans
       │ Exposes: REST API at http://localhost:8000
       ▼
[ Member 4: React UI Dashboard ]
       │
       │ Fetches: Live telemetry via Axios from FastAPI
       │ Visualizes: KPI Cards, Interactive Priority Matrix, File Intelligence, Copilot
```

---

## 📋 Comprehensive Deliverables Checklist

- [x] **Member 1 Pipeline**: 14 passing unit tests, Medallion storage, PySpark window functions, and Parquet/JSON feature exports.
- [x] **Member 2 ML Engine**: Random Forest model with $R^2 = 0.9885$, cross-validated, feature importance explainability, and inference API.
- [x] **Member 3 Decision Platform**: 5-dimensional prioritization formula, FastAPI REST endpoints, SQLite ORM models, and Swagger UI.
- [x] **Member 4 React Dashboard**: 6 interactive pages (Dashboard, Technical Debt, Predictions, Priorities, Hotspots, File Intelligence, Copilot).
- [x] **Unified Integration**: 1-Click launcher (`run_project.bat` / `.ps1`), automated database seeder (`seed_integrated_pipeline.py`), and submission packager (`package_submission.py`).
