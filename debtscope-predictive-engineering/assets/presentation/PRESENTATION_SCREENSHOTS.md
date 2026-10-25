# DebtScope: Technical Presentation Screenshot Evidence & Slide Mapping

This document maps all high-resolution screenshots captured from the real, running **DebtScope Predictive Engineering Intelligence Platform** to each team member's presentation slides for **Project Review 2 / Technical Evaluation**.

---

## 🏛️ Master Asset Inventory

All visual assets are stored under `assets/presentation/screenshots/`:

| # | Asset Filename | Screen Title | Key Visual Features | Target Slides |
|:---:|:---|:---|:---|:---:|
| **01** | [`01_executive_dashboard.png`](./screenshots/01_executive_dashboard.png) | Executive Dashboard | Health score, $48.2k runway, 18 Quick Wins, 38.5% defect risk, 19 hotspots, 7-sprint velocity trend | Slide 8 (Demo), Slide 1 |
| **02** | [`02_priority_matrix.png`](./screenshots/02_priority_matrix.png) | 5D ROI Decision Matrix | 2D Scatter Quadrant (Impact vs Effort), 5-factor weighting breakdown, Quick Wins triage | Slide 6 (Decision Engine), Slide 7 |
| **03** | [`03_file_intelligence.png`](./screenshots/03_file_intelligence.png) | File Intelligence Explorer | AST cyclomatic peak (38), 480 LOC churn, 7-sprint risk curve (+33 pts), AI patch preview | Slide 9 (Code Telemetry), Slide 10 |
| **04** | [`04_ml_analytics.png`](./screenshots/04_ml_analytics.png) | ML Defect Predictor & SHAP | Supervised Random Forest ($R^2=0.9885$, 300 trees), SHAP importance bars, Live defect simulator | Slide 5 (ML Models), Slide 9 |
| **05** | [`05_refactoring_copilot.png`](./screenshots/05_refactoring_copilot.png) | AI Refactoring Copilot | Interactive chat, token provider god-class breakdown, unified AST patch diffs, Jira export | Slide 10 (AI Copilot & Roadmap) |
| **06** | [`06_project_overview.png`](./screenshots/06_project_overview.png) | Monorepo Code Hotspots | 19 god-classes, 48.2 peak complexity, 2,840 LOC churn, 18.4% duplication, file explorer | Slide 8 (Platform UI), Slide 2 |
| **07** | [`07_api_documentation.png`](./screenshots/07_api_documentation.png) | FastAPI Swagger / OpenAPI | Interactive OpenAPI 3.1 schema at `/docs`, repository, priority, lakehouse, copilot routes | Slide 7 (Backend Architecture) |
| **08** | [`08_data_pipeline.png`](./screenshots/08_data_pipeline.png) | Medallion Lakehouse & Audit | Bronze (2.93M rows) ➔ Silver (52.4k SZZ links) ➔ Gold (1.037M rows), 100% Quality Pass, NASA AUC 0.8754 | Slide 3 (Architecture), Slide 4 |

---

## 👥 4-Member PPT Evidence & Presentation Visual Mapping

```
                               ┌─────────────────────────────────────────────────────────┐
                               │       DebtScope Presentation Visual Distribution        │
                               └─────────────────────────────────────────────────────────┘
                                                            │
                 ┌───────────────────────────┬──────────────┴────────────┬───────────────────────────┐
                 │                           │                           │                           │
          [ VAISHNAVI ]                  [ JIYA ]                    [ DHRUV ]                   [ ADESH ]
       Data Engineering Lead         ML & Analytics Lead         Decision Engine Lead        Frontend & UI Lead
                 │                           │                           │                           │
         08_data_pipeline.png        04_ml_analytics.png         02_priority_matrix.png      01_executive_dashboard.png
      (Bronze/Silver/Gold Lakehouse) (RF R²=0.9885 & SHAP)       (5D ROI Scatter Matrix)     (Master Executive Cockpit)
                 │                           │                           │                           │
      06_project_overview.png     03_file_intelligence.png       07_api_documentation.png    05_refactoring_copilot.png
      (Monorepo Hotspot Ingestion)(Continuous Risk Score)        (FastAPI OpenAPI Spec)      (AI AST Refactoring Diff)
```

---

### 1. 🗄️ VAISHNAVI — Data Engineering & Medallion Lakehouse

**Role:** Data Pipeline & Lakehouse Ingestion Lead  
**Presentation Slides:** **Slide 3 (Data Architecture)** & **Slide 4 (Medallion Ingestion & Lineage)**

#### Recommended Primary Visuals:
- [`08_data_pipeline.png`](./screenshots/08_data_pipeline.png) — *Data Lineage & Quality Gates (Medallion Lakehouse)*
- [`06_project_overview.png`](./screenshots/06_project_overview.png) — *Monorepo Hotspots & Ingestion Explorer*

#### Presentation Delivery Narrative:
> *"These visuals demonstrate how raw engineering telemetry is transformed into structured ML-ready features."*
>
> *"As shown in our live Data Lineage screen (**Screenshot 08**), we ingest **2,933,680 raw records** from 31 Apache software repositories across a 21-year historical timeline into our Bronze Parquet layer. Our automated quality gates validate **52,428 SZZ defect links** with a **100% audit pass rate**, outputting a consolidated Gold feature matrix of **1,037,222 rows** with zero synthetic target leakage."*

---

### 2. 🤖 JIYA — Machine Learning & Defect Intelligence

**Role:** Supervised ML Modeling & Explainability Lead  
**Presentation Slides:** **Slide 5 (ML Model Architecture)** & **Slide 9 (Model Validation & Benchmarks)**

