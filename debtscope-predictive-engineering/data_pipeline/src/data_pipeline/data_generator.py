"""
Controlled Engineering Dataset Generator
Produces comprehensive, relational, realistic software engineering datasets
covering 11 core entities for Technical Debt Prioritization analytics.
"""

import os
import json
import random
from datetime import datetime, timedelta

def generate_controlled_dataset(output_dir: str, seed: int = 42, inject_anomalies: bool = True):
    """
    Generates realistic, relational software engineering data files in JSON format.
    
    Entities:
    1. repositories.json
    2. files.json
    3. developers.json
    4. commits.json
    5. commit_file_changes.json
    6. pull_requests.json
    7. issues.json
    8. defects.json
    9. releases.json
    10. dependencies.json
    11. business_context.json
    """
    random.seed(seed)
    os.makedirs(output_dir, exist_ok=True)
    
    # 1. Repositories
    repos = [
        {
            "id": "repo-core-banking",
            "name": "core-banking-service",
            "tech_stack": "Python/FastAPI",
            "business_domain": "Payments & Ledger",
            "created_at": "2023-01-15T09:00:00Z",
            "business_impact_score": 95.0
        },
        {
            "id": "repo-auth-gateway",
            "name": "auth-gateway-service",
            "tech_stack": "Go/Gin",
            "business_domain": "Identity & Security",
            "created_at": "2023-02-10T11:30:00Z",
            "business_impact_score": 90.0
        },
        {
            "id": "repo-notification-engine",
            "name": "notification-engine",
            "tech_stack": "Python/Celery",
            "business_domain": "Communications",
            "created_at": "2023-05-20T14:15:00Z",
            "business_impact_score": 65.0
        },
        {
            "id": "repo-reporting-analytics",
            "name": "reporting-analytics",
            "tech_stack": "Python/PySpark",
            "business_domain": "Business Intelligence",
            "created_at": "2023-08-01T10:00:00Z",
            "business_impact_score": 75.0
        }
    ]
    
    # 2. Developers
    developers = [
        {"id": "dev-01", "name": "Alex Chen", "experience_level": "Senior", "primary_language": "Python"},
        {"id": "dev-02", "name": "Elena Rostova", "experience_level": "Lead", "primary_language": "Go"},
        {"id": "dev-03", "name": "Marcus Vance", "experience_level": "Mid", "primary_language": "Python"},
        {"id": "dev-04", "name": "Priya Sharma", "experience_level": "Senior", "primary_language": "Go"},
        {"id": "dev-05", "name": "Liam Davies", "experience_level": "Junior", "primary_language": "Python"},
        {"id": "dev-06", "name": "Sofia Torres", "experience_level": "Mid", "primary_language": "Python"}
    ]
    
    # 3. Business Context (Module level)
    business_context = [
        {"module_name": "payment_service", "criticality": 95.0, "user_facing": True, "revenue_impact": 98.0, "sla_tier": "Tier-1"},
        {"module_name": "ledger_service", "criticality": 92.0, "user_facing": False, "revenue_impact": 95.0, "sla_tier": "Tier-1"},
        {"module_name": "auth_service", "criticality": 90.0, "user_facing": True, "revenue_impact": 88.0, "sla_tier": "Tier-1"},
        {"module_name": "token_service", "criticality": 85.0, "user_facing": False, "revenue_impact": 85.0, "sla_tier": "Tier-1"},
        {"module_name": "email_dispatcher", "criticality": 60.0, "user_facing": False, "revenue_impact": 50.0, "sla_tier": "Tier-2"},
        {"module_name": "sms_gateway", "criticality": 65.0, "user_facing": True, "revenue_impact": 60.0, "sla_tier": "Tier-2"},
        {"module_name": "report_generator", "criticality": 70.0, "user_facing": True, "revenue_impact": 70.0, "sla_tier": "Tier-2"},
        {"module_name": "data_exporter", "criticality": 55.0, "user_facing": False, "revenue_impact": 45.0, "sla_tier": "Tier-3"}
    ]
    
    # 4. Files / Modules
    files = [
        # core-banking-service files
        {"id": "f-pay-01", "repo_id": "repo-core-banking", "file_path": "services/payment.py", "module_name": "payment_service", "language": "Python", "loc": 1842, "cyclomatic_complexity": 41.0, "cognitive_complexity": 35.0, "code_smells": 14},
        {"id": "f-pay-02", "repo_id": "repo-core-banking", "file_path": "services/stripe_adapter.py", "module_name": "payment_service", "language": "Python", "loc": 620, "cyclomatic_complexity": 18.0, "cognitive_complexity": 14.0, "code_smells": 5},
        {"id": "f-led-01", "repo_id": "repo-core-banking", "file_path": "models/ledger.py", "module_name": "ledger_service", "language": "Python", "loc": 1250, "cyclomatic_complexity": 29.0, "cognitive_complexity": 24.0, "code_smells": 9},
        {"id": "f-led-02", "repo_id": "repo-core-banking", "file_path": "services/reconciliation.py", "module_name": "ledger_service", "language": "Python", "loc": 980, "cyclomatic_complexity": 26.0, "cognitive_complexity": 22.0, "code_smells": 8},
        
        # auth-gateway-service files
        {"id": "f-aut-01", "repo_id": "repo-auth-gateway", "file_path": "handlers/auth.go", "module_name": "auth_service", "language": "Go", "loc": 1420, "cyclomatic_complexity": 34.0, "cognitive_complexity": 28.0, "code_smells": 11},
        {"id": "f-aut-02", "repo_id": "repo-auth-gateway", "file_path": "tokens/jwt.go", "module_name": "token_service", "language": "Go", "loc": 780, "cyclomatic_complexity": 21.0, "cognitive_complexity": 17.0, "code_smells": 6},
        {"id": "f-aut-03", "repo_id": "repo-auth-gateway", "file_path": "tokens/refresh.go", "module_name": "token_service", "language": "Go", "loc": 450, "cyclomatic_complexity": 12.0, "cognitive_complexity": 9.0, "code_smells": 3},
        
        # notification-engine files
        {"id": "f-not-01", "repo_id": "repo-notification-engine", "file_path": "tasks/email_worker.py", "module_name": "email_dispatcher", "language": "Python", "loc": 540, "cyclomatic_complexity": 15.0, "cognitive_complexity": 12.0, "code_smells": 4},
        {"id": "f-not-02", "repo_id": "repo-notification-engine", "file_path": "clients/twilio_sms.py", "module_name": "sms_gateway", "language": "Python", "loc": 610, "cyclomatic_complexity": 16.0, "cognitive_complexity": 13.0, "code_smells": 5},
        
        # reporting-analytics files
        {"id": "f-rep-01", "repo_id": "repo-reporting-analytics", "file_path": "pipelines/daily_report.py", "module_name": "report_generator", "language": "Python", "loc": 1120, "cyclomatic_complexity": 31.0, "cognitive_complexity": 25.0, "code_smells": 10},
        {"id": "f-rep-02", "repo_id": "repo-reporting-analytics", "file_path": "exporters/csv_exporter.py", "module_name": "data_exporter", "language": "Python", "loc": 390, "cyclomatic_complexity": 9.0, "cognitive_complexity": 6.0, "code_smells": 2}
    ]
    
    # 5. Commits & Commit File Changes
    commits = []
    commit_file_changes = []
    
    start_date = datetime(2023, 9, 1)
    base_timestamp = start_date
    commit_idx = 1
    cfc_idx = 1
    
    # Author affinities per file to guarantee measurable Developer Concentration
    file_primary_author = {
        "f-pay-01": "dev-01",  # Alex Chen heavily contributes to payment.py
        "f-pay-02": "dev-03",
        "f-led-01": "dev-01",
        "f-led-02": "dev-03",
        "f-aut-01": "dev-02",  # Elena dominates auth.go
        "f-aut-02": "dev-04",
        "f-aut-03": "dev-02",
        "f-not-01": "dev-05",
        "f-not-02": "dev-06",
        "f-rep-01": "dev-03",
        "f-rep-02": "dev-05"
    }
    
    # Generate commits over 180 days
    for day in range(180):
        current_date = start_date + timedelta(days=day)
        # Determine number of commits today
        num_commits = random.randint(1, 4)
        for _ in range(num_commits):
            # pick a repo
            repo = random.choice(repos)
            repo_files = [f for f in files if f["repo_id"] == repo["id"]]
            if not repo_files:
                continue
                
            # target file
            target_file = random.choice(repo_files)
            
            # Choose author (70% chance of primary author for realistic concentration)
            if random.random() < 0.70:
                author_id = file_primary_author.get(target_file["id"], "dev-01")
            else:
                author_id = random.choice(developers)["id"]
                
            c_id = f"c-{commit_idx:04d}"
            commit_hash = f"a{commit_idx:04x}df7890bc4512e"
            c_time = current_date + timedelta(hours=random.randint(8, 19), minutes=random.randint(0, 59))
            
            commit_msg = random.choice([
                f"Refactor logic in {target_file['file_path']}",
                f"Fix concurrency edge case in {target_file['file_path']}",
                f"Update transaction validation for {target_file['file_path']}",
                f"Optimize memory overhead in {target_file['file_path']}",
                f"Hotfix API latency in {target_file['file_path']}",
                f"Clean up legacy formatting and dead code in {target_file['file_path']}"
            ])
            
            commits.append({
                "id": c_id,
                "repo_id": repo["id"],
                "commit_hash": commit_hash,
                "author_id": author_id,
                "commit_timestamp": c_time.isoformat() + "Z",
                "message": commit_msg
            })
            
            # File changes
            adds = random.randint(10, 120)
            dels = random.randint(5, 75)
            # Make payment.py have significant churn
            if target_file["id"] == "f-pay-01":
                adds += random.randint(30, 80)
                dels += random.randint(20, 60)
                
            churn = adds + dels
            commit_file_changes.append({
                "id": f"cfc-{cfc_idx:05d}",
                "commit_id": c_id,
                "file_id": target_file["id"],
                "additions": adds,
                "deletions": dels,
                "churn": churn,
                "change_type": "MODIFY"
            })
            cfc_idx += 1
            commit_idx += 1
            
    # 6. Pull Requests
    pull_requests = []
    pr_idx = 1
    for r in repos:
        repo_commits = [c for c in commits if c["repo_id"] == r["id"]]
        for chunk_i in range(0, min(len(repo_commits), 50), 3):
            c_sample = repo_commits[chunk_i]
            pr_time = datetime.fromisoformat(c_sample["commit_timestamp"].replace("Z", ""))
            merged_time = pr_time + timedelta(hours=random.randint(4, 48))
            pull_requests.append({
                "id": f"pr-{pr_idx:04d}",
                "repo_id": r["id"],
                "pr_number": 100 + pr_idx,
                "author_id": c_sample["author_id"],
                "title": f"PR: {c_sample['message']}",
                "status": "MERGED",
                "created_at": pr_time.isoformat() + "Z",
                "merged_at": merged_time.isoformat() + "Z",
                "review_comments_count": random.randint(1, 12)
            })
            pr_idx += 1
            
    # 7. Issues (Tech Debt, Bug, Refactor)
    issues = []
    issue_idx = 1
    for f in files:
        # Number of issues for this file
        num_issues = random.randint(2, 6)
        if f["id"] == "f-pay-01":
            num_issues = 7
        for _ in range(num_issues):
            issue_date = start_date + timedelta(days=random.randint(10, 150))
            is_resolved = random.random() < 0.60
            resolved_date = (issue_date + timedelta(days=random.randint(5, 30))).isoformat() + "Z" if is_resolved else None
            status = "RESOLVED" if is_resolved else "OPEN"
            severity = random.choice(["CRITICAL", "HIGH", "MEDIUM", "LOW"])
            remediation_effort = round(random.uniform(8.0, 60.0), 1)
            if f["id"] == "f-pay-01" and severity in ["CRITICAL", "HIGH"]:
                remediation_effort += 25.0
                
            issues.append({
                "id": f"iss-{issue_idx:04d}",
                "repo_id": f["repo_id"],
                "file_id": f["id"],
                "module_name": f["module_name"],
                "issue_type": random.choice(["TECH_DEBT", "BUG", "REFACTOR", "SECURITY"]),
                "severity": severity,
                "remediation_effort_hours": remediation_effort,
                "status": status,
                "created_at": issue_date.isoformat() + "Z",
                "resolved_at": resolved_date
            })
            issue_idx += 1
            
    # 8. Defects
    defects = []
    defect_idx = 1
    for f in files:
        num_defects = random.randint(1, 4)
        if f["id"] == "f-pay-01":
            num_defects = 5
        for _ in range(num_defects):
            d_date = start_date + timedelta(days=random.randint(20, 160))
            is_fixed = random.random() < 0.70
            fixed_date = (d_date + timedelta(days=random.randint(1, 15))).isoformat() + "Z" if is_fixed else None
            defects.append({
                "id": f"def-{defect_idx:04d}",
                "repo_id": f["repo_id"],
                "file_id": f["id"],
                "module_name": f["module_name"],
                "bug_severity": random.choice(["CRITICAL", "HIGH", "MEDIUM", "LOW"]),
                "root_cause": random.choice(["Concurrency Race", "Missing Validation", "Database Deadlock", "Memory Leak", "Type Mismatch"]),
                "reported_at": d_date.isoformat() + "Z",
                "fixed_at": fixed_date
            })
            defect_idx += 1
            
    # 9. Releases
    releases = [
        {"id": "rel-01", "repo_id": "repo-core-banking", "version": "v1.0.0", "release_date": "2023-10-15T00:00:00Z", "stability_score": 88.0},
        {"id": "rel-02", "repo_id": "repo-core-banking", "version": "v1.1.0", "release_date": "2023-12-01T00:00:00Z", "stability_score": 82.0},
        {"id": "rel-03", "repo_id": "repo-core-banking", "version": "v1.2.0", "release_date": "2024-02-15T00:00:00Z", "stability_score": 79.0},
        {"id": "rel-04", "repo_id": "repo-auth-gateway", "version": "v2.0.0", "release_date": "2023-11-20T00:00:00Z", "stability_score": 91.0},
        {"id": "rel-05", "repo_id": "repo-notification-engine", "version": "v0.9.0", "release_date": "2023-12-10T00:00:00Z", "stability_score": 75.0},
        {"id": "rel-06", "repo_id": "repo-reporting-analytics", "version": "v1.0.0", "release_date": "2024-01-25T00:00:00Z", "stability_score": 85.0}
    ]
    
    # 10. Dependencies
    dependencies = [
        {"id": "dep-01", "repo_id": "repo-core-banking", "package_name": "cryptography", "current_version": "3.4.8", "latest_version": "42.0.5", "age_days": 420, "vulnerabilities_count": 3, "license_risk": 20.0},
        {"id": "dep-02", "repo_id": "repo-core-banking", "package_name": "fastapi", "current_version": "0.95.1", "latest_version": "0.110.0", "age_days": 210, "vulnerabilities_count": 1, "license_risk": 10.0},
        {"id": "dep-03", "repo_id": "repo-core-banking", "package_name": "sqlalchemy", "current_version": "1.4.30", "latest_version": "2.0.28", "age_days": 350, "vulnerabilities_count": 2, "license_risk": 15.0},
        {"id": "dep-04", "repo_id": "repo-auth-gateway", "package_name": "golang-jwt/jwt", "current_version": "v4.4.2", "latest_version": "v5.2.1", "age_days": 280, "vulnerabilities_count": 1, "license_risk": 10.0},
        {"id": "dep-05", "repo_id": "repo-notification-engine", "package_name": "celery", "current_version": "5.1.0", "latest_version": "5.3.6", "age_days": 310, "vulnerabilities_count": 2, "license_risk": 15.0},
        {"id": "dep-06", "repo_id": "repo-reporting-analytics", "package_name": "pyspark", "current_version": "3.3.0", "latest_version": "3.5.1", "age_days": 290, "vulnerabilities_count": 1, "license_risk": 10.0}
    ]
    
    # Controlled Anomalies to prove Cleaning Pipeline functionality
    if inject_anomalies:
        # Duplicate commit
        commits.append(commits[0].copy())
        # Duplicate file change
        commit_file_changes.append(commit_file_changes[0].copy())
        # Record with missing author
        commits.append({
            "id": "c-dirty-01",
            "repo_id": "repo-core-banking",
            "commit_hash": "bffffffffff9999",
            "author_id": None,  # null author
            "commit_timestamp": "2024-01-10T12:00:00Z",
            "message": "Anonymous refactor patch"
        })
        # Record with negative churn
        commit_file_changes.append({
            "id": "cfc-dirty-01",
            "commit_id": "c-dirty-01",
            "file_id": "f-pay-01",
            "additions": -10,  # invalid negative
            "deletions": 5,
            "churn": -5,
            "change_type": "MODIFY"
        })
        # Issue with missing severity
        issues.append({
            "id": "iss-dirty-01",
            "repo_id": "repo-core-banking",
            "file_id": "f-pay-01",
            "module_name": "payment_service",
            "issue_type": "TECH_DEBT",
            "severity": None,  # missing
            "remediation_effort_hours": None,  # missing
            "status": "OPEN",
            "created_at": "2024-01-12T10:00:00Z",
            "resolved_at": None
        })
        
    dataset = {
        "repositories.json": repos,
        "files.json": files,
        "developers.json": developers,
        "commits.json": commits,
        "commit_file_changes.json": commit_file_changes,
        "pull_requests.json": pull_requests,
        "issues.json": issues,
        "defects.json": defects,
        "releases.json": releases,
        "dependencies.json": dependencies,
        "business_context.json": business_context
    }
    
    generated_files = []
    for filename, data in dataset.items():
        filepath = os.path.join(output_dir, filename)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        generated_files.append(filepath)
        
    return {
        "output_dir": output_dir,
        "file_count": len(generated_files),
        "files": generated_files,
        "record_counts": {k: len(v) for k, v in dataset.items()}
    }

if __name__ == "__main__":
    summary = generate_controlled_dataset("data/raw", inject_anomalies=True)
    print("Controlled Dataset Generated Successfully:")
    print(json.dumps(summary["record_counts"], indent=2))
