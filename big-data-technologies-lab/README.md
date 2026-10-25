# 🐘 Big Data Technologies Lab (BDTL) - Hadoop & Hive Experiments

A comprehensive practical laboratory suite for **Big Data Technologies**, focusing on distributed data processing with **Apache Hadoop 3.3.6** and **Apache Hive**. Covers advanced table partitioning, bucketing, MapReduce execution, CLI automation, and visual report compilation.

---

## 🔬 Lab Experiments Included

### 1. Experiment 6: Hive Partitioning, Bucketing & Execution
- Implementation of external and managed Hive tables with partition pruning.
- Hash-based bucketing for optimized sampling and join performance.
- Automated Python execution wrapper (`run_hive_experiment.py`, `hive_cli.py`).
- Terminal screenshot capture and verification automation.
- Complete PDF report generation (`build_full_submission_pdf.py`).

### 2. Bucket Experiments & Verification (`bucket_experiments/`)
- Multi-dataset bucketing benchmarks.
- Automated screenshot generators for terminal verification.
- Customized PDF lab report builders for student deliverables.

---

## 🚀 Usage

### Running Hive Scripts
```bash
python run_hive_experiment.py
```

### Compiling Submission PDF Reports
```bash
python build_full_submission_pdf.py
```
