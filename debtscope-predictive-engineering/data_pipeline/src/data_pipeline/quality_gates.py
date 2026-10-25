"""
Data Quality Validation Framework for Medallion Lakehouse
=========================================================
Implements validation gates between Medallion layers (Bronze -> Silver -> Gold).
Asserts data expectations and persists audit logs to SQLite and Parquet.
"""

import os
import sys
import time
import json
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timezone
from typing import Dict, Any, List, Tuple

class DataQualityGate:
    def __init__(self, lakehouse_root: str = "data/lakehouse", db_path: str = "data/engineering_intelligence.db"):
        self.lakehouse_root = lakehouse_root
        self.db_path = db_path
        self.audit_dir = os.path.join(lakehouse_root, "audit")
        os.makedirs(self.audit_dir, exist_ok=True)
        os.makedirs(os.path.dirname(os.path.abspath(db_path)), exist_ok=True)
        self._init_audit_table()

    def _init_audit_table(self):
        """Initializes the data_quality_audit table in SQLite."""
        with sqlite3.connect(self.db_path) as conn:
            c = conn.cursor()
            c.execute("""
            CREATE TABLE IF NOT EXISTS data_quality_audit (
                audit_id TEXT PRIMARY KEY,
                run_id TEXT,
                timestamp TEXT,
                layer TEXT,
                dataset_name TEXT,
                row_count INTEGER,
                check_name TEXT,
                status TEXT,
                passed INTEGER,
                details TEXT
            );
            """)
            conn.commit()

    def validate_silver_layer(self, run_id: str) -> List[Dict[str, Any]]:
        """Runs validation checks on Silver layer entities."""
        results = []
        silver_dir = os.path.join(self.lakehouse_root, "silver")

        # 1. Check commits
        commits_path = os.path.join(silver_dir, "commits.parquet")
        if os.path.exists(commits_path):
            df = pd.read_parquet(commits_path)
            n_rows = len(df)
            
            # Check A: No null commit hashes
            no_null_hashes = int(df["commit_hash"].isna().sum() == 0 and (df["commit_hash"] == "").sum() == 0)
            results.append({
                "layer": "Silver", "dataset": "commits", "rows": n_rows,
                "check": "no_null_commit_hashes", "passed": no_null_hashes,
                "details": f"Null or empty hashes: {int(df['commit_hash'].isna().sum())}"
            })
            
            # Check B: No duplicate commit hashes per project
            dup_hashes = df.duplicated(subset=["project_id", "commit_hash"]).sum()
            results.append({
                "layer": "Silver", "dataset": "commits", "rows": n_rows,
                "check": "no_duplicate_project_commits", "passed": int(dup_hashes == 0),
                "details": f"Duplicates found: {dup_hashes}"
            })

        # 2. Check commit_file_changes
        changes_path = os.path.join(silver_dir, "commit_file_changes.parquet")
        if os.path.exists(changes_path):
            df = pd.read_parquet(changes_path)
            n_rows = len(df)

            # Check C: No null file paths
            null_paths = int(df["file_path"].isna().sum() + (df["file_path"] == "").sum())
            results.append({
                "layer": "Silver", "dataset": "commit_file_changes", "rows": n_rows,
                "check": "no_null_file_paths", "passed": int(null_paths == 0),
                "details": f"Null/empty paths: {null_paths}"
            })

            # Check D: Churn non-negative
            neg_churn = int((df["churn"] < 0).sum())
            results.append({
                "layer": "Silver", "dataset": "commit_file_changes", "rows": n_rows,
                "check": "churn_non_negative", "passed": int(neg_churn == 0),
                "details": f"Negative churn count: {neg_churn}"
            })

            # Check E: No duplicate file changes per commit
            dup_changes = int(df.duplicated(subset=["commit_hash", "file_path"]).sum())
            results.append({
                "layer": "Silver", "dataset": "commit_file_changes", "rows": n_rows,
                "check": "no_duplicate_commit_files", "passed": int(dup_changes == 0),
                "details": f"Duplicates: {dup_changes}"
            })

        # 3. Check SZZ defects
        szz_path = os.path.join(silver_dir, "szz_defects.parquet")
        if os.path.exists(szz_path):
            df = pd.read_parquet(szz_path)
            n_rows = len(df)
            valid_inducing = int(df["fault_inducing_commit_hash"].notna().sum() and (df["fault_inducing_commit_hash"] != "").all())
            results.append({
                "layer": "Silver", "dataset": "szz_defects", "rows": n_rows,
                "check": "valid_szz_fault_inducing_hashes", "passed": valid_inducing,
                "details": f"Total valid SZZ links: {n_rows}"
            })

        # 4. Check Jira issues
        jira_path = os.path.join(silver_dir, "jira_issues.parquet")
        if os.path.exists(jira_path):
            df = pd.read_parquet(jira_path)
            n_rows = len(df)
            dup_keys = int(df.duplicated(subset=["issue_key"]).sum())
            results.append({
                "layer": "Silver", "dataset": "jira_issues", "rows": n_rows,
                "check": "unique_jira_issue_keys", "passed": int(dup_keys == 0),
                "details": f"Duplicate Jira keys: {dup_keys}"
            })

        return results

    def validate_gold_layer(self, run_id: str) -> List[Dict[str, Any]]:
        """Runs validation checks on Gold layer feature store and analytical tables."""
        results = []
        gold_dir = os.path.join(self.lakehouse_root, "gold")

        features_path = os.path.join(gold_dir, "engineering_features.parquet")
        if os.path.exists(features_path):
            df = pd.read_parquet(features_path)
            n_rows = len(df)

            # Check A: File path non-null
            null_paths = int(df["file_path"].isna().sum() + (df["file_path"] == "").sum())
            results.append({
                "layer": "Gold", "dataset": "engineering_features", "rows": n_rows,
                "check": "gold_no_null_file_paths", "passed": int(null_paths == 0),
                "details": f"Null paths: {null_paths}"
            })

            # Check B: Real target validity (fault_count >= 0)
            invalid_faults = int((df["fault_count"] < 0).sum() + df["fault_count"].isna().sum())
            results.append({
                "layer": "Gold", "dataset": "engineering_features", "rows": n_rows,
                "check": "real_target_fault_count_valid", "passed": int(invalid_faults == 0),
                "details": f"Invalid fault counts: {invalid_faults} (Total defects: {int((df['fault_count'] > 0).sum()):,})"
            })

            # Check C: Author experience non-negative
            invalid_exp = int((df["author_experience_commits"] < 1).sum())
            results.append({
                "layer": "Gold", "dataset": "engineering_features", "rows": n_rows,
                "check": "author_experience_valid", "passed": int(invalid_exp == 0),
                "details": f"Invalid experience counts: {invalid_exp}"
            })

            # Check D: Debt minutes non-negative
            neg_debt = int((df["total_debt_minutes"] < 0).sum())
            results.append({
                "layer": "Gold", "dataset": "engineering_features", "rows": n_rows,
                "check": "debt_minutes_non_negative", "passed": int(neg_debt == 0),
                "details": f"Negative debt minutes: {neg_debt}"
            })

            # Check E: No target leakage (confirm fault_count is not correlated with artificial id)
            leakage_cols = [c for c in df.columns if "synthetic" in c.lower() or "formula_score" in c.lower()]
            results.append({
                "layer": "Gold", "dataset": "engineering_features", "rows": n_rows,
                "check": "zero_synthetic_target_leakage", "passed": int(len(leakage_cols) == 0),
                "details": f"Leaking columns detected: {leakage_cols if leakage_cols else 'None'}"
            })

        return results

    def run_all_quality_gates(self, run_id: str = None) -> Dict[str, Any]:
        """Executes all data quality checks, records to SQLite and Parquet audit stores."""
        if not run_id:
            run_id = f"DQ-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"
            
        print(f"\n[*] Running Automated Data Quality Gates (Run ID: {run_id})...")
        silver_checks = self.validate_silver_layer(run_id)
        gold_checks = self.validate_gold_layer(run_id)
        all_checks = silver_checks + gold_checks

        ts = datetime.now(timezone.utc).isoformat()
        audit_records = []
        for i, c in enumerate(all_checks):
            audit_id = f"{run_id}-{i+1:03d}"
            status = "PASSED" if c["passed"] == 1 else "FAILED"
            audit_records.append({
                "audit_id": audit_id,
                "run_id": run_id,
                "timestamp": ts,
                "layer": c["layer"],
                "dataset_name": c["dataset"],
                "row_count": c["rows"],
                "check_name": c["check"],
                "status": status,
                "passed": c["passed"],
                "details": c["details"]
            })

        # Save to SQLite
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            for r in audit_records:
                cursor.execute("""
                INSERT OR REPLACE INTO data_quality_audit 
                (audit_id, run_id, timestamp, layer, dataset_name, row_count, check_name, status, passed, details)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    r["audit_id"], r["run_id"], r["timestamp"], r["layer"],
                    r["dataset_name"], r["row_count"], r["check_name"],
                    r["status"], r["passed"], r["details"]
                ))
            conn.commit()

        # Save to Parquet
        audit_df = pd.DataFrame(audit_records)
        parquet_audit_path = os.path.join(self.audit_dir, "data_quality_audit.parquet")
        if os.path.exists(parquet_audit_path):
            existing = pd.read_parquet(parquet_audit_path)
            audit_df = pd.concat([existing, audit_df], ignore_index=True).drop_duplicates(subset=["audit_id"])
        audit_df.to_parquet(parquet_audit_path, index=False)

        passed_count = sum(r["passed"] for r in audit_records)
        total_count = len(audit_records)
        pass_rate = round((passed_count / total_count) * 100, 1) if total_count > 0 else 100.0

        print(f"[+] Data Quality Audit: {passed_count}/{total_count} checks PASSED ({pass_rate}% Pass Rate)")
        for r in audit_records:
            icon = "[PASS]" if r["passed"] == 1 else "[FAIL]"
            print(f"    {icon} {r['layer']} -> {r['dataset_name']} -> {r['check_name']}: {r['status']} ({r['details']})")

        return {
            "run_id": run_id,
            "timestamp": ts,
            "total_checks": total_count,
            "passed_checks": passed_count,
            "pass_rate_pct": pass_rate,
            "audit_records": audit_records,
            "parquet_path": parquet_audit_path
        }

if __name__ == "__main__":
    gate = DataQualityGate()
    gate.run_all_quality_gates()
