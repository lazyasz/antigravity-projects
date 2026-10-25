# Review 2 Speaking Notes & Viva Defense: Dhruv (Member 3 / Team Lead)

**Role**: Team Lead, Decision Intelligence Architect & Backend Engineer  
**Subsystem**: `backend/` & Core Decision Engine  
**Assigned Slides**: Slides 1, 2, 6 & 7 (Executive Summary, Problem Vision, 5D Mathematical Formula, Backend Platform)

---

## 🎙️ 2-Minute Presentation Script
"Good morning, panel. I serve as team lead and architect of the Core Decision Engine and Backend Platform.

The fundamental flaw in existing static analysis tools like SonarQube is that they generate thousands of code smells without understanding business context. A 50-line utility script and a payment transaction service might have the same code smell, but fixing the payment service delivers exponentially higher business ROI.

To solve this, I formulated our **5-Dimensional Mathematical Prioritization Equation**:

$$PS_{base} = 0.35 \cdot TR_{comp} + 0.30 \cdot BI_{comp} + 0.15 \cdot U_{comp} + 0.10 \cdot MCost + 0.10 \cdot Age_{norm}$$

We synthesize Technical Risk (from Member 1's static metrics and Member 2's ML prediction) with Business Impact, Release Proximity, and Maintenance Cost.

We then apply an **Effort-Dampening Factor** to derive the final actionable score:

$$PS_{final} = \text{clamp}\Big( 0.85 \cdot PS_{base} + 0.15 \cdot (100.0 - Effort), 0.0, 100.0 \Big)$$

This feeds our **4-Quadrant Decision Matrix**, segmenting debt into **Quick Wins**, **Strategic Refactoring**, **Opportunistic Fixes**, and **Deprioritized Debt**.

The backend is built using **FastAPI with async ASGI concurrency and SQLAlchemy 2.0 ORM**, exposing high-throughput REST endpoints conforming to OpenAPI 3.1 specifications."

---

## 🥊 Examiner "Why This vs. Why Not That?" Justification Cheat Sheet

### Q1: Why did you create a custom 5D Mathematical Model instead of using SonarQube's built-in SQALE rating?
- **Answer**: SQALE calculates remediation time purely based on static syntax rules, treating all files equally regardless of business revenue exposure or developer churn. Our 5D formula integrates **Business Criticality ($BI_{comp}$)** and **Sprint Release Urgency ($U_{comp}$)** to isolate high-value "Quick Wins" from low-ROI rewrites.

### Q2: Why FastAPI over Flask or Django?
- **Answer**: FastAPI runs on an asynchronous ASGI event loop (`async def`) for concurrent telemetry ingestion. Its Rust-backed **Pydantic v2 core** provides 5–15x faster JSON serialization and strict type contracts, while automatically generating interactive Swagger documentation at `/docs`.

### Q3: How do you justify the exact weights in the $PS_{base}$ formula?
- **Answer**: Technical Risk (0.35) and Business Impact (0.30) represent the core criteria (65% combined weight) because debt only demands immediate engineering attention if it is technically fragile AND poses customer/revenue risk. Urgency (0.15) captures milestone proximity, while Maintenance Cost and Debt Age (0.10 each) capture chronic velocity drag. The 15% effort dampener in $PS_{final}$ guarantees that high-impact, low-effort Quick Wins bubble to the top of sprint planning.
