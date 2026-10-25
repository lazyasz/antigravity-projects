"""
Prediction Service: Handles Machine Learning risk predictions from Member 2.
Supports direct ingestion, batch ingestion, and probabilistic fallbacks.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from backend.database.models import MLPrediction, SourceFile
from backend.schemas.prediction import MLPredictionCreate, MLPredictionBatchIngest


class PredictionService:
    @staticmethod
    def ingest_prediction(db: Session, pred_in: MLPredictionCreate) -> MLPrediction:
        prediction = db.query(MLPrediction).filter(MLPrediction.file_id == pred_in.file_id).first()
        if not prediction:
            prediction = MLPrediction(
                file_id=pred_in.file_id,
                predicted_future_risk=pred_in.predicted_future_risk,
                defect_probability=pred_in.defect_probability,
                churn_risk_score=pred_in.churn_risk_score,
                confidence_score=pred_in.confidence_score,
                model_version=pred_in.model_version,
            )
            db.add(prediction)
        else:
            prediction.predicted_future_risk = pred_in.predicted_future_risk
            prediction.defect_probability = pred_in.defect_probability
            prediction.churn_risk_score = pred_in.churn_risk_score
            prediction.confidence_score = pred_in.confidence_score
            prediction.model_version = pred_in.model_version

        db.commit()
        db.refresh(prediction)
        return prediction

    @classmethod
    def batch_ingest_predictions(cls, db: Session, batch_data: MLPredictionBatchIngest) -> List[MLPrediction]:
        results = []
        for item in batch_data.predictions:
            file_id = item.file_id
            if not file_id and item.file_path:
                file_obj = db.query(SourceFile).filter(SourceFile.file_path == item.file_path).first()
                if file_obj:
                    file_id = file_obj.id

            if file_id:
                pred_create = MLPredictionCreate(
                    file_id=file_id,
                    predicted_future_risk=item.predicted_future_risk,
                    defect_probability=item.defect_probability,
                    churn_risk_score=item.churn_risk_score,
                    confidence_score=item.confidence_score,
                    model_version=item.model_version,
                )
                pred_obj = cls.ingest_prediction(db, pred_create)
                results.append(pred_obj)
        return results

    @staticmethod
    def get_prediction_by_file_id(db: Session, file_id: int) -> Optional[MLPrediction]:
        return db.query(MLPrediction).filter(MLPrediction.file_id == file_id).first()

    @staticmethod
    def get_all_predictions(db: Session) -> List[MLPrediction]:
        return db.query(MLPrediction).all()
