# Jiya's Subsystem: Machine Learning & Defect Analytics Engine

## 🎯 Scope of Work
- **Subsystem**: `ml_engine/`
- **Core Models**: Supervised `RandomForestRegressor` (300 bagged trees, max_depth=12)
- **Evaluation**: $R^2 = 0.9885$, 5-Fold CV $0.9849$, MAE = $1.0855$, RMSE = $1.5786$
- **Core Technologies**: Scikit-Learn, NumPy, Pandas, Pickle, MDI Feature Importance

## 📂 Subsystem Modules
1. `preprocessing.py`: Feature scaling (`StandardScaler`) and archetype one-hot encoding pipeline.
2. `train_model.py`: Model architecture, hyperparameter definition, and training pipeline.
3. `evaluate_model.py`: Cross-validation, $R^2$, MAE, RMSE metrics calculator.
4. `explainability.py`: Mean Decrease in Impurity (MDI) causal driver ranking.
5. `SPEAKING_NOTES.md`: Script & "Why This vs Why Not That" defense for Review 2.
