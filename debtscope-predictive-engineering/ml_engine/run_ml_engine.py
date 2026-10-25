"""
Main Executable for Member 2 Machine Learning Engine
====================================================
Trains the Random Forest Regressor, evaluates performance metrics,
generates feature importances, and tests sample predictions.
"""

import os
import sys
import json

# Add current directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

from src.model_trainer import train_ml_pipeline
from src.predictor import MLDefectPredictor
from src.explainability import get_feature_importances


def main():
    print("=" * 65)
    print("   PREDICTIVE ENGINEERING INTELLIGENCE - ML DEFECT ENGINE (M2)   ")
    print("=" * 65)

    dataset_path = os.path.join(current_dir, "data", "technical_debt_ml_dataset.csv")
    models_dir = os.path.join(current_dir, "models")

    print(f"\n[+] Training Random Forest Regressor on: {dataset_path}")
    metrics = train_ml_pipeline(dataset_path, model_save_dir=models_dir)

    print("\n[OK] Model Training Completed!")
    print(f"    - Training Samples: {metrics['train_samples']}")
    print(f"    - Testing Samples:  {metrics['test_samples']}")
    print(f"    - Mean Absolute Error (MAE): {metrics['mae']:.4f}")
    print(f"    - Root Mean Squared Error (RMSE): {metrics['rmse']:.4f}")
    print(f"    - R-Squared (R2 Score): {metrics['r2']:.4f}")
    print(f"    - 5-Fold Cross-Validation R2: {metrics['cv_r2_mean']:.4f}")

    model_path = os.path.join(models_dir, "rf_defect_model.pkl")
    predictor = MLDefectPredictor(model_path=model_path)

    print("\n[+] Top 10 Most Important Technical Risk Drivers:")
    importances = get_feature_importances(model_path=model_path, top_n=10)
    for idx, item in enumerate(importances, 1):
        print(f"    {idx:2d}. {item['feature']:<30} -> {item['importance_percentage']}%")

    print("\n[+] Testing Sample Ingestion Prediction:")
    sample_component = {
        "lines_of_code": 1842,
        "cyclomatic_complexity": 41.0,
        "cognitive_complexity": 35.0,
        "code_smells_count": 14,
        "code_duplication_pct": 18.5,
        "security_hotspots_count": 3,
        "dependency_count": 22,
        "outdated_dependencies_pct": 45.0,
        "churn_lines_last_30d": 4246,
        "commits_last_90d": 23,
        "distinct_authors_last_90d": 4,
        "ownership_entropy": 0.61,
        "avg_pr_review_time_hrs": 48.5,
        "pr_rework_rate": 0.35,
        "unit_test_coverage_pct": 42.0,
        "ci_build_failure_rate": 0.25,
        "defects_reported_last_90d": 5,
        "production_incidents_last_180d": 2,
        "mttr_incident_mins": 140,
        "sprint_velocity_drag_pct": 28.0,
        "monthly_maintenance_hours": 32.0,
        "service_tier": "Tier-1",
        "programming_language": "Python",
        "domain": "Payments",
        "archetype": "Microservice"
    }

    prediction = predictor.predict_single(sample_component)
    print(f"    Component: payment_service/payment.py")
    print(f"    Predicted Technical Risk Score: {prediction['predicted_risk_score']} / 100")
    print(f"    Predicted Defect Probability:  {prediction['predicted_defect_probability'] * 100:.1f}%")
    print(f"    Risk Level:                   {prediction['predicted_risk_level']}")
    print(f"    Is Critical Hotspot:          {prediction['is_hotspot']}")

    print("\n" + "=" * 65)
    print("   [OK] MEMBER 2 ML ENGINE READY FOR INTEGRATION WITH BACKEND   ")
    print("=" * 65)


if __name__ == "__main__":
    main()
