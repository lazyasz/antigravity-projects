# Mathematical Priority Engine & Formulation

## 1. Motivation
The central value proposition of our platform is converting:
$$\text{"What is code-level risky?"} \longrightarrow \text{"What should the engineering team fix first, why, and with what ROI?"}$$

A pure technical metric fails when a file with high cyclomatic complexity operates in an isolated batch script with zero revenue exposure, while a moderately complex file runs active payment transactions.

---

## 2. Variables & Uniform Scale (0–100)

| Variable | Notation | Range | Definition |
| :--- | :--- | :--- | :--- |
| **Static Technical Risk** | $TR_{static}$ | 0–100 | Static code complexity, code smell density, and coverage deficit. |
| **ML Predicted Risk** | $TR_{ml}$ | 0–100 | Future failure and defect probability from historical ML models. |
| **Business Criticality** | $BC$ | 0–100 | Direct revenue dependency, core transaction role, or regulatory impact. |
| **Customer Impact** | $CI$ | 0–100 | Severity of user-facing outages and customer churn potential. |
| **Module Criticality** | $MC$ | 0–100 | Structural architectural role (core data client vs utility). |
| **Release Proximity** | $RP$ | 0–100 | Closeness to upcoming release milestone / deployment freeze. |
| **Sprint Urgency** | $SU$ | 0–100 | Current sprint focus and active roadmap deliverable commitments. |
| **Maintenance Cost** | $MCost$ | 0–100 | Ongoing developer friction and recurring bug overhead. |
| **Debt Age** | $Age_{days}$ | Integer | Duration in days since technical debt was first logged. |
| **Remediation Effort** | $Effort$ | 0–100 | Estimated hours, complexity, and regression risk to refactor (0=trivial, 100=major rewrite). |

---

## 3. Step-by-Step Mathematical Derivation

### Step 1: Composite Technical Risk ($TR_{comp}$)
Synthesizes static metrics with predictive ML probabilities:
$$TR_{comp} = 0.50 \cdot TR_{static} + 0.50 \cdot TR_{ml}$$

### Step 2: Composite Business Impact ($BI_{comp}$)
Models total organizational exposure:
$$BI_{comp} = 0.50 \cdot BC + 0.35 \cdot CI + 0.15 \cdot MC$$

### Step 3: Composite Release & Sprint Urgency ($U_{comp}$)
Combines deployment milestone proximity with active sprint goals:
$$U_{comp} = 0.60 \cdot RP + 0.40 \cdot SU$$

### Step 4: Normalized Debt Age ($Age_{norm}$)
Normalizes age to a 0–100 scale (capped at 365 days):
$$Age_{norm} = \min\left(100.0, \frac{Age_{days}}{365.0} \times 100.0\right)$$

### Step 5: Baseline Priority Score ($PS_{base}$)
Combines all weighted dimensions:
$$PS_{base} = w_{TR} \cdot TR_{comp} + w_{BI} \cdot BI_{comp} + w_{U} \cdot U_{comp} + w_{M} \cdot MCost + w_{A} \cdot Age_{norm}$$
*Configured Defaults*:
- $w_{TR} = 0.35$ (Technical Risk)
- $w_{BI} = 0.30$ (Business Impact)
- $w_{U} = 0.15$ (Release / Sprint Urgency)
- $w_{M} = 0.10$ (Maintenance Cost)
- $w_{A} = 0.10$ (Debt Age)
- $\sum w = 1.00$

### Step 6: ROI Index & Effort-Adjusted Final Priority Score ($PS_{final}$)
To ensure teams tackle high-value, fast-turnaround debt first rather than getting bogged down in low-ROI rewrites:
$$\text{ROI Score} = \frac{PS_{base}}{\max(15.0, Effort)} \times 100.0$$

$$PS_{final} = \text{clamp}\Big( (1 - w_E) \cdot PS_{base} + w_E \cdot (100.0 - Effort), 0.0, 100.0 \Big)$$
*Where $w_E = 0.15$ (Remediation Effort weight).*

---

## 4. Priority Categorization & Decision Quadrants

### Priority Levels:
- **`CRITICAL`**: $PS_{final} \ge 80.0$ OR ($BI_{comp} \ge 85.0$ and $TR_{comp} \ge 75.0$)
- **`HIGH`**: $60.0 \le PS_{final} < 80.0$
- **`MEDIUM`**: $40.0 \le PS_{final} < 60.0$
- **`LOW`**: $PS_{final} < 40.0$

### Actionable ROI Quadrant Matrix:
```
           High Value (PS_base >= 60)
                     │
    STRATEGIC        │      QUICK WIN
    REFACTOR         │     (Top Priority)
High Effort          │          Low Effort
(Effort > 40) ───────┼───────── (Effort <= 40)
                     │
   DEPRIORITIZED     │    OPPORTUNISTIC
     BACKLOG         │      (Fill-in)
                     │
           Low Value (PS_base < 60)
```
