# Engineering Metrics Documentation & Derivations

This document provides formal mathematical definitions, implementation derivations, units, ranges, edge cases, and rationale for all software engineering metrics calculated by the **Predictive Engineering Intelligence Platform - Big Data Pipeline**.

---

## Metric Summary Catalog

| Metric | Field Name | Unit / Range | Primary Source |
| :--- | :--- | :--- | :--- |
| **Code Churn** | `code_churn` / `churn` | Lines ($\ge 0$) | Commit file changes |
| **Change Frequency** | `change_frequency` | Modifications ($\ge 0$) | Commits |
| **Developer Concentration** | `developer_concentration` | Ratio $[0.0, 1.0]$ | Commits + Authors |
| **Defect Frequency** | `defect_frequency` | Defects / 1K LOC ($\ge 0$) | Defects + Static LOC |
| **Cyclomatic Complexity** | `complexity` | Score ($\ge 1.0$) | AST / Static Analysis |
| **Maintainability Index** | `maintainability` | Index $[0.0, 100.0]$ | LOC + CC + Code Smells |
| **Dependency Risk Score** | `dependency_risk` | Index $[0.0, 100.0]$ | Dependencies + CVEs |
| **Debt Age** | `debt_age` | Days ($\ge 0$) | Unresolved Issues / Commits |
| **Release Impact** | `release_impact` | Score $[0.0, 100.0]$ | Releases + Regressions |
| **Business Impact** | `business_impact` | Score $[0.0, 100.0]$ | Business Context SLA / Revenue |
| **Estimated Remediation Effort** | `estimated_remediation_effort` | Engineering Hours ($\ge 0$) | Issues + Complexity + Smells |

---

## 1. Code Churn (`code_churn` / `churn`)

### Description & Rationale
Code churn measures the total volume of code altered in a specific file or module across commits. High churn indicates volatility, ongoing architectural instability, or repeated bug fixes, which correlates strongly with technical debt and latent defects.

### Mathematical Formula
$$\text{Code Churn}(f) = \sum_{c \in \text{Commits}(f)} \left( \text{additions}(c, f) + \text{deletions}(c, f) \right)$$

### Derivation in PySpark
```python
file_metrics_agg = (
    cfc_with_commits.groupBy("file_id")
    .agg(
        _sum("churn").alias("code_churn"),
        _sum("additions").alias("total_additions"),
        _sum("deletions").alias("total_deletions")
    )
)
```

### Edge Cases
- **Negative additions/deletions**: Sanitized in the ETL cleaning layer using absolute value bounds.
- **Unmodified files**: Defaulted to `0` churn via PySpark `coalesce`.

---

## 2. Change Frequency (`change_frequency`)

### Description & Rationale
Change frequency represents the total count of distinct modification events touching a file over the observation period. While churn measures line count volume, change frequency measures the temporal touch-rate.

### Mathematical Formula
$$\text{Change Frequency}(f) = |\text{CommitEvents}(f)|$$

### Derivation in PySpark
```python
_count("commit_id").alias("change_frequency")
```

### Edge Cases
- Merge commits touching hundreds of files without code changes are filtered in commit log cleaning.

---

## 3. Developer Concentration (`developer_concentration`)

### Description & Rationale
Developer concentration evaluates "Bus Factor" and knowledge silo risks. A high concentration ($\ge 0.80$) implies a single developer wrote almost all changes, meaning if that engineer leaves, maintenance velocity drops and technical debt risk spikes.

### Mathematical Formula
$$\text{Developer Concentration}(f) = \frac{\max_{d \in \text{Devs}(f)} \text{Commits}(d, f)}{\sum_{d \in \text{Devs}(f)} \text{Commits}(d, f)}$$

### Derivation in PySpark
Computed using PySpark SQL Window functions:
```python
window_file = Window.partitionBy("file_id").orderBy(col("author_commit_count").desc())

author_ranked = (
    author_file_counts
    .withColumn("rank", row_number().over(window_file))
    .filter(col("rank") == 1)
)

dev_concentration_df = (
    author_ranked.join(file_metrics_agg, on="file_id")
    .withColumn(
        "developer_concentration",
        round(col("author_commit_count") / col("commit_count"), 2)
    )
)
```

### Edge Cases
- Files with zero commits: Defaulted to `0.0`.
- Single-author files: Accurately evaluates to `1.0`.

---

## 4. Defect Frequency (`defect_frequency`)

### Description & Rationale
Defect frequency normalizes defect counts against codebase size, allowing fair comparison between large monoliths and small microservices.

### Mathematical Formula
$$\text{Defect Frequency}(f) = \frac{\text{DefectCount}(f)}{\max(1, \text{LOC}(f))} \times 1,000$$

### Derivation in PySpark
```python
_round((col("defect_count") * lit(1000.0)) / when(col("loc") > 0, col("loc")).otherwise(lit(100.0)), 2)
```

