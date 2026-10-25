"""
Pydantic schemas for Repository and SourceFile management.
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class RepositoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Unique repository name")
    url: Optional[str] = Field(None, max_length=255, description="Git clone/repository URL")
    default_branch: str = Field(default="main", max_length=50)


class RepositoryCreate(RepositoryBase):
    pass


class RepositorySummary(RepositoryBase):
    id: int
    created_at: datetime
    file_count: int = 0
    critical_files_count: int = 0
    average_health_score: float = 100.0

    model_config = ConfigDict(from_attributes=True)


class RepositoryResponse(RepositoryBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SourceFileBase(BaseModel):
    file_path: str = Field(..., min_length=1, max_length=255)
    file_name: str = Field(..., min_length=1, max_length=100)
    language: str = Field(default="Python", max_length=50)
    lines_of_code: int = Field(default=0, ge=0)
    is_active: bool = True


class SourceFileCreate(SourceFileBase):
    repository_id: int


class SourceFileResponse(SourceFileBase):
    id: int
    repository_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
