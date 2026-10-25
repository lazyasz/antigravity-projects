"""
Data Cleaning and Validation Layer (ETL)
Enforces schemas, removes duplicate records, imputes missing values,
and sanitizes engineering metrics with comprehensive audit logging.
"""

import os
import json
from datetime import datetime
from typing import Dict, Any, List, Tuple

SEVERITY_DEFAULT_HOURS = {
    "CRITICAL": 32.0,
    "HIGH": 20.0,
    "MEDIUM": 10.0,
    "LOW": 4.0
}

VALID_SEVERITIES = {"CRITICAL", "HIGH", "MEDIUM", "LOW"}

def safe_int(val: Any, default: int = 0) -> int:
    """Safely converts a value to integer with graceful fallback."""
    if val is None:
        return default
    try:
        return int(float(val))
    except (ValueError, TypeError):
        return default

def safe_float(val: Any, default: float = 0.0) -> float:
    """Safely converts a value to float with graceful fallback."""
    if val is None:
        return default
    try:
        return float(val)
    except (ValueError, TypeError):
        return default

class DataCleaningPipeline:
    """
    Cleans raw engineering datasets and produces sanitized records
    suitable for distributed PySpark transformations.
    """
    def __init__(self, processed_dir: str = "data/processed"):
        self.processed_dir = processed_dir
        os.makedirs(processed_dir, exist_ok=True)
        self.audit_log = {
            "cleaned_at": datetime.utcnow().isoformat() + "Z",
            "duplicates_removed": 0,
            "nulls_imputed": 0,
            "anomalies_sanitized": 0,
            "entity_stats": {}
        }

    def clean_files(self, raw_files: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cleans and validates file records."""
        seen_keys = set()
        cleaned = []
        for f in raw_files:
            key = (f.get("repo_id"), f.get("file_path"))
            if key in seen_keys:
                self.audit_log["duplicates_removed"] += 1
                continue
            seen_keys.add(key)
            
            record = dict(f)
            # Validate & sanitize LOC
            loc_raw = record.get("loc")
            loc = safe_int(loc_raw, 100) if loc_raw is not None else None
            if loc is None or loc < 0:
                record["loc"] = max(0, abs(loc) if loc is not None else 100)
                self.audit_log["anomalies_sanitized"] += 1
            else:
                record["loc"] = loc
                
            # Validate complexity
            cc_raw = record.get("cyclomatic_complexity")
            cc = safe_float(cc_raw, 1.0) if cc_raw is not None else None
            if cc is None or cc <= 0:
                record["cyclomatic_complexity"] = 1.0
                self.audit_log["nulls_imputed"] += 1
            else:
                record["cyclomatic_complexity"] = cc
                
            cog_raw = record.get("cognitive_complexity")
            cog = safe_float(cog_raw, 1.0) if cog_raw is not None else None
            if cog is None or cog < 0:
                record["cognitive_complexity"] = 1.0
                self.audit_log["nulls_imputed"] += 1
            else:
                record["cognitive_complexity"] = cog
                
            smells_raw = record.get("code_smells")
            smells = safe_int(smells_raw, 0) if smells_raw is not None else None
            if smells is None or smells < 0:
                record["code_smells"] = 0
                self.audit_log["nulls_imputed"] += 1
            else:
                record["code_smells"] = smells
                
            cleaned.append(record)
        return cleaned

    def clean_commits(self, raw_commits: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cleans commit records, dedupes by commit_hash, imputes missing authors."""
        seen_hashes = set()
        cleaned = []
        now = datetime.utcnow()
        for c in raw_commits:
            h = c.get("commit_hash")
            if not h or h in seen_hashes:
                self.audit_log["duplicates_removed"] += 1
                continue
            seen_hashes.add(h)
            
            record = dict(c)
            # Handle author
            if not record.get("author_id"):
                record["author_id"] = "unknown_contributor"
                self.audit_log["nulls_imputed"] += 1
                
            # Validate timestamp
            ts_str = record.get("commit_timestamp")
            if not ts_str:
                record["commit_timestamp"] = now.isoformat() + "Z"
                self.audit_log["nulls_imputed"] += 1
            else:
                try:
                    ts = datetime.fromisoformat(ts_str.replace("Z", ""))
                    if ts > now:
                        record["commit_timestamp"] = now.isoformat() + "Z"
                        self.audit_log["anomalies_sanitized"] += 1
                except Exception:
                    record["commit_timestamp"] = now.isoformat() + "Z"
                    self.audit_log["anomalies_sanitized"] += 1
                    
            cleaned.append(record)
        return cleaned

    def clean_commit_file_changes(self, raw_changes: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cleans file change records, dedupes by (commit_id, file_id), fixes negative churn."""
        seen_pairs = set()
        cleaned = []
        for ch in raw_changes:
            pair = (ch.get("commit_id"), ch.get("file_id"))
            if pair in seen_pairs:
                self.audit_log["duplicates_removed"] += 1
                continue
            seen_pairs.add(pair)
            
            record = dict(ch)
            adds_raw = record.get("additions", 0)
            dels_raw = record.get("deletions", 0)
            adds = safe_int(adds_raw, 0)
            dels = safe_int(dels_raw, 0)
            if adds < 0:
                adds = abs(adds)
                self.audit_log["anomalies_sanitized"] += 1
            if dels < 0:
                dels = abs(dels)
                self.audit_log["anomalies_sanitized"] += 1
                
            record["additions"] = int(adds)
            record["deletions"] = int(dels)
            record["churn"] = int(adds + dels)
            cleaned.append(record)
        return cleaned

    def clean_issues(self, raw_issues: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cleans issue records, normalizes severity, imputes effort hours."""
        seen_ids = set()
        cleaned = []
        for iss in raw_issues:
            iss_id = iss.get("id")
            if not iss_id or iss_id in seen_ids:
                self.audit_log["duplicates_removed"] += 1
                continue
            seen_ids.add(iss_id)
            
            record = dict(iss)
            sev = record.get("severity")
            if not sev or sev.upper() not in VALID_SEVERITIES:
                sev = "MEDIUM"
                record["severity"] = sev
                self.audit_log["nulls_imputed"] += 1
            else:
                record["severity"] = sev.upper()
                
            effort_raw = record.get("remediation_effort_hours")
            effort = safe_float(effort_raw, 0.0) if effort_raw is not None else None
            if effort is None or effort <= 0:
                record["remediation_effort_hours"] = SEVERITY_DEFAULT_HOURS.get(record["severity"], 10.0)
                self.audit_log["nulls_imputed"] += 1
            else:
                record["remediation_effort_hours"] = effort
                
            cleaned.append(record)
        return cleaned

    def clean_defects(self, raw_defects: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cleans defect records."""
        seen_ids = set()
        cleaned = []
        for d in raw_defects:
            d_id = d.get("id")
            if not d_id or d_id in seen_ids:
                self.audit_log["duplicates_removed"] += 1
                continue
            seen_ids.add(d_id)
            
            record = dict(d)
            sev = record.get("bug_severity")
            if not sev or sev.upper() not in VALID_SEVERITIES:
                record["bug_severity"] = "MEDIUM"
                self.audit_log["nulls_imputed"] += 1
            else:
                record["bug_severity"] = sev.upper()
            cleaned.append(record)
        return cleaned

    def clean_dependencies(self, raw_deps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Cleans dependency records."""
        cleaned = []
        for dep in raw_deps:
            record = dict(dep)
            age_raw = record.get("age_days")
            age = safe_int(age_raw, 0) if age_raw is not None else None
            if age is None or age < 0:
                record["age_days"] = 0
                self.audit_log["nulls_imputed"] += 1
            else:
                record["age_days"] = age

            vulns_raw = record.get("vulnerabilities_count")
            vulns = safe_int(vulns_raw, 0) if vulns_raw is not None else None
            if vulns is None or vulns < 0:
                record["vulnerabilities_count"] = 0
                self.audit_log["nulls_imputed"] += 1
            else:
                record["vulnerabilities_count"] = vulns

            l_risk_raw = record.get("license_risk")
            l_risk = safe_float(l_risk_raw, 0.0) if l_risk_raw is not None else None
            if l_risk is None or l_risk < 0:
                record["license_risk"] = 0.0
                self.audit_log["nulls_imputed"] += 1
            else:
                record["license_risk"] = l_risk
            cleaned.append(record)
        return cleaned

    def clean_all(self, raw_data: Dict[str, List[Dict[str, Any]]]) -> Tuple[Dict[str, List[Dict[str, Any]]], Dict[str, Any]]:
        """
        Executes end-to-end cleaning across all engineering entities and saves
        intermediate cleaned datasets to data/processed/.
        """
        cleaned_data = {}
        
        # Files
        cleaned_data["files"] = self.clean_files(raw_data.get("files", []))
        # Commits
        cleaned_data["commits"] = self.clean_commits(raw_data.get("commits", []))
        # Commit File Changes
        cleaned_data["commit_file_changes"] = self.clean_commit_file_changes(raw_data.get("commit_file_changes", []))
        # Issues
        cleaned_data["issues"] = self.clean_issues(raw_data.get("issues", []))
        # Defects
        cleaned_data["defects"] = self.clean_defects(raw_data.get("defects", []))
        # Dependencies
        cleaned_data["dependencies"] = self.clean_dependencies(raw_data.get("dependencies", []))
        
        # Pass-through entities with deduplication
        for passthrough_name in ["repositories", "developers", "pull_requests", "releases", "business_context"]:
            records = raw_data.get(passthrough_name, [])
            seen = set()
            clean_list = []
            for item in records:
                key = item.get("id") or item.get("module_name") or json.dumps(item, sort_keys=True)
                if key in seen:
                    self.audit_log["duplicates_removed"] += 1
                    continue
                seen.add(key)
                clean_list.append(item)
            cleaned_data[passthrough_name] = clean_list

        # Record entity statistics
        for entity_name, records in cleaned_data.items():
            self.audit_log["entity_stats"][entity_name] = {
                "raw_count": len(raw_data.get(entity_name, [])),
                "cleaned_count": len(records)
            }
            # Save intermediate cleaned JSON to processed_dir
            out_file = os.path.join(self.processed_dir, f"{entity_name}_cleaned.json")
            with open(out_file, "w", encoding="utf-8") as f:
                json.dump(records, f, indent=2)
                
        # Save audit log
        audit_file = os.path.join(self.processed_dir, "cleaning_audit.json")
        with open(audit_file, "w", encoding="utf-8") as f:
            json.dump(self.audit_log, f, indent=2)

        return cleaned_data, self.audit_log
