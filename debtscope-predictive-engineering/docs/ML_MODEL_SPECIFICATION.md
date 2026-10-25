# Machine Learning Model Specification (Member 2 Engine)

## 1. Overview
The Machine Learning Subsystem predicts future defect probability, churn risk, and composite technical risk for software modules based on historical version control, static complexity, peer reviews, and incident logs.

---

## 2. Model Architecture

- **Algorithm**: `RandomForestRegressor`
- **Number of Estimators ($N$)**: 300
- **Max Tree Depth**: 12
- **Splitting Criterion**: Squared Error (MSE)
- **Feature Scaling**: `StandardScaler` (Numerical features) + `OneHotEncoder` (Categorical features)
- **Ensemble Method**: Bagging with feature bootstrap subsampling (`max_features="sqrt"`)

---

## 3. Evaluation Metrics & Performance Benchmarks

| Metric | Achieved Value | Benchmark Description |
| :--- | :--- | :--- |
| **Coefficient of Determination ($R^2$)** | **0.9885** | Proportion of risk variance explained by the model |
| **5-Fold Cross-Validation $R^2$** | **0.9849** | Out-of-sample generalization stability across folds |
| **Mean Absolute Error (MAE)** | **1.0855** | Average absolute error on 0–100 scale |
| **Root Mean Squared Error (RMSE)** | **1.5786** | Penalized square error on 0–100 scale |

---

## 4. Top 10 Explainability Feature Drivers

| Rank | Feature Name | Importance (%) | Domain Interpretation |
| :--- | :--- | :--- | :--- |
| 1 | `archetype_legacy_hotspot` | 40.74% | High-risk legacy architectural modules |
| 2 | `ownership_entropy` | 15.01% | High developer turnover / Bus Factor risks |
| 3 | `sprint_velocity_drag_pct` | 13.94% | Friction caused by unaddressed technical debt |
| 4 | `pr_rework_rate` | 10.41% | Code churn during code reviews |
| 5 | `archetype_healthy_active` | 7.23% | Actively maintained clean modules |
| 6 | `monthly_maintenance_hours` | 5.21% | Ongoing support hours required |
| 7 | `unit_test_coverage_pct` | 3.19% | Safeguards against regression defects |
| 8 | `archetype_dormant_legacy` | 0.55% | Stagnant codebases |
| 9 | `commits_last_90d` | 0.52% | Revision frequency |
| 10 | `distinct_authors_last_90d` | 0.50% | Author team size |

---

## 5. Artifact Storage
- **Trained Weights**: `ml_engine/models/rf_defect_model.pkl`
- **Predictor API**: `ml_engine/src/predictor.py`
