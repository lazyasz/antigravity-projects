"""
Member 2: Jiya - Random Forest Model Training
Module: train_model.py
Description: Trains a supervised Random Forest Regressor (300 estimators, max_depth 12)
             to predict future failure probability and technical risk score.
"""

from sklearn.ensemble import RandomForestRegressor
import pickle
from pathlib import Path

class RiskModelTrainer:
    """
    Supervised Random Forest Regressor for Defect and Technical Risk Scoring.
    """

    def __init__(self, n_estimators: int = 300, max_depth: int = 12, random_state: int = 42):
        self.model = RandomForestRegressor(
            n_estimators=n_estimators,
            max_depth=max_depth,
            max_features="sqrt",
            min_samples_split=4,
            min_samples_leaf=2,
            random_state=random_state,
            n_jobs=-1
        )
        self.is_trained = False

    def train(self, X_train, y_train):
        """Trains the Random Forest model on preprocessed training vectors."""
        print(f"Training Random Forest Regressor with {self.model.n_estimators} trees...")
        self.model.fit(X_train, y_train)
        self.is_trained = True
        print("Training completed successfully.")

    def save_model(self, output_path: str = "ml_engine/models/rf_defect_model.pkl"):
        """Persists trained model artifact to disk."""
        out = Path(output_path)
        out.parent.mkdir(parents=True, exist_ok=True)
        with open(out, "wb") as f:
            pickle.dump(self.model, f)
        print(f"Trained model artifact saved to {out}")

if __name__ == "__main__":
    trainer = RiskModelTrainer()
    print("Risk Model Trainer instantiated with 300 bagged trees.")
