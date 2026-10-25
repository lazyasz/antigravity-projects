"""
Normalized Domain Entities & Ingestion Schema.
Decouples DebtScope's Technical Debt & ML Priority engines from third-party vendor APIs
(GitHub, GitLab, Jira, Linear, Notion, Confluence).
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class NormalizedCommit(BaseModel):
    sha: str
    author_name: str
    author_email: Optional[str] = None
    message: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    files_changed_count: int = 0
    additions: int = 0
    deletions: int = 0
    modified_files: List[str] = Field(default_factory=list)


class NormalizedPullRequest(BaseModel):
    number: int
    title: str
    state: str # "open", "closed", "merged"
    author: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    merged_at: Optional[datetime] = None
    changed_files: int = 0
    additions: int = 0
    deletions: int = 0
    review_comments_count: int = 0
    url: Optional[str] = None


class NormalizedIssue(BaseModel):
    id: str
    key: str # e.g. "DEBT-104" or "#42"
    source_provider: str # "github", "jira", "linear"
    title: str
    description: Optional[str] = None
    status: str # "BACKLOG", "IN_PROGRESS", "RESOLVED", "CLOSED"
    priority: str # "LOW", "MEDIUM", "HIGH", "CRITICAL"
    issue_type: str = "Task" # "Bug", "Debt", "Improvement", "Task"
    assignee: Optional[str] = None
    labels: List[str] = Field(default_factory=list)
    components: List[str] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    technical_debt_impact: Optional[float] = None


class NormalizedDoc(BaseModel):
    id: str
    title: str
    url: str
    source_type: str # "notion_page", "notion_database", "confluence"
    content_summary: Optional[str] = None
    last_edited_time: datetime = Field(default_factory=datetime.utcnow)
    referenced_modules: List[str] = Field(default_factory=list)


class NormalizedRepository(BaseModel):
    id: str
    name: str
    full_name: str
    owner: str
    url: str
    default_branch: str = "main"
    language: str = "Python"
    open_issues_count: int = 0
    stars_count: int = 0
    forks_count: int = 0
    is_private: bool = False
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    recent_commits: List[NormalizedCommit] = Field(default_factory=list)
    open_pull_requests: List[NormalizedPullRequest] = Field(default_factory=list)
    tracked_issues: List[NormalizedIssue] = Field(default_factory=list)


class Normalizer:
    """Utility transforms vendor JSON responses to normalized DebtScope entities."""

    @staticmethod
    def from_github_repo(data: Dict[str, Any]) -> NormalizedRepository:
        """Transforms a GitHub REST repo object into NormalizedRepository."""
        return NormalizedRepository(
            id=str(data.get("id", "")),
            name=data.get("name", "unnamed-repo"),
            full_name=data.get("full_name", data.get("name", "")),
            owner=data.get("owner", {}).get("login", "") if isinstance(data.get("owner"), dict) else str(data.get("owner", "")),
            url=data.get("html_url", data.get("url", "")),
            default_branch=data.get("default_branch", "main"),
            language=data.get("language") or "Python",
            open_issues_count=data.get("open_issues_count", 0),
            stars_count=data.get("stargazers_count", 0),
            forks_count=data.get("forks_count", 0),
            is_private=data.get("private", False),
            updated_at=datetime.utcnow(),
        )

    @staticmethod
    def from_jira_issue(data: Dict[str, Any]) -> NormalizedIssue:
        """Transforms a Jira REST API issue object into NormalizedIssue."""
        fields = data.get("fields", {})
        status_name = fields.get("status", {}).get("name", "BACKLOG").upper()
        priority_name = fields.get("priority", {}).get("name", "MEDIUM").upper()
        issue_type = fields.get("issuetype", {}).get("name", "Task")
        assignee = fields.get("assignee", {}).get("displayName") if fields.get("assignee") else None
        labels = fields.get("labels", [])
        
        return NormalizedIssue(
            id=str(data.get("id", "")),
            key=data.get("key", ""),
            source_provider="jira",
            title=fields.get("summary", "No Summary"),
            description=fields.get("description") if isinstance(fields.get("description"), str) else None,
            status=status_name,
            priority=priority_name,
            issue_type=issue_type,
            assignee=assignee,
            labels=labels,
            components=[c.get("name") for c in fields.get("components", []) if isinstance(c, dict)],
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )

    @staticmethod
    def from_notion_page(data: Dict[str, Any]) -> NormalizedDoc:
        """Transforms a Notion API page object into NormalizedDoc."""
        properties = data.get("properties", {})
        title = "Untitled Notion Page"
        for _, prop_val in properties.items():
            if prop_val.get("type") == "title":
                title_objs = prop_val.get("title", [])
                if title_objs:
                    title = title_objs[0].get("plain_text", title)
                break
        
        return NormalizedDoc(
            id=data.get("id", ""),
            title=title,
            url=data.get("url", f"https://notion.so/{data.get('id', '')}"),
            source_type="notion_page",
            content_summary=f"Notion synchronized document: {title}",
            last_edited_time=datetime.utcnow()
        )
