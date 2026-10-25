# Technical Viva & Interview Preparation Guide

This guide provides in-depth technical explanations and structured answers for project presentations, college vivas, and engineering technical interviews.

---

### Q1: Why did we choose FastAPI over Flask or Django?
**Answer**:
1. **Asynchronous Concurrency & Performance**: FastAPI is built on Starlette and ASGI (Asynchronous Server Gateway Interface), delivering performance comparable to NodeJS and Go through Python's `asyncio` loop.
2. **Native Type Safety & Auto-Validation**: FastAPI integrates deeply with **Pydantic v2**, ensuring that incoming HTTP payloads, query params, and JSON structures are automatically validated at runtime with zero boilerplate.
3. **Automatic OpenAPI/Swagger Generation**: FastAPI compiles Python type annotations into interactive Swagger (`/docs`) and ReDoc (`/redoc`) API documentation without manual OpenAPI maintenance.
4. **Dependency Injection System**: FastAPI's `Depends()` mechanism provides clean dependency management (e.g. database session lifecycle management via `get_db()`) with automatic transactional commit/rollback and cleanup.

---

### Q2: What is REST (Representational State Transfer)?
**Answer**:
REST is an architectural style for distributed hypermedia systems based on 6 core constraints:
1. **Client-Server Separation**: Separation of UI concerns from data persistence.
2. **Statelessness**: Every request contains all context needed by the server; session state is not stored on the server between requests.
3. **Cacheability**: Responses explicitly declare themselves cacheable or non-cacheable.
4. **Uniform Interface**: Resource identification via URIs (e.g., `/api/v1/files/1`), standard HTTP verbs (`GET` for retrieval, `POST` for creation, `PUT` for complete updates, `DELETE` for removal), and standard HTTP status codes (`200 OK`, `201 Created`, `404 Not Found`, `422 Unprocessable Content`).
5. **Layered System**: Clients cannot distinguish whether they are communicating with the end server or an intermediary proxy/gateway.
6. **Code on Demand (Optional)**: Servers can extend client functionality by transferring executable code.

---

### Q3: What is an API Contract and why is it critical in our team project?
**Answer**:
An **API Contract** is a formal, unambiguous agreement between the backend and its consuming clients (Frontend team, ML engineers, Data Pipeline). It specifies:
- Exact endpoint paths and HTTP verbs
- Required and optional headers
- Request payload schemas, data types, and constraints (e.g. scores between `0` and `100`)
- Expected HTTP status codes and exact error response formats
- Response JSON schemas

**Why it matters**: In a multi-member college project where teammates work simultaneously, a strict API contract allows Member 1 (Data) and Member 2 (ML) to write data ingestion scripts, and Member 3 (Frontend) to build UI mockups concurrently without blocking on backend completion.

---

### Q4: Why Pydantic?
**Answer**:
Pydantic is Python's gold standard for data validation and schema declaration:
1. **Rust-Powered Speed (Pydantic v2)**: Data parsing and validation core is implemented in Rust (`pydantic-core`), making it 5x–15x faster than legacy Python validation libraries.
2. **Type Coercion & Strict Range Bounds**: Enforces `Field(ge=0.0, le=100.0)` to guarantee our mathematical engine never receives corrupt out-of-range floats.
3. **JSON Serialization & ORM Conversion**: Automatically transforms SQLAlchemy ORM models into clean JSON through `model_config = ConfigDict(from_attributes=True)`.

---

### Q5: How is the database structured?
**Answer**:
Our relational schema in SQLAlchemy uses a normalized entity hierarchy:
- `repositories` (1-to-Many with `source_files`): Tracks code repositories and branches.
- `source_files` (1-to-1 or 1-to-Many): Central entity representing tracked modules (`payment.py`, `analytics.py`).
- `engineering_metrics` (1-to-1): Stores static complexity, smells, test coverage, and churn from Member 1.
- `technical_debt_items` (1-to-Many): Stores specific code issues (God method, duplication) with severity and debt age.
- `ml_predictions` (1-to-1): Stores future bug probability and churn risk from Member 2.
- `business_contexts` (1-to-1): Stores business criticality, customer impact, release proximity, and remediation effort.
- `priority_scores` (1-to-1): Stores computed priority score, rank, baseline, and ROI quadrant.
- `recommendations` (1-to-Many): Stores deterministic action directives and sprint allocations.

---

### Q6: How does the priority formula work?
**Answer**:
Our Decision Engine combines five weighted dimensions into a normalized **0–100 Priority Score**:
$$PS_{base} = 0.35 \cdot TR_{comp} + 0.30 \cdot BI_{comp} + 0.15 \cdot U_{comp} + 0.10 \cdot \text{Maintenance Cost} + 0.10 \cdot \text{Debt Age}$$

