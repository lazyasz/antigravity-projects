"""
Member 2: Jiya - Model Evaluation & Cross Validation
Module: evaluate_model.py
Description: Computes R^2 score, 5-Fold Cross Validation, MAE, and RMSE metrics.
"""

from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error
from sklearn.model_selection import KFold, cross_val_score
import numpy as np
from typing import Dict, Any

class ModelEvaluator:
    """
    Evaluates ML defect predictor against academic benchmark metrics.
    """

    @staticmethod
    def evaluate_performance(model, X_test, y_test) -> Dict[str, float]:
        """Calculates R2, MAE, and RMSE on holdout test evaluation sets."""
        preds = model.predict(X_test)
        
        r2 = float(r2_score(y_test, preds))
        mae = float(mean_absolute_error(y_test, preds))
        rmse = float(np.sqrt(mean_squared_error(y_test, preds)))

        results = {
            "r2_score": round(r2, 4),
            "mae": round(mae, 4),
            "rmse": round(rmse, 4),
            "sample_count": len(y_test)
        }
        return results

    @staticmethod
    def run_kfold_cross_validation(model, X, y, n_splits: int = 5) -> Dict[str, float]:
        """Runs 5-fold cross-validation to prove lack of overfitting."""
        kf = KFold(n_splits=n_splits, shuffle=True, random_state=42)
        cv_scores = cross_val_score(model, X, y, cv=kf, scoring="r2")
        
        return {
            "mean_cv_r2": round(float(np.mean(cv_scores)), 4),
            "cv_std": round(float(np.std(cv_scores)), 4),
            "folds": [round(float(s), 4) for s in cv_scores]
        }

if __name__ == "__main__":
    print("Model Evaluator configured for R², 5-Fold CV, MAE, and RMSE benchmarking.")
