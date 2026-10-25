# 🎯 DebtScope - Predictive Engineering Intelligence Platform

**DebtScope** is an enterprise-grade AI-powered codebase health and technical debt intelligence platform. It analyzes static code metrics, repository churn, test coverage, and architectural coupling to forecast refactoring debt, predict defect density, and optimize engineering velocity through machine learning.

---

## 🏗️ Architecture & Modules

The platform is organized into modular services:

- **`backend/`**: High-performance FastAPI server providing REST APIs for metric calculation, debt prioritization, risk quadrant mapping, and Google OAuth integration.
- **`frontend/`**: Interactive modern UI with real-time health dashboards, priority matrices, file intelligence breakdown, and trend analysis.
- **`ml_engine/`**: Machine learning models and training pipelines for technical debt regression, classification of high-risk components, and SHAP explainability.
- **`data_pipeline/`**: Extraction and processing pipelines for static analysis logs, AST parsing, and PySpark transformations.
- **`members/`**: Individual contributor modules, viva speaking notes, and specialized analysis logic.
- **`docs/`**: Comprehensive system specifications including API Contracts, Architecture Diagrams, Mathematical Formulas, ML Model Specifications, and Technical Viva Q&A.

---

## 🚀 Quick Start

### Backend (FastAPI)
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Or on Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (React / Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 📑 Detailed Documentation
- [Architecture Master](docs/ARCHITECTURE_MASTER.md)
- [API Contract](docs/API_CONTRACT.md)
- [ML Model Specification](docs/ML_MODEL_SPECIFICATION.md)
- [Mathematical Formulas](docs/MATHEMATICAL_FORMULA.md)
- [Technical Viva Q&A Master](docs/TECHNICAL_VIVA_QA_MASTER.md)
