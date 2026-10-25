"""
Medallion Architecture Pipeline for The Technical Debt Dataset
==============================================================
Transforms raw SQLite relational tables from The Technical Debt Dataset (PROMISE '19)
into a production-grade Medallion Lakehouse (Bronze -> Silver -> Gold)
with real SZZ defect outcomes (no synthetic formulas / target leakage).
"""

import os
import sys
import time
import json
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime
from typing import Dict, Any, List, Tuple, Optional

class MedallionPipeline:
    def __init__(self, db_path: str = "external_dataset/td_V2.db", lakehouse_root: str = "data/lakehouse"):
        # Fallback to downloads if external_dataset doesn't exist
        if not os.path.exists(db_path) and os.path.exists(r"C:\Users\dhruv\Downloads\td_V2.db"):
            db_path = r"C:\Users\dhruv\Downloads\td_V2.db"
            
        self.db_path = db_path
        self.lakehouse_root = lakehouse_root
        self.bronze_dir = os.path.join(lakehouse_root, "bronze")
        self.silver_dir = os.path.join(lakehouse_root, "silver")
        self.gold_dir = os.path.join(lakehouse_root, "gold")
        
        for d in [self.bronze_dir, self.silver_dir, self.gold_dir]:
            os.makedirs(d, exist_ok=True)

    def get_conn(self) -> sqlite3.Connection:
        return sqlite3.connect(self.db_path)

    # ==========================================
    # BRONZE LAYER: Raw Extraction to Parquet
    # ==========================================
    def run_bronze(self) -> Dict[str, Any]:
        """Extracts all raw tables directly from SQLite to Bronze Parquet partitions."""
        print("\n" + "=" * 60)
        print("STAGE 1: INGESTING BRONZE LAYER (RAW PARQUET)")
        print("=" * 60)
        t0 = time.time()
        conn = self.get_conn()
        
        tables = [
            "PROJECTS",
            "GIT_COMMITS",
            "GIT_COMMITS_CHANGES",
            "SONAR_ANALYSIS",
            "SONAR_MEASURES",
            "SONAR_ISSUES",
            "SONAR_RULES",
            "JIRA_ISSUES",
            "SZZ_FAULT_INDUCING_COMMITS",
            "REFACTORING_MINER"
        ]
        
        bronze_stats = {}
        for table in tables:
            tb_t0 = time.time()
            out_file = os.path.join(self.bronze_dir, f"{table.lower()}.parquet")
            
            df = pd.read_sql_query(f"SELECT * FROM `{table}`", conn)
            row_count = len(df)
            
            # Clean empty strings so pyarrow schema inference does not conflict
            for c in df.columns:
                if df[c].dtype == object:
                    df[c] = df[c].replace({"": None})
            
            df.to_parquet(out_file, index=False, engine="pyarrow")
            
            elapsed = round(time.time() - tb_t0, 2)
            bronze_stats[table.lower()] = {
                "rows": row_count,
                "columns": len(df.columns),
                "file_size_mb": round(os.path.getsize(out_file) / (1024 * 1024), 2),
                "path": out_file,
                "elapsed_sec": elapsed
            }
            print(f"  [+] Bronze `{table.lower()}`: {row_count:,} rows saved to Parquet ({bronze_stats[table.lower()]['file_size_mb']} MB) in {elapsed}s")
            
        conn.close()
        total_time = round(time.time() - t0, 2)
        print(f"[SUCCESS] Bronze ingestion complete in {total_time}s across {len(tables)} tables.\n")
        return {"layer": "bronze", "tables": bronze_stats, "total_elapsed_sec": total_time}

    # ==========================================
    # SILVER LAYER: Cleaning, Typing & Enrichment
    # ==========================================
    @staticmethod
    def _parse_effort_to_minutes(val: Any) -> float:
        """Parses SonarQube effort strings like '5min', '1h', '2h 30min', '1d' into float minutes."""
        if pd.isna(val) or val is None or str(val).strip() == "":
            return 0.0
        s = str(val).strip().lower()
        total = 0.0
        try:
            parts = s.split()
            for p in parts:
                if p.endswith("min") or p.endswith("m"):
                    num = float(p.replace("min", "").replace("m", ""))
                    total += num
                elif p.endswith("h") or p.endswith("hr") or p.endswith("hours"):
                    num = float(p.replace("hours", "").replace("hour", "").replace("hr", "").replace("h", ""))
                    total += num * 60.0
                elif p.endswith("d") or p.endswith("days") or p.endswith("day"):
                    num = float(p.replace("days", "").replace("day", "").replace("d", ""))
                    total += num * 8.0 * 60.0 # Standard 8-hour workday
                else:
                    total += float(p)
            return float(total)
        except Exception:
            return 0.0

    def run_silver(self) -> Dict[str, Any]:
        """Cleans, normalizes, types, and computes core relational entities."""
        print("\n" + "=" * 60)
        print("STAGE 2: TRANSFORMING SILVER LAYER (CLEANED & TYPED)")
        print("=" * 60)
        t0 = time.time()
        silver_stats = {}

        # 1. Projects
        p_df = pd.read_parquet(os.path.join(self.bronze_dir, "projects.parquet"))
        p_silver = pd.DataFrame({
            "project_id": p_df["PROJECT_ID"].astype(str).str.strip(),
            "project_key": p_df["PROJECT_KEY"].astype(str).str.strip(),
            "git_url": p_df["GIT_LINK"].astype(str).str.strip(),
            "jira_url": p_df["JIRA_LINK"].astype(str).str.strip(),
            "sonar_key": p_df["SONAR_PROJECT_KEY"].astype(str).str.strip()
        }).drop_duplicates(subset=["project_id"])
        p_silver_path = os.path.join(self.silver_dir, "repositories.parquet")
        p_silver.to_parquet(p_silver_path, index=False)
        silver_stats["repositories"] = {"rows": len(p_silver), "path": p_silver_path}
        print(f"  [+] Silver `repositories`: {len(p_silver):,} clean projects")

        # 2. Commits
        c_df = pd.read_parquet(os.path.join(self.bronze_dir, "git_commits.parquet"))
        c_silver = pd.DataFrame({
            "commit_hash": c_df["COMMIT_HASH"].astype(str).str.strip(),
            "project_id": c_df["PROJECT_ID"].astype(str).str.strip(),
            "author_name": c_df["AUTHOR"].fillna("Unknown").astype(str).str.strip(),
            "author_date": pd.to_datetime(c_df["AUTHOR_DATE"], errors="coerce", utc=True),
            "committer_name": c_df["COMMITTER"].fillna("Unknown").astype(str).str.strip(),
            "committer_date": pd.to_datetime(c_df["COMMITTER_DATE"], errors="coerce", utc=True),
            "commit_message": c_df["COMMIT_MESSAGE"].fillna("").astype(str),
            "is_merge": c_df["MERGE"].astype(bool),
            "in_main_branch": c_df["IN_MAIN_BRANCH"].astype(bool)
        }).drop_duplicates(subset=["commit_hash", "project_id"])
        c_silver_path = os.path.join(self.silver_dir, "commits.parquet")
        c_silver.to_parquet(c_silver_path, index=False)
        silver_stats["commits"] = {"rows": len(c_silver), "path": c_silver_path}
        print(f"  [+] Silver `commits`: {len(c_silver):,} deduplicated commits")

        # 3. Commit File Changes & Churn
        ch_df = pd.read_parquet(os.path.join(self.bronze_dir, "git_commits_changes.parquet"))
        ch_silver = pd.DataFrame({
            "project_id": ch_df["PROJECT_ID"].astype(str).str.strip(),
            "commit_hash": ch_df["COMMIT_HASH"].astype(str).str.strip(),
            "file_path": ch_df["FILE"].astype(str).str.strip(),
            "lines_added": pd.to_numeric(ch_df["LINES_ADDED"], errors="coerce").fillna(0).astype(int),
            "lines_removed": pd.to_numeric(ch_df["LINES_REMOVED"], errors="coerce").fillna(0).astype(int),
            "change_date": pd.to_datetime(ch_df["DATE"], errors="coerce", utc=True)
        })
        ch_silver["churn"] = ch_silver["lines_added"] + ch_silver["lines_removed"]
        ch_silver = ch_silver.drop_duplicates(subset=["commit_hash", "file_path"])
        ch_silver_path = os.path.join(self.silver_dir, "commit_file_changes.parquet")
        ch_silver.to_parquet(ch_silver_path, index=False)
        silver_stats["commit_file_changes"] = {"rows": len(ch_silver), "path": ch_silver_path}
        print(f"  [+] Silver `commit_file_changes`: {len(ch_silver):,} file modification records")

        # 4. SZZ Ground-Truth Fault Labels
        szz_df = pd.read_parquet(os.path.join(self.bronze_dir, "szz_fault_inducing_commits.parquet"))
        szz_silver = pd.DataFrame({
            "project_id": szz_df["PROJECT_ID"].astype(str).str.strip(),
            "fault_fixing_commit_hash": szz_df["FAULT_FIXING_COMMIT_HASH"].astype(str).str.strip(),
            "fault_inducing_commit_hash": szz_df["FAULT_INDUCING_COMMIT_HASH"].astype(str).str.strip()
        }).drop_duplicates()
        szz_silver = szz_silver[(szz_silver["fault_inducing_commit_hash"] != "") & (szz_silver["fault_inducing_commit_hash"] != "None")]
        szz_silver_path = os.path.join(self.silver_dir, "szz_defects.parquet")
        szz_silver.to_parquet(szz_silver_path, index=False)
        silver_stats["szz_defects"] = {"rows": len(szz_silver), "path": szz_silver_path}
        print(f"  [+] Silver `szz_defects`: {len(szz_silver):,} validated SZZ fault-fix links")

        # 5. Jira Issues & Defects
        j_df = pd.read_parquet(os.path.join(self.bronze_dir, "jira_issues.parquet"))
        j_silver = pd.DataFrame({
            "project_id": j_df["PROJECT_ID"].astype(str).str.strip(),
            "issue_key": j_df["KEY"].astype(str).str.strip(),
            "issue_type": j_df["TYPE"].fillna("Unknown").astype(str).str.strip(),
            "priority": j_df["PRIORITY"].fillna("Major").astype(str).str.strip(),
            "status": j_df["STATUS"].fillna("Closed").astype(str).str.strip(),
            "resolution": j_df["RESOLUTION"].fillna("").astype(str).str.strip(),
            "created_at": pd.to_datetime(j_df["CREATION_DATE"], errors="coerce", utc=True),
            "resolved_at": pd.to_datetime(j_df["RESOLUTION_DATE"], errors="coerce", utc=True),
            "summary": j_df["SUMMARY"].fillna("").astype(str)
        }).drop_duplicates(subset=["issue_key"])
        j_silver["resolution_days"] = (j_silver["resolved_at"] - j_silver["created_at"]).dt.total_seconds() / (24 * 3600)
        j_silver["resolution_days"] = j_silver["resolution_days"].apply(lambda x: max(0.0, x) if pd.notna(x) else None)
        j_silver_path = os.path.join(self.silver_dir, "jira_issues.parquet")
        j_silver.to_parquet(j_silver_path, index=False)
        silver_stats["jira_issues"] = {"rows": len(j_silver), "path": j_silver_path}
        print(f"  [+] Silver `jira_issues`: {len(j_silver):,} Jira issues")

        # 6. Sonar Analysis Bridge
        sa_df = pd.read_parquet(os.path.join(self.bronze_dir, "sonar_analysis.parquet"))
        sa_silver = pd.DataFrame({
            "analysis_key": sa_df["ANALYSIS_KEY"].astype(str).str.strip(),
            "project_id": sa_df["PROJECT_ID"].astype(str).str.strip(),
            "commit_hash": sa_df["REVISION"].astype(str).str.strip(),
            "analysis_date": pd.to_datetime(sa_df["DATE"], errors="coerce")
        }).drop_duplicates(subset=["analysis_key"])
        sa_silver_path = os.path.join(self.silver_dir, "sonar_analysis_bridge.parquet")
        sa_silver.to_parquet(sa_silver_path, index=False)
        silver_stats["sonar_analysis_bridge"] = {"rows": len(sa_silver), "path": sa_silver_path}
        print(f"  [+] Silver `sonar_analysis_bridge`: {len(sa_silver):,} snapshot mappings")

        # 7. Sonar Measures
        sm_df = pd.read_parquet(os.path.join(self.bronze_dir, "sonar_measures.parquet"))
        sm_silver = pd.DataFrame({
            "analysis_key": sm_df["ANALYSIS_KEY"].astype(str).str.strip(),
            "project_id": sm_df["PROJECT_ID"].astype(str).str.strip(),
            "ncloc": pd.to_numeric(sm_df["NCLOC"], errors="coerce").fillna(0).astype(int),
            "lines": pd.to_numeric(sm_df["LINES"], errors="coerce").fillna(0).astype(int),
            "classes": pd.to_numeric(sm_df["CLASSES"], errors="coerce").fillna(0).astype(int),
            "files": pd.to_numeric(sm_df["FILES"], errors="coerce").fillna(0).astype(int),
            "cyclomatic_complexity": pd.to_numeric(sm_df["COMPLEXITY"], errors="coerce").fillna(0).astype(float),
            "cognitive_complexity": pd.to_numeric(sm_df["COGNITIVE_COMPLEXITY"], errors="coerce").fillna(0).astype(float),
            "code_smells": pd.to_numeric(sm_df["CODE_SMELLS"], errors="coerce").fillna(0).astype(int),
            "bugs": pd.to_numeric(sm_df["BUGS"], errors="coerce").fillna(0).astype(int),
            "vulnerabilities": pd.to_numeric(sm_df["VULNERABILITIES"], errors="coerce").fillna(0).astype(int),
            "duplicated_lines": pd.to_numeric(sm_df["DUPLICATED_LINES"], errors="coerce").fillna(0).astype(int),
            "duplicated_lines_density": pd.to_numeric(sm_df["DUPLICATED_LINES_DENSITY"], errors="coerce").fillna(0.0).astype(float),
            "sqale_index": pd.to_numeric(sm_df["SQALE_INDEX"], errors="coerce").fillna(0.0).astype(float),
            "sqale_debt_ratio": pd.to_numeric(sm_df["SQALE_DEBT_RATIO"], errors="coerce").fillna(0.0).astype(float)
        }).drop_duplicates(subset=["analysis_key"])
        sm_silver_path = os.path.join(self.silver_dir, "sonar_measures.parquet")
        sm_silver.to_parquet(sm_silver_path, index=False)
        silver_stats["sonar_measures"] = {"rows": len(sm_silver), "path": sm_silver_path}
        print(f"  [+] Silver `sonar_measures`: {len(sm_silver):,} snapshot metric summaries")

        # 8. Sonar & Ptidej Issues
        si_df = pd.read_parquet(os.path.join(self.bronze_dir, "sonar_issues.parquet"))
        si_silver = pd.DataFrame({
            "issue_key": si_df["ISSUE_KEY"].astype(str).str.strip(),
            "project_id": si_df["PROJECT_ID"].astype(str).str.strip(),
            "analysis_key": si_df["CREATION_ANALYSIS_KEY"].astype(str).str.strip(),
            "rule": si_df["RULE"].astype(str).str.strip(),
            "issue_type": si_df["TYPE"].astype(str).str.strip(),
            "severity": si_df["SEVERITY"].fillna("INFO").astype(str).str.strip(),
            "status": si_df["STATUS"].fillna("OPEN").astype(str).str.strip(),
            "file_path": si_df["COMPONENT"].astype(str).str.strip(),
            "start_line": pd.to_numeric(si_df["START_LINE"], errors="coerce").fillna(1).astype(int),
            "end_line": pd.to_numeric(si_df["END_LINE"], errors="coerce").fillna(1).astype(int),
            "effort_raw": si_df["EFFORT"].fillna("").astype(str)
        })
        si_silver["effort_minutes"] = si_silver["effort_raw"].apply(self._parse_effort_to_minutes)
        si_silver["is_ptidej_smell"] = si_silver["rule"].str.startswith("code_smells:")
        si_silver = si_silver.drop_duplicates(subset=["issue_key"])
        si_silver_path = os.path.join(self.silver_dir, "technical_debt_issues.parquet")
        si_silver.to_parquet(si_silver_path, index=False)
        silver_stats["technical_debt_issues"] = {"rows": len(si_silver), "path": si_silver_path}
        print(f"  [+] Silver `technical_debt_issues`: {len(si_silver):,} classified issues & code smells")

        # 9. Refactorings
        rf_df = pd.read_parquet(os.path.join(self.bronze_dir, "refactoring_miner.parquet"))
        rf_silver = pd.DataFrame({
            "project_id": rf_df["PROJECT_ID"].astype(str).str.strip(),
            "commit_hash": rf_df["COMMIT_HASH"].astype(str).str.strip(),
            "refactoring_type": rf_df["REFACTORING_TYPE"].astype(str).str.strip(),
            "refactoring_detail": rf_df["REFACTORING_DETAIL"].fillna("").astype(str)
        })
        rf_silver_path = os.path.join(self.silver_dir, "refactorings.parquet")
        rf_silver.to_parquet(rf_silver_path, index=False)
        silver_stats["refactorings"] = {"rows": len(rf_silver), "path": rf_silver_path}
        print(f"  [+] Silver `refactorings`: {len(rf_silver):,} refactoring operations")

        total_time = round(time.time() - t0, 2)
        print(f"[SUCCESS] Silver transformation complete in {total_time}s across {len(silver_stats)} entities.\n")
        return {"layer": "silver", "tables": silver_stats, "total_elapsed_sec": total_time}

    # ==========================================
    # GOLD LAYER: ML Feature Store & Outcomes
    # ==========================================
    def run_gold(self) -> Dict[str, Any]:
        """
        Builds the Gold feature store and analytics tables.
        CRITICAL: ML target is the REAL count of SZZ fault-inducing occurrences.
        NO artificial formulas or target leakage.
        """
        print("\n" + "=" * 60)
        print("STAGE 3: BUILDING GOLD LAYER (ML FEATURE STORE & ANALYTICS)")
        print("=" * 60)
        t0 = time.time()

        # Load necessary Silver tables
        changes_df = pd.read_parquet(os.path.join(self.silver_dir, "commit_file_changes.parquet"))
        commits_df = pd.read_parquet(os.path.join(self.silver_dir, "commits.parquet"))
        szz_df = pd.read_parquet(os.path.join(self.silver_dir, "szz_defects.parquet"))
        sonar_bridge = pd.read_parquet(os.path.join(self.silver_dir, "sonar_analysis_bridge.parquet"))
        sonar_issues = pd.read_parquet(os.path.join(self.silver_dir, "technical_debt_issues.parquet"))
        refactorings = pd.read_parquet(os.path.join(self.silver_dir, "refactorings.parquet"))

        print("  [*] Aggregating SZZ ground-truth fault induction labels per commit...")
        szz_commit_counts = szz_df.groupby(["project_id", "fault_inducing_commit_hash"]).size().reset_index(name="fault_count")
        szz_commit_counts.rename(columns={"fault_inducing_commit_hash": "commit_hash"}, inplace=True)
        print(f"    -> {len(szz_commit_counts):,} commits with historical defect inductions")

        print("  [*] Aggregating refactoring intensity per commit...")
        rf_counts = refactorings.groupby(["project_id", "commit_hash"]).size().reset_index(name="refactoring_count")

        print("  [*] Aggregating SonarQube & Ptidej issues per snapshot & file component...")
        issues_agg = sonar_issues.groupby(["analysis_key", "file_path"]).agg(
            code_smells_count=("is_ptidej_smell", lambda x: int(sum(x))),
            total_debt_minutes=("effort_minutes", "sum"),
            blocker_issues=("severity", lambda x: int(sum(x == "BLOCKER"))),
            critical_issues=("severity", lambda x: int(sum(x == "CRITICAL"))),
            major_issues=("severity", lambda x: int(sum(x == "MAJOR"))),
            minor_issues=("severity", lambda x: int(sum(x == "MINOR")))
        ).reset_index()

        issues_with_hash = issues_agg.merge(
            sonar_bridge[["analysis_key", "commit_hash"]],
            on="analysis_key",
            how="inner"
        )

        print("  [*] Constructing file-level engineering feature matrix...")
        gold_df = changes_df.merge(
            commits_df[["commit_hash", "project_id", "author_name", "author_date", "is_merge"]],
            on=["commit_hash", "project_id"],
            how="left"
        )

        # Merge SZZ fault outcomes (Real Target)
        gold_df = gold_df.merge(
            szz_commit_counts,
            on=["project_id", "commit_hash"],
            how="left"
        )
        gold_df["fault_count"] = gold_df["fault_count"].fillna(0).astype(int)
        gold_df["has_defect"] = (gold_df["fault_count"] > 0).astype(int)

        # Merge Refactorings
        gold_df = gold_df.merge(
            rf_counts,
            on=["project_id", "commit_hash"],
            how="left"
        )
        gold_df["refactoring_count"] = gold_df["refactoring_count"].fillna(0).astype(int)

        # Merge Sonar issues
        gold_df = gold_df.merge(
            issues_with_hash.drop(columns=["analysis_key"]),
            on=["commit_hash", "file_path"],
            how="left"
        )
        for col in ["code_smells_count", "total_debt_minutes", "blocker_issues", "critical_issues", "major_issues", "minor_issues"]:
            gold_df[col] = gold_df[col].fillna(0.0)

        # Compute author experience
        print("  [*] Calculating author experience and temporal signals...")
        gold_df.sort_values(by=["author_name", "author_date"], inplace=True)
        gold_df["author_experience_commits"] = gold_df.groupby("author_name").cumcount() + 1

        # File extension & characteristics
        gold_df["file_extension"] = gold_df["file_path"].apply(lambda p: os.path.splitext(str(p))[1].lower() if pd.notna(p) else "")
        gold_df["is_java"] = (gold_df["file_extension"] == ".java").astype(int)
        gold_df["is_test"] = gold_df["file_path"].astype(str).apply(lambda p: 1 if "test" in p.lower() else 0)
        gold_df["estimated_loc"] = (gold_df["lines_added"] - gold_df["lines_removed"]).clip(lower=10)

        # Save Gold ML Feature Matrix
        gold_features_path = os.path.join(self.gold_dir, "engineering_features.parquet")
        gold_df.to_parquet(gold_features_path, index=False)
        print(f"  [+] Gold `engineering_features`: {len(gold_df):,} rows saved ({round(os.path.getsize(gold_features_path)/(1024*1024), 2)} MB)")

        # 2. Project Health Time Series
        print("  [*] Aggregating Gold `project_health_summary`...")
        proj_health = gold_df.groupby(["project_id"]).agg(
            total_commits=("commit_hash", "nunique"),
            total_files_modified=("file_path", "nunique"),
            total_lines_added=("lines_added", "sum"),
            total_lines_removed=("lines_removed", "sum"),
            total_churn=("churn", "sum"),
            total_fault_inducing_commits=("has_defect", "sum"),
            total_refactorings=("refactoring_count", "sum"),
            total_code_smells=("code_smells_count", "sum"),
            total_debt_hours=("total_debt_minutes", lambda x: round(sum(x) / 60.0, 2))
        ).reset_index()
        proj_health["defect_density_per_kloc"] = (
            (proj_health["total_fault_inducing_commits"] / (proj_health["total_lines_added"] / 1000.0).clip(lower=1.0))
        ).round(2)
        proj_health_path = os.path.join(self.gold_dir, "project_health_summary.parquet")
        proj_health.to_parquet(proj_health_path, index=False)
        print(f"  [+] Gold `project_health_summary`: {len(proj_health)} projects")

        # 3. Developer Analytics
        print("  [*] Aggregating Gold `developer_analytics`...")
        dev_stats = gold_df.groupby(["author_name"]).agg(
            total_commits=("commit_hash", "nunique"),
            total_churn=("churn", "sum"),
            total_faults_induced=("has_defect", "sum"),
            total_refactorings=("refactoring_count", "sum"),
            first_seen=("author_date", "min"),
            last_seen=("author_date", "max")
        ).reset_index()
        dev_stats = dev_stats[dev_stats["author_name"] != "Unknown"]
        dev_stats_path = os.path.join(self.gold_dir, "developer_analytics.parquet")
        dev_stats.to_parquet(dev_stats_path, index=False)
        print(f"  [+] Gold `developer_analytics`: {len(dev_stats):,} developers")

        total_time = round(time.time() - t0, 2)
        print(f"[SUCCESS] Gold transformation complete in {total_time}s.\n")
        return {
            "layer": "gold",
            "features_rows": len(gold_df),
            "features_path": gold_features_path,
            "project_health_path": proj_health_path,
            "developer_analytics_path": dev_stats_path,
            "total_elapsed_sec": total_time
        }

    def run_full_pipeline(self) -> Dict[str, Any]:
        t_start = time.time()
        print("=================================================================")
        print("STARTING FULL MEDALLION TRANSFORMATION PIPELINE")
        print(f"Source Database: {self.db_path}")
        print(f"Lakehouse Directory: {self.lakehouse_root}")
        print("=================================================================")
        
        bronze_res = self.run_bronze()
        silver_res = self.run_silver()
        gold_res = self.run_gold()
        
        total_time = round(time.time() - t_start, 2)
        print("=" * 60)
        print(f"MEDALLION PIPELINE EXECUTION COMPLETED IN {total_time}s")
        print("=" * 60)
        
        return {
            "status": "SUCCESS",
            "total_duration_sec": total_time,
            "bronze": bronze_res,
            "silver": silver_res,
            "gold": gold_res
        }

if __name__ == "__main__":
    src_db = sys.argv[1] if len(sys.argv) > 1 else "external_dataset/td_V2.db"
    lakehouse = sys.argv[2] if len(sys.argv) > 2 else "data/lakehouse"
    pipeline = MedallionPipeline(src_db, lakehouse)
    pipeline.run_full_pipeline()