Where:
- $TR_{comp} = 0.50 \cdot TR_{static} + 0.50 \cdot TR_{ml}$ (Static metrics + ML defect prediction)
- $BI_{comp} = 0.50 \cdot BC + 0.35 \cdot CI + 0.15 \cdot MC$ (Business criticality + Customer impact + Module importance)
- $U_{comp} = 0.60 \cdot \text{Release Proximity} + 0.40 \cdot \text{Sprint Urgency}$

Finally, we adjust for **Remediation Effort ($Effort$)**:
$$PS_{final} = \text{clamp}\Big( 0.85 \cdot PS_{base} + 0.15 \cdot (100.0 - Effort), 0.0, 100.0 \Big)$$

---

### Q7: Why include Business Impact?
**Answer**:
Engineering resources and sprint capacities are finite. Fixing technical debt is an economic decision. A file with high cyclomatic complexity in an internal reporting script that runs once a month has low business risk. In contrast, moderate technical debt in a core checkout/payment processing gateway directly threatens revenue, compliance, and user retention. Integrating Business Impact aligns engineering refactoring with enterprise risk.

---

### Q8: Why does Remediation Effort matter?
**Answer**:
Prioritizing solely by complexity leads engineering teams into "refactoring rabbit holes"—multi-month architectural rewrites that stall feature delivery. By calculating an **ROI Score** ($\frac{\text{Value}}{\text{Effort}}$), our platform distinguishes between:
1. **Quick Wins** (High Value, Low Effort): Top-priority sprint targets.
2. **Strategic Refactoring** (High Value, High Effort): Phased multi-sprint milestones.
3. **Opportunistic Fixes** (Low Value, Low Effort): Addressed during routine maintenance.
4. **Deprioritized Debt** (Low Value, High Effort): Left in backlog due to low return on investment.

---

### Q9: How does our system differ from a simple severity ranking?
**Answer**:
Traditional tools (e.g. SonarQube) produce **Code-Severity Rankings** based on static rules. Our platform produces **Business-Aware Remediation Orders**:

| Dimension | Traditional Static Analyzers | Our Decision Intelligence Platform |
| :--- | :--- | :--- |
| **Data Scope** | Static code smells & lines of code only | Static metrics + ML Predictions + Business context + Release schedule |
| **Output** | "This file has 15 code smells (Major)" | "Refactor payment.py immediately: High ROI fix (Score 84.6) before Friday release freeze" |
| **Business Awareness** | Zero awareness of revenue or users | Differentiates payment checkout from background analytics |
| **Actionability** | Unprioritized list of hundreds of issues | Categorized into Quick Wins, Story Point allocations, and Sprint recommendations |

---

### Q10: How does the ML output enter the prioritization engine?
**Answer**:
Member 2 trains supervised regression/classification models (such as XGBoost or RandomForest) using historical git churn, commit frequencies, and past bug ticket logs. The ML model outputs a **Predicted Future Defect Probability (0–1.0)** and **Future Risk Score (0–100)**. 

Through `POST /api/v1/predictions/ingest`, these predictions are stored in `ml_predictions` and blended 50/50 with static metrics into the **Composite Technical Risk ($TR_{comp}$)**.

---

### Q11: How would you scale the backend in production?
**Answer**:
1. **Stateless ASGI Workers**: Run multiple FastAPI worker processes behind **Gunicorn / Uvicorn** or inside a Kubernetes Pod auto-scaler.
2. **Database Connection Pooling**: Transition from SQLite to PostgreSQL with **PgBouncer** connection pooling and read replicas.
3. **Caching Layer**: Deploy **Redis** to cache calculated priority ranks and file breakdowns with automatic invalidation upon metric ingestion.
4. **Asynchronous Task Queues**: Offload heavy repository analysis computations to **Celery / Redis Queue (RQ)** background workers.

---

### Q12: How would you handle 10,000 repositories?
**Answer**:
1. **Database Partitioning & Indexing**: Composite indexing on `(repository_id, priority_score, rank)` and database sharding by organization/repository ID.
2. **Event-Driven Microservices Architecture**: Kafka / RabbitMQ event streams where code commit events trigger localized file recalculations rather than full database re-analysis.
3. **Batched Parallel Processing**: Distributed MapReduce / Ray / Spark jobs to compute static metrics across millions of source files in parallel.

---

### Q13: How would Jira and CI/CD eventually integrate?
**Answer**:
1. **CI/CD Pull Request Checks (GitHub Actions / GitLab CI)**:
   - A CI/CD workflow triggers `POST /api/v1/analyze` on every Pull Request.
   - If a PR introduces high technical debt into a high-criticality module (e.g., `payment.py`), the CI pipeline posts a GitHub PR comment or blocks merge.
2. **Automated Jira Issue Creation**:
   - For files flagged as **`CRITICAL`** or **`QUICK_WIN`**, the backend automatically triggers the Jira REST API to generate a Technical Debt Story directly into the active Sprint backlog with estimated story points and remediation guidance.
