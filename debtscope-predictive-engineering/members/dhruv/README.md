# Dhruv's Subsystem: Decision Engine & Backend Platform (Lead)

## 🎯 Scope of Work
- **Subsystem**: `backend/` & Core Decision Engine
- **Mathematical Formulations**: 5D Multi-Criteria Prioritization ($TR_{comp}$, $BI_{comp}$, $U_{comp}$, $PS_{final}$, ROI Index)
- **Architecture**: Asynchronous ASGI FastAPI, SQLAlchemy 2.0 ORM, Pydantic v2 schemas
- **Core Technologies**: FastAPI, Python 3.11+, SQLAlchemy, SQLite, Pydantic v2, Uvicorn

## 📂 Subsystem Modules
1. `scoring_formula.py`: 5-Dimensional mathematical scoring engine with configurable dimensional weights.
2. `quadrant_engine.py`: 4-Quadrant ROI Matrix categorization (Quick Wins, Strategic Refactors, Opportunistic, Deprioritized).
3. `prioritization_engine.py`: Full-stack bridge computing sorted, actionable priority debt items.
4. `api.py`: FastAPI async routing, schema contracts, and OpenAPI / Swagger documentation.
5. `SPEAKING_NOTES.md`: Script & "Why This vs Why Not That" defense for Review 2.
