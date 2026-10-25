"""
Data Service: Handles Repositories, Source Files, Metrics, and Technical Debt items.
Provides ingestion interfaces for Member 1 Data Pipeline outputs.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from backend.database.models import Repository, SourceFile, EngineeringMetric, TechnicalDebtItem
from backend.schemas.repository import RepositoryCreate, SourceFileCreate
from backend.schemas.metrics import EngineeringMetricCreate, TechnicalDebtItemCreate


class DataService:
    @staticmethod
    def get_or_create_repository(db: Session, repo_in: RepositoryCreate) -> Repository:
        repo = db.query(Repository).filter(Repository.name == repo_in.name).first()
        if not repo:
            repo = Repository(
                name=repo_in.name,
                url=repo_in.url,
                default_branch=repo_in.default_branch,
            )
            db.add(repo)
            db.commit()
            db.refresh(repo)
        return repo

    @staticmethod
    def get_all_repositories(db: Session) -> List[Repository]:
        return db.query(Repository).all()

    @staticmethod
    def get_repository_by_id(db: Session, repo_id: int) -> Optional[Repository]:
        return db.query(Repository).filter(Repository.id == repo_id).first()

    @staticmethod
    def get_or_create_file(db: Session, file_in: SourceFileCreate) -> SourceFile:
        file_obj = db.query(SourceFile).filter(
            SourceFile.repository_id == file_in.repository_id,
            SourceFile.file_path == file_in.file_path
        ).first()
        if not file_obj:
            file_obj = SourceFile(
                repository_id=file_in.repository_id,
                file_path=file_in.file_path,
                file_name=file_in.file_name,
                language=file_in.language,
                lines_of_code=file_in.lines_of_code,
                is_active=file_in.is_active,
            )
            db.add(file_obj)
            db.commit()
            db.refresh(file_obj)
        return file_obj

    @staticmethod
    def get_file_by_id(db: Session, file_id: int) -> Optional[SourceFile]:
        return db.query(SourceFile).filter(SourceFile.id == file_id).first()

    @staticmethod
    def get_files_by_repository(db: Session, repo_id: int) -> List[SourceFile]:
        return db.query(SourceFile).filter(SourceFile.repository_id == repo_id).all()

    @staticmethod
    def compute_static_technical_risk(
        cyclomatic_complexity: float,
        code_smells_count: int,
        duplication_pct: float,
        test_coverage_pct: float,
        code_churn_commits: int,
        bug_frequency: int
    ) -> float:
        """
        Calculates normalized static technical risk (0-100) based on Member 1 metrics:
        - Complexity penalty (high cyclomatic complexity > 10)
        - Code smell density
        - Duplication rate
        - Lack of test coverage (100 - coverage)
        - Churn & bug history
        """
        # Complexity component (capped at 100)
        # Baseline complexity = 1, severe complexity >= 30
        comp_score = min(100.0, (cyclomatic_complexity / 30.0) * 100.0)

        # Smell component (20 smells = 100)
        smell_score = min(100.0, (code_smells_count / 20.0) * 100.0)

        # Duplication component (0-100)
        dup_score = min(100.0, duplication_pct * 2.5)

        # Coverage deficit (0-100)
        cov_deficit = max(0.0, 100.0 - test_coverage_pct)

        # Bug & Churn stability risk (10 bugs/churn = 100)
        stability_score = min(100.0, ((bug_frequency * 2.0 + code_churn_commits) / 20.0) * 100.0)

        # Weighted static risk
        static_risk = (
            0.30 * comp_score +
            0.20 * smell_score +
            0.15 * dup_score +
            0.20 * cov_deficit +
            0.15 * stability_score
        )
        return round(float(min(100.0, max(0.0, static_risk))), 2)

    @classmethod
    def ingest_engineering_metric(cls, db: Session, metric_in: EngineeringMetricCreate) -> EngineeringMetric:
        metric = db.query(EngineeringMetric).filter(EngineeringMetric.file_id == metric_in.file_id).first()
        
        calculated_risk = metric_in.technical_risk_score
        if calculated_risk is None:
            calculated_risk = cls.compute_static_technical_risk(
                cyclomatic_complexity=metric_in.cyclomatic_complexity,
                code_smells_count=metric_in.code_smells_count,
                duplication_pct=metric_in.duplication_pct,
                test_coverage_pct=metric_in.test_coverage_pct,
                code_churn_commits=metric_in.code_churn_commits,
                bug_frequency=metric_in.bug_frequency,
            )

        if not metric:
            metric = EngineeringMetric(
                file_id=metric_in.file_id,
                cyclomatic_complexity=metric_in.cyclomatic_complexity,
                cognitive_complexity=metric_in.cognitive_complexity,
                code_smells_count=metric_in.code_smells_count,
                duplication_pct=metric_in.duplication_pct,
                test_coverage_pct=metric_in.test_coverage_pct,
                code_churn_commits=metric_in.code_churn_commits,
                bug_frequency=metric_in.bug_frequency,
                technical_risk_score=calculated_risk,
            )
            db.add(metric)
        else:
            metric.cyclomatic_complexity = metric_in.cyclomatic_complexity
            metric.cognitive_complexity = metric_in.cognitive_complexity
            metric.code_smells_count = metric_in.code_smells_count
            metric.duplication_pct = metric_in.duplication_pct
            metric.test_coverage_pct = metric_in.test_coverage_pct
            metric.code_churn_commits = metric_in.code_churn_commits
            metric.bug_frequency = metric_in.bug_frequency
            metric.technical_risk_score = calculated_risk

        db.commit()
        db.refresh(metric)
        return metric

    @staticmethod
    def add_technical_debt_item(db: Session, item_in: TechnicalDebtItemCreate) -> TechnicalDebtItem:
        item = TechnicalDebtItem(
            file_id=item_in.file_id,
            debt_category=item_in.debt_category,
            severity=item_in.severity,
            debt_age_days=item_in.debt_age_days,
            description=item_in.description,
            line_number=item_in.line_number,
            remediation_guidance=item_in.remediation_guidance,
        )
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @staticmethod
    def get_all_debt_items(db: Session, severity: Optional[str] = None) -> List[TechnicalDebtItem]:
        query = db.query(TechnicalDebtItem)
        if severity:
            query = query.filter(TechnicalDebtItem.severity == severity.upper())
        return query.all()
