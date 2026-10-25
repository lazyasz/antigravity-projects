# Presentation Mapping: 10-Slide Deck to Team Code Modules

This document maps each slide of the Review 2 presentation deck directly to team members and their corresponding code files in `members/`.

---

## 🗺️ Slide-to-Code Mapping Table

| Slide # | Slide Title | Presenter | Primary Code File in `members/` | Key Concepts & Deliverables |
| :--- | :--- | :--- | :--- | :--- |
| **Slide 1** | **Title & Executive Summary** | **Dhruv (Lead)** | `members/dhruv/README.md` | Problem vision, 4 integrated pillars, high-level KPIs ($R^2=0.9885$). |
| **Slide 2** | **Problem Statement & Literature Gap** | **Dhruv (Lead)** | `members/dhruv/scoring_formula.py` | Limitations of SonarQube, context-blindness, business-tech disconnect. |
| **Slide 3** | **End-to-End System Architecture** | **Vaishnavi** | `docs/ARCHITECTURE.md` | 4-Tier pipeline diagram, inter-subsystem dataflow. |
| **Slide 4** | **Data Engineering & PySpark Lakehouse** | **Vaishnavi** | `members/vaishnavi/data_engineering.py`<br>`members/vaishnavi/pyspark_transformations.py` | Medallion Bronze/Silver/Gold storage, 11 entities, PySpark window functions. |
| **Slide 5** | **ML Defect Prediction & Risk Engine** | **Jiya** | `members/jiya/train_model.py`<br>`members/jiya/explainability.py` | 300-tree Random Forest Regressor, MDI feature importance rankings. |
| **Slide 6** | **5D Prioritization Mathematical Formula** | **Dhruv (Lead)** | `members/dhruv/scoring_formula.py`<br>`members/dhruv/quadrant_engine.py` | Multi-criteria scoring: $TR_{comp}$, $BI_{comp}$, $U_{comp}$, $PS_{final}$, ROI Quadrants. |
| **Slide 7** | **FastAPI Backend & Relational Schema** | **Dhruv (Lead)** | `members/dhruv/api.py`<br>`members/dhruv/prioritization_engine.py` | SQLAlchemy ORM, Pydantic v2 validation, OpenAPI REST endpoints. |
| **Slide 8** | **Executive Dashboard & Priority Matrix UI** | **Adesh** | `members/adesh/dashboard.jsx`<br>`members/adesh/priority_matrix.jsx` | React 19, TailwindCSS 4, Recharts ROI scatterplot, AI Copilot shell. |
| **Slide 9** | **Experimental Results & Benchmarks** | **Jiya** | `members/jiya/evaluate_model.py` | $R^2 = 0.9885$, 5-Fold CV $0.9849$, Apache 33-system dataset validation. |
| **Slide 10** | **Team Contributions & Review 3 Roadmap** | **Adesh** | `members/adesh/README.md`<br>`docs/PRESENTATION_MAPPING.md` | 4-member contribution matrix, live demo status, GitHub webhooks & LLM patches. |
