"""
Machine Learning Predictor & Inference Service (Member 2)
=========================================================
Loads trained model and generates defect probabilities and technical risk predictions.
"""

import os
import pickle
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Union


class MLDefectPredictor:
    def __init__(self, model_path: str = "models/rf_defect_model.pkl"):
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"Trained model not found at {model_path}. Please train first.")
        
        with open(model_path, "rb") as f:
            saved_data = pickle.load(f)
            
        self.pipeline = saved_data["pipeline"]
        self.feature_names = saved_data["feature_names"]
        self.num_cols = saved_data["num_cols"]
        self.cat_cols = saved_data["cat_cols"]
        self.metrics = saved_data["metrics"]

    def _prepare_df(self, data: Union[Dict[str, Any], List[Dict[str, Any]], pd.DataFrame]) -> pd.DataFrame:
        if isinstance(data, dict):
            df = pd.DataFrame([data])
        elif isinstance(data, list):
            df = pd.DataFrame(data)
        else:
            df = data.copy()

        # Fill missing features with default neutral values if not provided
        for col in self.num_cols:
            if col not in df.columns:
                df[col] = 0.0
            else:
                df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0.0)

        for col in self.cat_cols:
            if col not in df.columns:
                df[col] = "Unknown"
            else:
                df[col] = df[col].fillna("Unknown").astype(str)

        return df[self.feature_names]

    def predict_single(self, component_features: Dict[str, Any]) -> Dict[str, Any]:
        """Predicts defect probability, risk score, and risk level for a single file/component."""
        df_ready = self._prepare_df(component_features)
        risk_score = float(np.clip(self.pipeline.predict(df_ready)[0], 0.0, 100.0))
        defect_prob = round(risk_score / 100.0, 4)

        if risk_score < 25.0:
            risk_level = "LOW"
        elif risk_score < 50.0:
            risk_level = "MEDIUM"
        elif risk_score < 75.0:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        return {
            "predicted_risk_score": round(risk_score, 2),
            "predicted_defect_probability": defect_prob,
            "predicted_risk_level": risk_level,
            "is_hotspot": risk_score >= 60.0
        }

    def predict_batch(self, df_or_list: Union[List[Dict[str, Any]], pd.DataFrame]) -> List[Dict[str, Any]]:
        """Predicts risk for a batch of components."""
        df_ready = self._prepare_df(df_or_list)
        scores = np.clip(self.pipeline.predict(df_ready), 0.0, 100.0)
        
        results = []
        for s in scores:
            prob = round(float(s) / 100.0, 4)
            lvl = "LOW" if s < 25 else "MEDIUM" if s < 50 else "HIGH" if s < 75 else "CRITICAL"
            results.append({
                "predicted_risk_score": round(float(s), 2),
                "predicted_defect_probability": prob,
                "predicted_risk_level": lvl,
                "is_hotspot": bool(s >= 60.0)
            })
        return results