#### Recommended Primary Visuals:
- [`04_ml_analytics.png`](./screenshots/04_ml_analytics.png) — *Supervised AST Random Forest Regressor & SHAP Rankings*
- [`03_file_intelligence.png`](./screenshots/03_file_intelligence.png) — *File-Level Continuous Risk Telemetry & 7-Sprint Trajectory*

#### Presentation Delivery Narrative:
> *"This demonstrates how the ML engine converts engineering metrics into a continuous risk score."*
>
> *"In **Screenshot 04**, our live Random Forest ensemble of **300 Decision Trees** achieves an empirical **$R^2 = 0.9885$** ($0.9849$ on 5-fold cross-validation) and an ultra-low MAE of **1.085 LOC/Defect**. Through SHAP value decomposition, we establish that **Cyclomatic Complexity (34%)** and **Recent Commit Churn (28%)** act as primary risk multipliers. Furthermore, on NASA PROMISE defect benchmarks (NASA PC1), our classifier delivers an **ROC-AUC of 0.8754** with 93.7% accuracy."*

---

### 3. 📐 DHRUV (Lead) — Decision Engine, Mathematical 5D Formula & Backend

**Role:** Platform Lead, Prioritization Engine & Backend Lead  
**Presentation Slides:** **Slide 1 (Title/Vision)**, **Slide 2 (Problem Statement)**, **Slide 6 (5D Mathematical Formula)**, & **Slide 7 (FastAPI Backend)**

#### Recommended Primary Visuals:
- [`02_priority_matrix.png`](./screenshots/02_priority_matrix.png) — *2D ROI Decision Quadrant Chart & Multi-Factor Weights*
- [`01_executive_dashboard.png`](./screenshots/01_executive_dashboard.png) — *Remediation Runway & Project Health Overview*
- [`07_api_documentation.png`](./screenshots/07_api_documentation.png) — *FastAPI OpenAPI 3.1 Swagger Documentation*

#### Presentation Delivery Narrative:
> *"This demonstrates how the ML risk score is converted into an actionable business prioritization decision."*
>
> *"Technical debt cannot be solved by technical severity alone; it requires business context. In **Screenshot 02**, our 5-Factor mathematical decision engine balances **35% Technical Risk**, **30% Business Impact**, **15% Release Urgency**, **10% Maintenance Cost**, and **10% Developer Churn**. This automatically segregates code friction into four actionable quadrants—highlighting **18 Quick Wins** (high impact, effort $\le 40\text{h}$) that deliver a **3.4x ROI** in recovered velocity. **Screenshot 07** shows our asynchronous FastAPI REST backbone exposing all decision endpoints with sub-10ms latency."*

---

### 4. 💻 ADESH — Executive Dashboard, UI Architecture & Copilot

**Role:** Executive Dashboard & User Experience Lead  
**Presentation Slides:** **Slide 8 (Platform UI Demonstration)** & **Slide 10 (AI Copilot & Product Roadmap)**

#### Recommended Primary Visuals:
- [`01_executive_dashboard.png`](./screenshots/01_executive_dashboard.png) — *Executive Cockpit, KPI Bento Grid & Telemetry Radar*
- [`02_priority_matrix.png`](./screenshots/02_priority_matrix.png) — *Interactive Scatter Matrix & Ranked Backlog*
- [`03_file_intelligence.png`](./screenshots/03_file_intelligence.png) — *Deep File Telemetry Capsule & Risk History Curve*
- [`05_refactoring_copilot.png`](./screenshots/05_refactoring_copilot.png) — *Conversational AI Engineering Copilot with Code Diffs*

#### Presentation Delivery Narrative:
> *"This demonstrates how the underlying analytics are presented to engineering managers through the executive interface."*
>
> *"In **Screenshot 01**, engineering executives gain single-pane-of-glass visibility with live telemetry radar, **$48.2k remediation runway** tracking, and 7-sprint velocity decay curves. In **Screenshot 05**, our AI Refactoring Copilot provides conversational AST intelligence—analyzing monolithic god-classes like `token_provider.py` and generating drop-in refactoring patches that reduce cyclomatic depth by **64%**, complete with 1-click Jira ticket dispatch."*

---

## 📋 Summary Table for Quick Presentation Slide Assembly

| Slide # | Slide Subject | Primary Presenter | Embedded Screenshot Asset |
|:---:|:---|:---|:---|
| **Slide 1** | Project Title & Executive Overview | Dhruv (Lead) | `01_executive_dashboard.png` (Thumbnail / Header) |
| **Slide 2** | Industry Problem & Technical Debt Drag | Dhruv | `06_project_overview.png` (Hotspot Severity View) |
| **Slide 3** | Data Engineering & Medallion Lakehouse | Vaishnavi | `08_data_pipeline.png` (Bronze ➔ Silver ➔ Gold Cards) |
| **Slide 4** | Automated Quality Gates & Lineage Audit | Vaishnavi | `08_data_pipeline.png` (Audit Assertions Table) |
| **Slide 5** | Machine Learning Defect Regression Model | Jiya | `04_ml_analytics.png` (RF Regressor Performance & SHAP) |
| **Slide 6** | 5D ROI Prioritization Formula & Quadrants | Dhruv | `02_priority_matrix.png` (2D Scatter Quadrant Matrix) |
| **Slide 7** | Backend Architecture & FastAPI Microservices | Dhruv | `07_api_documentation.png` (FastAPI Swagger Interface) |
| **Slide 8** | Executive Dashboard & Real-Time Telemetry | Adesh | `01_executive_dashboard.png` (Master Dashboard View) |
| **Slide 9** | Code Telemetry & Continuous Risk Assessment | Jiya / Adesh | `03_file_intelligence.png` (Risk Trajectory Curve) |
| **Slide 10** | AI Refactoring Copilot & Project Roadmap | Adesh | `05_refactoring_copilot.png` (Copilot Unified Diff) |
