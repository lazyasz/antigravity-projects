"""
SQLAlchemy ORM models for Technical Debt Intelligence Platform.
Defines schemas for repositories, files, metrics, ML predictions, business context, priority scores, and recommendations.
"""

from datetime import datetime
from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    Text,
)
from sqlalchemy.orm import relationship
from backend.database.connection import Base


class Repository(Base):
    __tablename__ = "repositories"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    url = Column(String(255), nullable=True)
    default_branch = Column(String(50), default="main")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    files = relationship("SourceFile", back_populates="repository", cascade="all, delete-orphan")


class SourceFile(Base):
    __tablename__ = "source_files"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    repository_id = Column(Integer, ForeignKey("repositories.id", ondelete="CASCADE"), nullable=False, index=True)
    file_path = Column(String(255), nullable=False, index=True)
    file_name = Column(String(100), nullable=False)
    language = Column(String(50), default="Python")
    lines_of_code = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    repository = relationship("Repository", back_populates="files")
    metrics = relationship("EngineeringMetric", back_populates="file", uselist=False, cascade="all, delete-orphan")
    debt_items = relationship("TechnicalDebtItem", back_populates="file", cascade="all, delete-orphan")
    prediction = relationship("MLPrediction", back_populates="file", uselist=False, cascade="all, delete-orphan")
    business_context = relationship("BusinessContext", back_populates="file", uselist=False, cascade="all, delete-orphan")
    priority_score = relationship("PriorityScore", back_populates="file", uselist=False, cascade="all, delete-orphan")
    recommendations = relationship("Recommendation", back_populates="file", cascade="all, delete-orphan")


class EngineeringMetric(Base):
    __tablename__ = "engineering_metrics"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("source_files.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Code Quality & Static Metrics (Normalized or absolute)
    cyclomatic_complexity = Column(Float, default=1.0)
    cognitive_complexity = Column(Float, default=1.0)
    code_smells_count = Column(Integer, default=0)
    duplication_pct = Column(Float, default=0.0)      # 0 to 100%
    test_coverage_pct = Column(Float, default=100.0)  # 0 to 100%
    code_churn_commits = Column(Integer, default=0)
    bug_frequency = Column(Integer, default=0)
    
    # Normalized Technical Risk Score (0–100) computed from static metrics
    technical_risk_score = Column(Float, default=0.0)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    file = relationship("SourceFile", back_populates="metrics")


class TechnicalDebtItem(Base):
    __tablename__ = "technical_debt_items"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("source_files.id", ondelete="CASCADE"), nullable=False, index=True)
    debt_category = Column(String(50), nullable=False) # e.g. "COMPLEXITY", "DUPLICATION", "SMELL", "SECURITY"
    severity = Column(String(20), default="MEDIUM")    # LOW, MEDIUM, HIGH, CRITICAL
    debt_age_days = Column(Integer, default=30)
    description = Column(Text, nullable=False)
    line_number = Column(Integer, nullable=True)
    remediation_guidance = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("SourceFile", back_populates="debt_items")


class MLPrediction(Base):
    __tablename__ = "ml_predictions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("source_files.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # ML Model Outputs (0–100 scale or probability * 100)
    predicted_future_risk = Column(Float, default=50.0) # 0 to 100
    defect_probability = Column(Float, default=0.5)     # 0.0 to 1.0
    churn_risk_score = Column(Float, default=50.0)      # 0 to 100
    confidence_score = Column(Float, default=0.85)      # 0.0 to 1.0
    model_version = Column(String(50), default="xgboost-v1.2")
    prediction_timestamp = Column(DateTime, default=datetime.utcnow)

    file = relationship("SourceFile", back_populates="prediction")


class BusinessContext(Base):
    __tablename__ = "business_contexts"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("source_files.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Business attributes (0–100 scale)
    business_criticality = Column(Float, default=50.0)          # Core revenue/transaction role
    customer_impact = Column(Float, default=50.0)               # User-facing failure severity
    module_criticality = Column(Float, default=50.0)            # Structural architecture importance
    release_proximity = Column(Float, default=50.0)             # Next release milestone closeness
    sprint_urgency = Column(Float, default=50.0)                # Current sprint priority/deliverables
    maintenance_cost = Column(Float, default=50.0)              # Dev friction & recurring overhead
    estimated_remediation_effort = Column(Float, default=50.0)  # Difficulty & hours to fix (0=easiest, 100=hardest)
    
    domain_tag = Column(String(50), default="core")             # e.g., "payment", "auth", "analytics", "ui"
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    file = relationship("SourceFile", back_populates="business_context")


class PriorityScore(Base):
    __tablename__ = "priority_scores"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("source_files.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    
    # Computed scores (0–100 scale)
    composite_technical_risk = Column(Float, default=0.0)
    composite_business_impact = Column(Float, default=0.0)
    urgency_score = Column(Float, default=0.0)
    baseline_score = Column(Float, default=0.0)
    final_priority_score = Column(Float, default=0.0)
    
    priority_level = Column(String(20), default="LOW") # LOW, MEDIUM, HIGH, CRITICAL
    roi_score = Column(Float, default=100.0)           # Value / Effort ratio
    quadrant = Column(String(50), default="OPPORTUNISTIC") # QUICK_WIN, STRATEGIC, OPPORTUNISTIC, DEPRIORITIZED
    rank = Column(Integer, default=1)
    
    calculated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    file = relationship("SourceFile", back_populates="priority_score")


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    file_id = Column(Integer, ForeignKey("source_files.id", ondelete="CASCADE"), nullable=False, index=True)
    
    recommendation_type = Column(String(50), nullable=False) # "REFACTOR_IMMEDIATELY", "SPRINT_CANDIDATE", "SCHEDULE_FUTURE", "MONITOR"
    action_summary = Column(String(255), nullable=False)
    rationale = Column(Text, nullable=False)
    sprint_target = Column(String(50), default="Next Sprint")
    estimated_story_points = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)

    file = relationship("SourceFile", back_populates="recommendations")
