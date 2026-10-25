"""
Machine Learning Model Trainer Module (Member 2)
================================================
Trains a Random Forest Regressor on technical debt and defect engineering metrics.
Saves the trained pipeline, preprocessors, and evaluation metrics for downstream ingestion.
"""

import os
import pickle
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler, OneHotEncoder, MinMaxScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score


RISK_WEIGHTS = {
    "cyclomatic_complexity": 0.08,
    "cognitive_complexity": 0.07,
    "code_smells_count": 0.08,
    "code_duplication_pct": 0.06,
    "security_hotspots_count": 0.10,
    "outdated_dependencies_pct": 0.07,
    "churn_lines_last_30d": 0.05,
    "avg_pr_review_time_hrs": 0.04,
    "pr_rework_rate": 0.06,
    "ci_build_failure_rate": 0.07,
    "defects_reported_last_90d": 0.08,
    "production_incidents_last_180d": 0.10,
    "mttr_incident_mins": 0.05,
    "sprint_velocity_drag_pct": 0.04,
    "monthly_maintenance_hours": 0.05
}

ID_COLUMNS = ["entity_id", "repo_name", "component_path"]


def compute_technical_risk_target(df: pd.DataFrame) -> pd.DataFrame:
    """Computes normalized 0-100 composite technical risk score as training target."""
    df_calc = df.copy()
    risk_features = list(RISK_WEIGHTS.keys())
    
    # Handle missing values
    for col in risk_features:
        if col in df_calc.columns:
            df_calc[col] = df_calc[col].fillna(df_calc[col].median())

    scaler = MinMaxScaler()
    df_calc[risk_features] = scaler.fit_transform(df_calc[risk_features])
    
    risk_score = np.zeros(len(df_calc))
    for feat, weight in RISK_WEIGHTS.items():
        if feat in df_calc.columns:
            risk_score += df_calc[feat].values * weight
            
    # Scale to 0-100
    df["technical_risk_score"] = np.clip(risk_score * 100.0, 0.0, 100.0)
    return df


def train_ml_pipeline(csv_path: str, model_save_dir: str = "models") -> dict:
    """Trains the complete Random Forest ML pipeline and returns performance metrics."""
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Dataset not found: {csv_path}")

    df = pd.read_csv(csv_path)
    df = compute_technical_risk_target(df)

    # Separate IDs and Target
    existing_id_cols = [c for c in ID_COLUMNS if c in df.columns]
    df_features = df.drop(columns=existing_id_cols).copy()
    
    y = df_features["technical_risk_score"]
    X = df_features.drop(columns=["technical_risk_score"])
    
    # Impute missing values
    num_cols = X.select_dtypes(include=["number"]).columns.tolist()
    cat_cols = X.select_dtypes(include=["object"]).columns.tolist()
    
    for c in num_cols:
        X[c] = X[c].fillna(X[c].median())
    for c in cat_cols:
        mode_val = X[c].mode()[0] if len(X[c].mode()) > 0 else "Unknown"
        X[c] = X[c].fillna(mode_val)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore"), cat_cols)
        ]
    )

    rf = RandomForestRegressor(
        n_estimators=300,
        max_depth=12,
        random_state=42,
        n_jobs=-1
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("model", rf)
    ])

    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)

    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    r2 = float(r2_score(y_test, y_pred))
    cv_scores = cross_val_score(pipeline, X_train, y_train, cv=5, scoring="r2")

    os.makedirs(model_save_dir, exist_ok=True)
    model_path = os.path.join(model_save_dir, "rf_defect_model.pkl")
    with open(model_path, "wb") as f:
        pickle.dump({
            "pipeline": pipeline,
            "feature_names": list(X.columns),
            "num_cols": num_cols,
            "cat_cols": cat_cols,
            "metrics": {"mae": mae, "rmse": rmse, "r2": r2, "cv_r2_mean": float(cv_scores.mean())}
        }, f)

    return {
        "model_path": model_path,
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "mae": mae,
        "rmse": rmse,
        "r2": r2,
        "cv_r2_mean": float(cv_scores.mean())
    }