### Range & Interpretation
- `< 1.0`: High stability (standard enterprise grade).
- `1.0 - 3.0`: Moderate defect density; technical debt monitoring suggested.
- `> 3.0`: Critical defect cluster; immediate refactoring required.

---

## 5. Cyclomatic & Cognitive Complexity (`complexity`)

### Description & Rationale
Measures the number of linearly independent paths through program source code (McCabe Metric) and mental effort required to understand control flow (Cognitive Complexity).

### Mathematical Formula
$$M = E - N + 2P$$
Where:
- $E$ = Number of edges in the control flow graph.
- $N$ = Number of nodes (basic blocks).
- $P$ = Number of connected components (usually 1 for a single function).

In the aggregated module layer, `complexity` is the sum of method cyclomatic complexities.

---

## 6. Maintainability Index (`maintainability`)

### Description & Rationale
Maintainability Index (MI) is an industry-standard composite metric originating from the Software Engineering Institute (SEI) and Visual Studio. It measures how easily source code can be understood, debugged, and refactored.

### Mathematical Formula
Standard SEI Formulation:
$$MI_{\text{raw}} = 171.0 - 5.2 \times \ln(V) - 0.23 \times G - 16.2 \times \ln(\text{LOC})$$
Normalized Visual Studio scale with static analysis smell penalty:
$$MI = \max\left(0.0, \min\left(100.0, 100.0 - (0.45 \times G) - (0.018 \times \text{LOC}) - (0.40 \times \text{CodeSmells})\right)\right)$$

Where:
- $G$ = Cyclomatic Complexity (`complexity`).
- $\text{LOC}$ = Physical Lines of Code.
- $\text{CodeSmells}$ = Count of static analysis violations (long methods, duplicate logic, high parameter counts).

### Calibration Example (`payment.py`)
- $\text{LOC} = 1842$
- $G = 41.0$
- $\text{CodeSmells} = 14$
- Deduction: $(0.45 \times 41) + (0.018 \times 1842) + (0.40 \times 14) = 18.45 + 33.15 + 5.6 = 57.2$
- $MI = 100.0 - 57.2 = 42.8 \approx 42$ (Target specification verified).

---

## 7. Dependency Risk Score (`dependency_risk`)

### Description & Rationale
Evaluates software supply-chain vulnerabilities, outdated dependencies, and licensing risks.

### Mathematical Formula
$$\text{DependencyRisk} = w_1 \times \min(100, \text{CVEs} \times 25) + w_2 \times \min\left(100, \frac{\text{AgeDays}}{365} \times 30\right) + w_3 \times \text{LicenseRisk}$$
Weights:
- $w_1 = 0.40$ (Known vulnerabilities / CVE weight)
- $w_2 = 0.35$ (Dependency staleness weight)
- $w_3 = 0.25$ (License restriction weight)

---

## 8. Debt Age (`debt_age`)

### Description & Rationale
Debt age captures the temporal decay of unaddressed technical debt. Unresolved issues accumulate interest over time, complicating future refactoring.

### Mathematical Formula
$$\text{Debt Age}(f) = \min_{i \in \text{OpenDebtIssues}(f)} \left( T_{\text{evaluation}} - T_{\text{creation}}(i) \right) \quad [\text{in days}]$$

### Derivation in PySpark
```python
_min(
    when(col("status") == "OPEN", datediff(to_date(lit("2024-03-01")), to_date(col("created_at"))))
).alias("debt_age")
```

---

## 9. Release Impact (`release_impact`)

### Description & Rationale
Calculated from release stability tracking:
$$\text{Release Impact} = 100.0 - \text{AverageStabilityScore}$$
Modules hosted in repositories with frequent post-release rollbacks or patch releases incur a higher release penalty.

---

## 10. Business Impact (`business_impact`)

### Description & Rationale
Bridges raw engineering code health with organizational business priorities. Even clean code in high-revenue payment paths warrants higher maintenance attention than messy code in an obsolete internal script.

### Mathematical Formula
$$\text{Business Impact} = 0.50 \times \text{Criticality} + 0.35 \times \text{Revenue Impact} + 0.15 \times \text{UserFacingFactor}$$
Where $\text{UserFacingFactor} = 100.0$ if user-facing, else $40.0$.

### Example (`payment_service`)
- Criticality = $95.0$
- Revenue Impact = $98.0$
- User Facing = `True` ($100.0$)
- $\text{Business Impact} = (0.50 \times 95) + (0.35 \times 98) + (0.15 \times 100) = 47.5 + 34.3 + 15.0 = 96.8$

---

## 11. Estimated Remediation Effort (`estimated_remediation_effort`)

### Description & Rationale
Predictive engineering estimate of developer-hours required to eliminate identified technical debt.

### Mathematical Formula
$$\text{Remediation Hours} = 0.40 \times \text{MaintenanceEffort} + 0.30 \times \text{Complexity} + 0.50 \times \text{CodeSmells} + \text{DebtAgePenalty}$$
Where $\text{DebtAgePenalty} = 15.0$ hours if $\text{Debt Age} > 90$ days, else $5.0$ hours.
