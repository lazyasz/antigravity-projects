# Review 2 Speaking Notes & Viva Defense: Jiya (Member 2)

**Role**: Machine Learning & Defect Analytics Specialist  
**Subsystem**: `ml_engine/`  
**Assigned Slides**: Slide 5 & Slide 9 (ML Engine & Experimental Evaluation)

---

## 🎙️ 2-Minute Presentation Script
"Good morning, panel. I developed the Machine Learning Defect Prediction and Risk Engine.

Traditional tools only report static rules. Our ML subsystem forecasts future failure probability and continuous technical risk before defects hit production.

We framed the problem as a **supervised regression task**, mapping multi-dimensional static metrics, commit churn entropy, and peer-review signals to a continuous risk index from 0 to 100.

Our pipeline uses `StandardScaler` for numeric features and `OneHotEncoder` for module architectural archetypes. For our model, we chose a **Random Forest Regressor with 300 bagged estimators and a maximum depth of 12**.

The model achieves a **Coefficient of Determination ($R^2$) of 0.9885**, with a **5-fold cross-validation score of 0.9849**, a **Mean Absolute Error of 1.0855**, and an **RMSE of 1.5786**.

Furthermore, using Mean Decrease in Impurity (MDI), our explainability module shows that `archetype_legacy_hotspot` (40.7%), `ownership_entropy` (15.0%), and `sprint_velocity_drag` (13.9%) are the top causal drivers of code risk."

---

## 🥊 Examiner "Why This vs. Why Not That?" Justification Cheat Sheet

### Q1: Why did you use Random Forest instead of Deep Learning (Neural Networks / Transformers)?
- **Answer**: Software engineering tabular metrics (LOC, cyclomatic complexity, code smells, commit churn) exhibit sharp, non-linear step-function risk thresholds (e.g., complexity $> 15$ spikes defects). Decision tree ensembles naturally split on orthogonal tabular boundaries, whereas deep neural networks require massive datasets ($>100k$ samples) to avoid overfitting and require GPU acceleration in production.

### Q2: Why continuous regression (0–100 Risk Score) instead of simple binary classification (Defective: Yes/No)?
- **Answer**: A binary `Defective = True` tag cannot distinguish between a file with a 51% failure risk and a catastrophic 99% risk file. A continuous 0–100 scale allows Member 3's mathematical decision engine to perform fine-grained ranking and effort-adjusted ROI calculations.

### Q3: How do you prove that your model is NOT overfitting with an $R^2$ of 0.9885?
- **Answer**: 
  1. We ran **5-Fold Cross-Validation**, achieving a mean $R^2$ of **0.9849** across folds, with minimal variance ($< 0.004$).
  2. We enforced strict structural regularization: `max_depth = 12`, `min_samples_split = 4`, `min_samples_leaf = 2`, and `max_features = 'sqrt'`.
  3. We benchmarked on independent external datasets: **The Technical Debt Dataset 2.0 (33 Apache Systems)** and **NASA MDP (JM1, PC1)**.
