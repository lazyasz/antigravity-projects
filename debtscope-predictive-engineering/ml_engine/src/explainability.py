"""
Machine Learning Explainability & Feature Importance (Member 2)
==============================================================
Extracts and ranks feature importances from the trained Random Forest model.
"""

import os
import pickle
import pandas as pd
from typing import List, Dict, Any


def get_feature_importances(model_path: str = "models/rf_defect_model.pkl", top_n: int = 15) -> List[Dict[str, Any]]:
    """Returns ranked feature importance scores from the Random Forest model."""
    if not os.path.exists(model_path):
        raise FileNotFoundError(f"Model not found at {model_path}")

    with open(model_path, "rb") as f:
        saved_data = pickle.load(f)
        
    pipeline = saved_data["pipeline"]
    preprocessor = pipeline.named_steps["preprocessor"]
    rf_model = pipeline.named_steps["model"]

    num_cols = saved_data["num_cols"]
    cat_cols = saved_data["cat_cols"]
    
    try:
        cat_encoder = preprocessor.named_transformers_["cat"]
        encoded_cat_names = list(cat_encoder.get_feature_names_out(cat_cols))
    except Exception:
        encoded_cat_names = [f"cat_{i}" for i in range(len(cat_cols))]

    all_features = list(num_cols) + encoded_cat_names
    importances = rf_model.feature_importances_

    feature_imp_df = pd.DataFrame({
        "feature": all_features[:len(importances)],
        "importance": importances
    }).sort_values(by="importance", ascending=False)

    top_features = feature_imp_df.head(top_n).to_dict(orient="records")
    for item in top_features:
        item["importance"] = round(float(item["importance"]), 4)
        item["importance_percentage"] = round(float(item["importance"]) * 100.0, 2)

    return top_features
