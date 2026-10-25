# Technical Debt Intelligence API

A production-ready FastAPI backend and architecture documentation for predicting, quantifying, and prioritizing technical debt and architectural risk across software repositories.

---

## 🏛️ Architecture & Documentation

Full architectural specifications are included in the [`docs/`](./docs) directory:
- [API Contract](./docs/API_CONTRACT.md)
- [System Architecture](./docs/ARCHITECTURE.md)
- [Mathematical Formulas & Risk Scoring](./docs/MATHEMATICAL_FORMULA.md)
- [Technical Interview / Viva Preparation Guide](./docs/TECHNICAL_ROUND_PREP.md)

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
pip install -r backend/requirements.txt
```

### 2. Configure Environment
```bash
cp backend/.env.example backend/.env
```

### 3. Run the Server
```bash
python run_server.py
```
API Documentation will be available at `http://127.0.0.1:8000/docs`.
