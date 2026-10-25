"""
Real Empirical Defect Prediction Model Training
===============================================
Trains regression models on real SZZ ground-truth fault counts from Gold lakehouse features,
and binary defect classifiers on NASA JM1 & PC1 benchmarks.
Includes baseline DummyRegressor comparison (predict-the-mean).
"""

import os
import sys
import time
import json
import joblib
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from sklearn.model_selection import train_test_split, cross_val_score, KFold
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier
from sklearn.dummy import DummyRegressor, DummyClassifier
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score, roc_auc_score, classification_report, accuracy_score

class RealDataModelTrainer:
    def __init__(self, gold_path: str = "data/lakehouse/gold/engineering_features.parquet", models_dir: str = "ml_engine/models"):
        self.gold_path = gold_path
        self.models_dir = models_dir
        os.makedirs(models_dir, exist_ok=True)

    def train_regression_on_td_dataset(self) -> Dict[str, Any]:
        """Trains regression model on real SZZ fault counts with Dummy baseline comparison."""
        print("\n" + "=" * 60)
        print("TRAINING REGRESSION MODEL ON REAL SZZ FAULT COUNTS")
        print("=" * 60)
        
        t0 = time.time()
        print(f"[*] Loading Gold features from {self.gold_path}...")
        df = pd.read_parquet(self.gold_path)
        print(f"[+] Loaded {len(df):,} Gold records across {df['project_id'].nunique()} projects.")

        feature_cols = [
            "lines_added",
            "lines_removed",
            "churn",
            "estimated_loc",
            "is_java",
            "is_test",
            "code_smells_count",
            "total_debt_minutes",
            "blocker_issues",
            "critical_issues",
            "major_issues",
            "minor_issues",
            "refactoring_count",
            "author_experience_commits"
        ]

        target_col = "fault_count"

        # Downsample or take representative stratified sample if > 250k for fast convergence
        if len(df) > 200000:
            print("  [*] Sampling 150,000 stratified/balanced commit-file records for rapid cross-validation...")
            # Include all positive defect records + random sample of non-defect records
            pos_df = df[df[target_col] > 0]
            neg_df = df[df[target_col] == 0].sample(n=min(100000, len(df[df[target_col] == 0])), random_state=42)
            sample_df = pd.concat([pos_df, neg_df]).sample(frac=1.0, random_state=42).reset_index(drop=True)
        else:
            sample_df = df

        X = sample_df[feature_cols].fillna(0)
        y = sample_df[target_col].values

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # 1. Baseline Dummy Regressor (Predict Mean)
        print("  [*] Evaluating Baseline DummyRegressor (Predict Mean)...")
        dummy = DummyRegressor(strategy="mean")
        dummy.fit(X_train, y_train)
        dummy_preds = dummy.predict(X_test)
        dummy_mae = float(mean_absolute_error(y_test, dummy_preds))
        dummy_rmse = float(np.sqrt(mean_squared_error(y_test, dummy_preds)))
        dummy_r2 = float(r2_score(y_test, dummy_preds))

        # 2. Random Forest Regressor
        print("  [*] Training Random Forest Regressor on real empirical data...")
        rf = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=10,
            min_samples_leaf=5,
            n_jobs=-1,
            random_state=42
        )
        rf.fit(X_train, y_train)
        rf_preds = rf.predict(X_test)

        rf_mae = float(mean_absolute_error(y_test, rf_preds))
        rf_rmse = float(np.sqrt(mean_squared_error(y_test, rf_preds)))
        rf_r2 = float(r2_score(y_test, rf_preds))

        # 3. 5-Fold Cross Validation
        print("  [*] Running 5-Fold Cross-Validation on Random Forest...")
        cv_scores = cross_val_score(rf, X_train, y_train, cv=5, scoring="r2", n_jobs=-1)
        cv_r2_mean = float(np.mean(cv_scores))
        cv_r2_std = float(np.std(cv_scores))

        # 4. Feature Importances
        importances = dict(zip(feature_cols, [round(float(v), 4) for v in rf.feature_importances_]))
        sorted_importances = dict(sorted(importances.items(), key=lambda item: item[1], reverse=True))

        mae_improvement_pct = round(((dummy_mae - rf_mae) / dummy_mae) * 100, 2)

        print(f"\n[+] Baseline DummyRegressor:")
        print(f"    MAE: {dummy_mae:.4f} | RMSE: {dummy_rmse:.4f} | R²: {dummy_r2:.4f}")
        print(f"[+] Random Forest Regressor (Real Outcomes):")
        print(f"    MAE: {rf_mae:.4f} | RMSE: {rf_rmse:.4f} | R²: {rf_r2:.4f} (5-Fold CV R²: {cv_r2_mean:.4f} ± {cv_r2_std:.4f})")
        print(f"    Error Reduction over Baseline: +{mae_improvement_pct}%")
        print(f"[+] Top Feature Importances:")
        for feat, imp in list(sorted_importances.items())[:6]:
            print(f"    • {feat}: {imp * 100:.1f}%")

        # Save Model
        model_artifact_path = os.path.join(self.models_dir, "real_defect_predictor.pkl")
        joblib.dump({
            "model": rf,
            "feature_names": feature_cols,
            "target_name": target_col,
            "trained_at": datetime.now(timezone.utc).isoformat(),
            "metrics": {
                "rf_mae": rf_mae,
                "rf_rmse": rf_rmse,
                "rf_r2": rf_r2,
                "cv_r2_mean": cv_r2_mean,
                "dummy_mae": dummy_mae,
                "dummy_r2": dummy_r2,
                "mae_improvement_pct": mae_improvement_pct
            }
        }, model_artifact_path)
        print(f"\n[+] Saved model artifact to {model_artifact_path}")

        return {
            "dataset": "The-Technical-Debt-Dataset (SZZ Ground Truth)",
            "samples_trained": len(X_train),
            "samples_tested": len(X_test),
            "features": feature_cols,
            "dummy_baseline": {"mae": dummy_mae, "rmse": dummy_rmse, "r2": dummy_r2},
            "random_forest": {
                "mae": rf_mae, "rmse": rf_rmse, "r2": rf_r2,
                "cv_r2_mean": cv_r2_mean, "cv_r2_std": cv_r2_std,
                "mae_improvement_pct": mae_improvement_pct
            },
            "feature_importances": sorted_importances,
            "model_path": model_artifact_path,
            "elapsed_sec": round(time.time() - t0, 2)
        }

    def train_classification_on_nasa_benchmarks(self) -> Dict[str, Any]:
        """Trains binary defect classification models on NASA JM1 and NASA PC1 datasets."""
        print("\n" + "=" * 60)
        print("TRAINING BINARY CLASSIFIERS ON NASA JM1 / PC1 BENCHMARKS")
        print("=" * 60)
        t0 = time.time()
        results = {}

        for dataset_name, fname in [("NASA-JM1", "jm1.csv"), ("NASA-PC1", "pc1.csv")]:
            fpath = os.path.join("external_dataset", fname)
            if not os.path.exists(fpath):
                print(f"[-] Dataset file not found: {fpath}")
                continue
                
            print(f"[*] Processing {dataset_name} ({fpath})...")
            df = pd.read_csv(fpath)
            
            # Identify target column (usually 'defects' or last column)
            target_candidates = ["defects", "Defective", "label", "problems"]
            target_col = next((c for c in target_candidates if c in df.columns), df.columns[-1])
            
            # Clean non-numeric feature columns (convert '?' to nan)
            X_df = df.drop(columns=[target_col]).copy()
            for col in X_df.columns:
                X_df[col] = pd.to_numeric(X_df[col].astype(str).str.replace("?", "nan", regex=False), errors="coerce").fillna(0.0)
                
            # Convert target to binary (0/1)
            y = df[target_col].astype(str).str.strip().str.lower().apply(lambda v: 1 if v in ["true", "y", "yes", "1", "1.0"] else 0).values

            X_train, X_test, y_train, y_test = train_test_split(X_df, y, test_size=0.2, random_state=42, stratify=y)

            # Baseline Dummy Classifier
            dummy_clf = DummyClassifier(strategy="stratified", random_state=42)
            dummy_clf.fit(X_train, y_train)
            dummy_probs = dummy_clf.predict_proba(X_test)[:, 1] if len(np.unique(y_train)) > 1 else np.zeros(len(y_test))
            dummy_auc = float(roc_auc_score(y_test, dummy_probs)) if len(np.unique(y_test)) > 1 else 0.5

            # Random Forest Classifier
            clf = RandomForestClassifier(n_estimators=100, max_depth=10, random_state=42, n_jobs=-1)
            clf.fit(X_train, y_train)
            y_pred = clf.predict(X_test)
            y_probs = clf.predict_proba(X_test)[:, 1]

            auc = float(roc_auc_score(y_test, y_probs)) if len(np.unique(y_test)) > 1 else 0.5
            acc = float(accuracy_score(y_test, y_pred))

            print(f"  [+] {dataset_name}: {len(df):,} modules | Positive Defects: {int(sum(y)):,} ({round(sum(y)/len(y)*100, 1)}%)")
            print(f"      Baseline Dummy AUC: {dummy_auc:.4f}")
            print(f"      Random Forest ROC-AUC: {auc:.4f} | Accuracy: {acc:.4f}")

            # Save classifier
            clf_path = os.path.join(self.models_dir, f"{fname.replace('.csv', '')}_classifier.pkl")
            joblib.dump(clf, clf_path)

            results[dataset_name] = {
                "rows": len(df),
                "features_count": len(X_df.columns),
                "defect_count": int(sum(y)),
                "dummy_auc": round(dummy_auc, 4),
                "rf_auc": round(auc, 4),
                "rf_accuracy": round(acc, 4),
                "model_path": clf_path
            }

        return results

    def run_training_suite(self) -> Dict[str, Any]:
        t_all = time.time()
        reg_res = self.train_regression_on_td_dataset()
        clf_res = self.train_classification_on_nasa_benchmarks()

        report = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "regression_td_dataset": reg_res,
            "classification_nasa_benchmarks": clf_res,
            "total_elapsed_sec": round(time.time() - t_all, 2)
        }

        report_path = os.path.join(self.models_dir, "metrics_report.json")
        with open(report_path, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)

        print(f"\n[SUCCESS] Full ML training suite complete in {report['total_elapsed_sec']}s. Metrics logged to {report_path}")
        return report

if __name__ == "__main__":
    trainer = RealDataModelTrainer()
    trainer.run_training_suite()
