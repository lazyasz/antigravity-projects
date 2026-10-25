# DebtScope: Predictive Engineering Intelligence Platform

> **PBL Project Review 2 / Technical Evaluation**  
> An end-to-end Predictive Engineering Intelligence Platform uniting Data Engineering, Supervised Machine Learning, and Multi-Criteria Decision Mathematical Optimization to prioritize technical debt by Return-on-Investment (ROI).

---

## 🏛️ Master Architecture & Subsystem Mapping

```
DebtScope/
│
├── README.md                          # Master Project Documentation & Quickstart
│
├── members/                           # Dedicated Member Deliverables & Code Modules
│   ├── vaishnavi/                     # Member 1: Data Engineering & Lakehouse
│   │   ├── README.md
│   │   ├── data_engineering.py
│   │   ├── pyspark_transformations.py
│   │   ├── feature_engineering.py
│   │   └── SPEAKING_NOTES.md
│   │
│   ├── jiya/                          # Member 2: Machine Learning Risk Engine
│   │   ├── README.md
│   │   ├── preprocessing.py
│   │   ├── train_model.py
│   │   ├── evaluate_model.py
│   │   ├── explainability.py
│   │   └── SPEAKING_NOTES.md
│   │
│   ├── dhruv/                         # Member 3: Decision Engine & Backend Lead
│   │   ├── README.md
│   │   ├── prioritization_engine.py
│   │   ├── scoring_formula.py
│   │   ├── quadrant_engine.py
│   │   ├── api.py
│   │   └── SPEAKING_NOTES.md
│   │
│   └── adesh/                         # Member 4: Executive React Dashboard
│       ├── README.md
│       ├── dashboard.jsx
│       ├── priority_matrix.jsx
│       ├── file_intelligence.jsx
│       ├── api_service.js
│       └── SPEAKING_NOTES.md
│
├── data_pipeline/                     # Full Medallion PySpark Lakehouse Implementation
├── ml_engine/                         # Trained ML Models, Pipelines & Explainability
├── backend/                           # FastAPI Async Server, SQLAlchemy Models & Endpoints
├── frontend/                          # React 19 Executive Dashboard SPA
│
└── docs/                              # Technical Specifications & Defense Guides
    ├── ARCHITECTURE.md
    ├── PRESENTATION_MAPPING.md
    ├── MATHEMATICAL_FORMULA.md
    ├── ML_MODEL_SPECIFICATION.md
    └── TECHNICAL_VIVA_QA_MASTER.md
```

---

## 👥 4-Member Responsibility Matrix

| Member | Subsystem | Key Technologies | Primary Deliverables | Review 2 Presentation Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Vaishnavi** | **Data Engineering** (`members/vaishnavi/`) | Apache PySpark, Parquet, SQLite, Python | 11 Relational Entities, Medallion Lakehouse, Bus Factor Windowing | **Slides 3 & 4**: Architecture & Ingestion |
| **Jiya** | **Machine Learning** (`members/jiya/`) | Scikit-Learn, NumPy, Pandas | Supervised Random Forest ($R^2=0.9885$), MDI Explainability | **Slides 5 & 9**: ML Models & Benchmarks |
| **Dhruv (Lead)** | **Decision Engine & Backend** (`members/dhruv/`) | FastAPI, SQLAlchemy, Pydantic v2 | 5D Mathematical Formula, ROI Quadrants, REST APIs | **Slides 1, 2, 6 & 7**: 5D Logic & Backend |
| **Adesh** | **Executive Dashboard** (`members/adesh/`) | React 19, TailwindCSS 4, Recharts | Interactive KPI Cards, 2D Scatterplot Matrix, Copilot Shell | **Slides 8 & 10**: UI Demo & Roadmap |

---

## 🚀 Quickstart & Demonstration

### 1. Run Backend Server (FastAPI)
```bash
cd backend
python -m uvicorn main:app --reload --port 8000
```
- Interactive API Docs: `http://localhost:8000/docs`

### 2. Run Executive Dashboard (React 19)
```bash
cd frontend
npm run dev
```
- Dashboard URL: `http://localhost:5173`
