# Data Schema Specification

This document details the relational data dictionary for the **Predictive Engineering Intelligence Platform**. It specifies schemas across three tiers:
1. **Raw Tier (`data/raw/`)**: 11 normalized software engineering entities.
2. **Intermediate Cleaned Tier (`data/processed/`)**: Schema-validated and sanitized staging datasets.
3. **Feature Dataset Tier (`data/features/`)**: Standardized feature contract consumed by Machine Learning and Prioritization modules.

---

## 1. Raw Entity Schemas (`data/raw/`)

### 1.1 `repositories.json`
Represents software repositories under active intelligence monitoring.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | Unique repository identifier (e.g. `repo-core-banking`) |
| `name` | string | Non-null | Repository name |
| `tech_stack` | string | Nullable | Primary frameworks/languages (e.g. `Python/FastAPI`) |
| `business_domain` | string | Nullable | Functional domain (e.g. `Payments & Ledger`) |
| `created_at` | string (ISO-8601) | Non-null | Creation timestamp |
| `business_impact_score` | float | $[0.0, 100.0]$ | Organizational impact score |

### 1.2 `files.json`
Static code analysis records per source file.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | File identifier (e.g. `f-pay-01`) |
| `repo_id` | string | Foreign Key -> `repositories.id` | Parent repository |
| `file_path` | string | Non-null | Repository relative path (`services/payment.py`) |
| `module_name` | string | Non-null | High-level architectural module |
| `language` | string | Nullable | Source language (`Python`, `Go`, `Java`) |
| `loc` | integer | $\ge 0$ | Physical Lines of Code |
| `cyclomatic_complexity` | float | $\ge 1.0$ | McCabe Cyclomatic Complexity |
| `cognitive_complexity` | float | $\ge 0.0$ | Sonar Cognitive Complexity |
| `code_smells` | integer | $\ge 0$ | Count of detected code smells |

### 1.3 `developers.json`
Contributor profile metadata.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | Developer identifier (e.g. `dev-01`) |
| `name` | string | Non-null | Engineer full name |
| `experience_level` | string | Enum(`Senior`, `Mid`, `Junior`, `Lead`) | Engineering seniority |
| `primary_language` | string | Nullable | Primary language specialization |

### 1.4 `commits.json`
VCS commit event logs.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | Internal commit identifier (`c-0001`) |
| `repo_id` | string | Foreign Key -> `repositories.id` | Repository identifier |
| `commit_hash` | string | Unique / Non-null | SHA-1 / SHA-256 commit hash |
| `author_id` | string | Foreign Key -> `developers.id` | Commit author identifier |
| `commit_timestamp` | string (ISO-8601) | Non-null | Commit date and time |
| `message` | string | Nullable | Commit log message |

### 1.5 `commit_file_changes.json`
Granular line-level diff modifications per commit.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | Change record ID (`cfc-00001`) |
| `commit_id` | string | Foreign Key -> `commits.id` | Associated commit |
| `file_id` | string | Foreign Key -> `files.id` | Modified file |
| `additions` | integer | $\ge 0$ | Added lines |
| `deletions` | integer | $\ge 0$ | Removed lines |
| `churn` | integer | $\ge 0$ | Total churn (`additions + deletions`) |
| `change_type` | string | Enum(`MODIFY`, `ADD`, `DELETE`) | Git change operation |

### 1.6 `pull_requests.json`
Peer review and PR metrics.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | PR identifier (`pr-0001`) |
| `repo_id` | string | Foreign Key -> `repositories.id` | Target repository |
| `pr_number` | integer | Non-null | Sequential PR number |
| `author_id` | string | Foreign Key -> `developers.id` | Author |
| `title` | string | Nullable | PR title |
| `status` | string | Enum(`MERGED`, `OPEN`, `CLOSED`) | PR state |
| `created_at` | string (ISO-8601) | Non-null | Opening timestamp |
| `merged_at` | string (ISO-8601) | Nullable | Merge timestamp |
| `review_comments_count`| integer | $\ge 0$ | Number of review comments |

