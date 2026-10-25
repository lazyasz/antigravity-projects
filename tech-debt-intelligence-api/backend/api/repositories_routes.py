"""
Repository API endpoints.
Provides CRUD and health summary operations for tracked code repositories.
"""

from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.database.connection import get_db
from backend.database.models import Repository, SourceFile, PriorityScore
from backend.schemas.repository import (
    RepositoryCreate,
    RepositoryResponse,
    RepositorySummary,
    SourceFileResponse,
    SourceFileCreate,
)
from backend.services.data_service import DataService

router = APIRouter(prefix="/repositories", tags=["Repositories"])


@router.get("", response_model=List[RepositorySummary])
def list_repositories(db: Session = Depends(get_db)):
    """Lists all tracked repositories with debt and health summaries."""
    repos = DataService.get_all_repositories(db)
    results = []
    for r in repos:
        files = r.files
        file_count = len(files)
        critical_count = 0
        total_health = 0.0

        for f in files:
            score = f.priority_score
            if score:
                if score.priority_level == "CRITICAL":
                    critical_count += 1
                total_health += (100.0 - score.final_priority_score)
            else:
                total_health += 100.0

        avg_health = round(total_health / max(1, file_count), 1)
        results.append(
            RepositorySummary(
                id=r.id,
                name=r.name,
                url=r.url,
                default_branch=r.default_branch,
                created_at=r.created_at,
                file_count=file_count,
                critical_files_count=critical_count,
                average_health_score=avg_health,
            )
        )
    return results


@router.post("", response_model=RepositoryResponse, status_code=status.HTTP_201_CREATED)
def create_repository(repo_in: RepositoryCreate, db: Session = Depends(get_db)):
    """Registers a new code repository for technical debt analysis."""
    return DataService.get_or_create_repository(db, repo_in)


@router.get("/{repo_id}", response_model=RepositoryResponse)
def get_repository(repo_id: int, db: Session = Depends(get_db)):
    """Fetches details for a single repository."""
    repo = DataService.get_repository_by_id(db, repo_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Repository with id {repo_id} not found")
    return repo


@router.get("/{repo_id}/files", response_model=List[SourceFileResponse])
def get_repository_files(repo_id: int, db: Session = Depends(get_db)):
    """Lists all source files registered in a repository."""
    repo = DataService.get_repository_by_id(db, repo_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Repository with id {repo_id} not found")
    return DataService.get_files_by_repository(db, repo_id)


@router.post("/{repo_id}/files", response_model=SourceFileResponse, status_code=status.HTTP_201_CREATED)
def add_file_to_repository(repo_id: int, file_in: SourceFileCreate, db: Session = Depends(get_db)):
    """Registers a new source file to a repository."""
    repo = DataService.get_repository_by_id(db, repo_id)
    if not repo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Repository with id {repo_id} not found")
    file_in.repository_id = repo_id
    return DataService.get_or_create_file(db, file_in)
