# Master Technical Viva & Interview Preparation Guide (All 4 Members)

This guide covers all key technical questions across the 4 member components for final project evaluation, vivas, and technical defense.

---

## 🏛️ General System Questions

### Q1: What problem does this platform solve?
**Answer**: Traditional static analysis tools (e.g. SonarQube) generate unprioritized lists of thousands of code smells without understanding business context or future defect probability. Our platform combines **Big Data ETL (M1)**, **ML Defect Prediction (M2)**, and a **5-Dimensional Decision Engine (M3)** to prioritize refactoring by return-on-investment (ROI), which is visualized in an interactive **Executive Dashboard (M4)**.

---

## 📊 Member 1 Questions (Data Engineering & PySpark)

### Q2: Why PySpark instead of pure Pandas?
**Answer**:
1. **Distributed Computing & Scalability**: Pandas is single-threaded and memory-bound to a single machine ($O(N)$ memory). PySpark distributes transformations across worker nodes using Resilient Distributed Datasets (RDDs) and DataFrames.
2. **Lazy Evaluation & Catalyst Optimizer**: PySpark builds an execution DAG and optimizes queries (predicate pushdown, column pruning) before executing physical plans.
3. **Complex Window Functions**: PySpark efficiently partitions commits by author and file to compute developer ownership concentration and debt age across millions of records.

### Q3: Explain the Medallion Architecture used.
**Answer**:
- **Bronze (Raw)**: Ingests 11 raw entity datasets and stores them in `data/raw/` and SQLite.
- **Silver (Processed)**: Cleans data, deduplicates primary keys, handles outliers, imputes missing values, and logs an audit trail (`cleaning_audit.json`).
- **Gold (Features)**: Generates high-value aggregated feature contracts in JSON, CSV, and Parquet columnar formats.

---

## 🤖 Member 2 Questions (Machine Learning & Predictive Modeling)

### Q4: Why did we choose Random Forest Regressor?
**Answer**:
1. **Handles Non-Linear Engineering Relationships**: Code churn and cyclomatic complexity interact non-linearly with defect risk; decision trees capture these non-linear thresholds naturally.
2. **Resilience to Overfitting**: By bagging 300 decision trees with feature subsampling (`max_features="sqrt"` / `max_depth=12`), Random Forest achieves superior generalization ($R^2 = 0.9885$, 5-fold CV $R^2 = 0.9849$).
3. **Built-in Feature Importance**: Provides Gini / MDI importance scores to explain why a component is high risk.

### Q5: How is Technical Risk calculated as the training target?
**Answer**: We compute a weighted composite score across 15 normalized metrics (Cyclomatic Complexity: 8%, Cognitive Complexity: 7%, Code Smells: 8%, Security Hotspots: 10%, Outdated Dependencies: 7%, Production Incidents: 10%, etc.).

---

## ⚙️ Member 3 Questions (Decision Engine & Backend Lead)

### Q6: How does the 5-Dimensional Prioritization Formula work?
**Answer**:
$$PS_{base} = 0.35 \cdot TR_{comp} + 0.30 \cdot BI_{comp} + 0.15 \cdot U_{comp} + 0.10 \cdot \text{Maintenance Cost} + 0.10 \cdot \text{Debt Age}$$
Where:
- $TR_{comp} = 0.50 \cdot TR_{static} + 0.50 \cdot TR_{ml}$ (Static metrics from M1 + ML defect predictions from M2)
- $BI_{comp} = 0.50 \cdot BC + 0.35 \cdot CI + 0.15 \cdot MC$ (Business Criticality + Customer Impact + Module Criticality)
- $U_{comp} = 0.60 \cdot \text{Release Proximity} + 0.40 \cdot \text{Sprint Urgency}$

Finally, we factor in **Remediation Effort**:
$$PS_{final} = \text{clamp}\Big( 0.85 \cdot PS_{base} + 0.15 \cdot (100.0 - Effort), 0.0, 100.0 \Big)$$

### Q7: Why did you choose FastAPI over Flask or Django?
**Answer**:
1. **Asynchronous Concurrency**: Built on Starlette & ASGI with native `asyncio` event loop.
2. **Pydantic v2 Type Safety**: Data parsing and schema validation are powered by Rust (`pydantic-core`), providing 5–15x speedup and automatic OpenAPI / Swagger generation.
3. **Dependency Injection**: `Depends(get_db)` manages database session lifecycles with automatic transactional rollback.

---

## 💻 Member 4 Questions (Frontend & React Architecture)

### Q8: How does the Frontend communicate with the Backend?
**Answer**:
The React 19 SPA uses an Axios client layer in `src/services/api.js` configured with `baseURL = http://localhost:8000`. If the backend is running, it queries the live FastAPI endpoints (`/api/priorities`, `/api/metrics`, `/api/predictions`). If the backend is offline, it gracefully falls back to `mockApi.js` to ensure the interface never crashes during client-side demonstrations.

### Q9: What is the purpose of the Priority Matrix Chart?
**Answer**: The Priority Matrix plots **Business Value / Risk (Y-Axis)** against **Remediation Effort (X-Axis)**, segmenting issues into 4 actionable quadrants:
1. **Quick Wins** (High Value, Low Effort) — Sprint Priority 1
2. **Strategic Refactoring** (High Value, High Effort) — Multi-sprint milestones
3. **Opportunistic Fixes** (Low Value, Low Effort) — Routine maintenance
4. **Deprioritized Debt** (Low Value, High Effort) — Product backlog