### 1.7 `issues.json`
Technical debt items, bugs, and refactoring tickets.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | Issue tracking ID (`iss-0001`) |
| `repo_id` | string | Foreign Key -> `repositories.id` | Associated repository |
| `file_id` | string | Foreign Key -> `files.id` | Associated file |
| `module_name` | string | Non-null | Associated module |
| `issue_type` | string | Enum(`TECH_DEBT`, `BUG`, `REFACTOR`, `SECURITY`) | Issue taxonomy |
| `severity` | string | Enum(`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) | Ticket priority |
| `remediation_effort_hours` | float | $\ge 0.0$ | Estimated hours to remediate |
| `status` | string | Enum(`OPEN`, `RESOLVED`, `IN_PROGRESS`) | Ticket lifecycle status |
| `created_at` | string (ISO-8601) | Non-null | Filing date |
| `resolved_at` | string (ISO-8601) | Nullable | Resolution date |

### 1.8 `defects.json`
Production and staging software defects.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | Defect ticket ID (`def-0001`) |
| `repo_id` | string | Foreign Key -> `repositories.id` | Associated repository |
| `file_id` | string | Foreign Key -> `files.id` | Defective source file |
| `module_name` | string | Non-null | Affected module |
| `bug_severity` | string | Enum(`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`) | Severity classification |
| `root_cause` | string | Nullable | Cause (e.g. `Concurrency Race`) |
| `reported_at` | string (ISO-8601) | Non-null | Detection timestamp |
| `fixed_at` | string (ISO-8601) | Nullable | Patch timestamp |

### 1.9 `releases.json`
Deployment and version release records.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | Release ID (`rel-01`) |
| `repo_id` | string | Foreign Key -> `repositories.id` | Repository |
| `version` | string | Non-null | Semantic version (`v1.0.0`) |
| `release_date` | string (ISO-8601) | Non-null | Release timestamp |
| `stability_score` | float | $[0.0, 100.0]$ | Post-release stability index |

### 1.10 `dependencies.json`
Third-party package manifests and vulnerability audit logs.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | Primary Key | Dependency record ID (`dep-01`) |
| `repo_id` | string | Foreign Key -> `repositories.id` | Repository |
| `package_name` | string | Non-null | Package name (e.g. `cryptography`) |
| `current_version` | string | Non-null | Pinned version |
| `latest_version` | string | Non-null | Upstream latest release |
| `age_days` | integer | $\ge 0$ | Version staleness in days |
| `vulnerabilities_count` | integer | $\ge 0$ | Known CVE vulnerabilities |
| `license_risk` | float | $[0.0, 100.0]$ | Copyleft / unmaintained risk score |

### 1.11 `business_context.json`
Product management and financial context per module.
| Field | Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `module_name` | string | Primary Key | Unique module key (`payment_service`) |
| `criticality` | float | $[0.0, 100.0]$ | Engineering criticality score |
| `user_facing` | boolean | Non-null | True if directly accessed by end-users |
| `revenue_impact` | float | $[0.0, 100.0]$ | Financial impact rating |
| `sla_tier` | string | Enum(`Tier-1`, `Tier-2`, `Tier-3`) | Service Level Agreement tier |

---

## 2. Final Feature Dataset Output Contract

Exported simultaneously to:
- `data/features/engineering_features.json` (Contract-ready JSON records)
- `data/features/engineering_features.csv` (Tabular training matrix)
- `data/features/engineering_features.parquet` (Distributed columnar storage)

### Field Contract Specification

| Field Name | Type | Unit / Format | Description |
| :--- | :--- | :--- | :--- |
| `repository` | string | Name | Host repository identifier |
| `file` | string | Basename | Target source file (`payment.py`) |
| `module` | string | Key | Functional module |
| `developer` | string | ID | Dominant primary contributor |
| `commit_count` | integer | Count | Total distinct commits touching file |
| `change_frequency` | integer | Count | Total modification events |
| `code_churn` | integer | Lines | Total churn (`additions + deletions`) |
| `churn` | integer | Lines | Contract alias matching `code_churn` |
| `loc` | integer | Lines | Physical Lines of Code |
| `complexity` | float | Score | McCabe Cyclomatic Complexity |
| `maintainability` | float | $[0.0, 100.0]$ | Maintainability Index |
| `code_smells` | integer | Count | Static analysis smell violations |
| `dependency_age` | integer | Days | Mean dependency staleness |
| `dependency_risk` | float | $[0.0, 100.0]$ | Composite vulnerability & licensing risk |
| `issue_count` | integer | Count | Total tracked technical debt/issues |
| `defect_count` | integer | Count | Total confirmed software defects |
| `issue_severity` | float | $[1.0, 4.0]$ | Mean weighted issue severity |
| `pr_count` | integer | Count | Total pull requests for repository |
| `release_frequency` | float | Rate / month | Mean release cadence |
| `module_criticality`| float | $[0.0, 100.0]$ | Architectural importance score |
| `business_impact` | float | $[0.0, 100.0]$ | Composite business risk score |
| `debt_age` | integer | Days | Age of oldest unresolved debt ticket |
| `release_impact` | float | $[0.0, 100.0]$ | Post-deployment regression vulnerability |
| `maintenance_effort`| float | Hours | Cumulative resolution effort |
| `estimated_remediation_effort` | float | Hours | Predictive remediation time estimate |
| `developer_concentration` | float | $[0.0, 1.0]$ | Proportion of changes by top author |
| `defect_frequency` | float | Defects / 1K LOC | Defect density metric |

### Sample JSON Record
```json
{
  "repository": "core-banking-service",
  "file": "payment.py",
  "module": "payment_service",
  "developer": "dev-01",
  "commit_count": 23,
  "change_frequency": 23,
  "code_churn": 4246,
  "churn": 4246,
  "loc": 1842,
  "complexity": 41.0,
  "maintainability": 42.8,
  "code_smells": 14,
  "dependency_age": 327,
  "dependency_risk": 53.2,
  "issue_count": 8,
  "defect_count": 5,
  "issue_severity": 2.5,
  "pr_count": 17,
  "release_frequency": 0.5,
  "module_criticality": 95.0,
  "business_impact": 96.8,
  "debt_age": 49,
  "release_impact": 17.0,
  "maintenance_effort": 278.2,
  "estimated_remediation_effort": 135.6,
  "developer_concentration": 0.61,
  "defect_frequency": 2.71
}
```
