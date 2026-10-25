"""
Unified Integrations API Router.
Exposes standard endpoints for Google OAuth, GitHub App, Atlassian Jira Cloud, and Notion Workspace.
Manages connections, credential encryption, resource browsing, synchronization, and webhooks.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Header, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import json
import secrets
from datetime import datetime

from backend.database.connection import get_db
from backend.database.models import IntegrationConnection
from backend.integrations.github_provider import GitHubProvider
from backend.integrations.jira_provider import JiraProvider
from backend.integrations.notion_provider import NotionProvider
from backend.integrations.token_security import TokenSecurity
from backend.services.auth_service import get_current_user
from backend.config import settings

router = APIRouter(prefix="/integrations", tags=["Unified Integrations Hub"])

# Initialize singleton providers
PROVIDERS = {
    "github": GitHubProvider(),
    "jira": JiraProvider(),
    "notion": NotionProvider(),
}


def get_provider(provider_name: str):
    p = PROVIDERS.get(provider_name.lower())
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Integration provider '{provider_name}' not supported. Valid providers: github, jira, notion."
        )
    return p


# Request / Response Schemas
class CallbackRequest(BaseModel):
    code: str = Field(..., description="OAuth 2.0 authorization code from vendor")
    state: Optional[str] = Field(default=None, description="CSRF state parameter")
    redirect_uri: Optional[str] = None


class SyncRequest(BaseModel):
    resource_ids: List[str] = Field(default_factory=list, description="IDs of repositories, projects, or databases to synchronize")


class ConfigUpdateRequest(BaseModel):
    github_client_id: Optional[str] = None
    github_client_secret: Optional[str] = None
    github_app_id: Optional[str] = None
    jira_domain: Optional[str] = None
    jira_email: Optional[str] = None
    jira_api_token: Optional[str] = None
    jira_project_key: Optional[str] = None
    notion_api_key: Optional[str] = None
    notion_database_id: Optional[str] = None
    google_client_id: Optional[str] = None


@router.get("/status", summary="Get Unified Ecosystem Integration Status")
async def get_ecosystem_status(db: Session = Depends(get_db)):
    """Returns the comprehensive operational status of all external providers."""
    current_user = get_current_user()
    user_id = current_user.get("id", "usr_lead_01")

    # Fetch connections for this user
    connections = db.query(IntegrationConnection).filter(IntegrationConnection.user_id == user_id).all()
    conn_map = {c.provider: c for c in connections}

    gh_status = await PROVIDERS["github"].get_status(conn_map.get("github"))
    jira_status = await PROVIDERS["jira"].get_status(conn_map.get("jira"))
    notion_status = await PROVIDERS["notion"].get_status(conn_map.get("notion"))

    return {
        "status": "healthy",
        "user_id": user_id,
        "active_persona": current_user.get("name"),
        "google_auth": {
            "service": "Google Identity Services (OAuth2)",
            "configured": bool(settings.GOOGLE_CLIENT_ID),
            "client_id": settings.GOOGLE_CLIENT_ID or "SANDBOX_MOCK_CLIENT_ID",
            "mode": "live" if settings.GOOGLE_CLIENT_ID else "sandbox_mock",
            "connected": True,
            "account": {
                "name": current_user.get("name"),
                "email": current_user.get("email"),
                "role": current_user.get("role"),
                "avatar": current_user.get("avatar")
            }
        },
        "github": gh_status,
        "jira": jira_status,
        "notion": notion_status,
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/{provider}/auth-url", summary="Get Provider OAuth Authorization URL")
def get_provider_auth_url(
    provider: str,
    redirect_uri: Optional[str] = None,
    state: Optional[str] = None
):
    """Generates the vendor OAuth 2.0 authorization URL with CSRF protection."""
    prov = get_provider(provider)
    csrf_state = state or secrets.token_urlsafe(16)
    auth_url = prov.get_authorization_url(csrf_state, redirect_uri)
    return {
        "provider": provider,
        "auth_url": auth_url,
        "state": csrf_state
    }


@router.post("/{provider}/callback", summary="Handle OAuth 2.0 Callback and Store Encrypted Connection")
async def handle_provider_callback(
    provider: str,
    payload: CallbackRequest,
    db: Session = Depends(get_db)
):
    """
    Exchanges vendor authorization code for tokens, encrypts tokens,
    and creates or updates the user's IntegrationConnection record.
    """
    prov = get_provider(provider)
    current_user = get_current_user()
    user_id = current_user.get("id", "usr_lead_01")

    try:
        token_res = await prov.exchange_code(payload.code, payload.state, payload.redirect_uri)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to authenticate with {provider}: {str(e)}"
        )

    # Encrypt tokens before saving
    access_token_enc = TokenSecurity.encrypt(token_res.get("access_token"))
    refresh_token_enc = TokenSecurity.encrypt(token_res.get("refresh_token"))
    user_data = token_res.get("user", {})

    conn = db.query(IntegrationConnection).filter(
        IntegrationConnection.user_id == user_id,
        IntegrationConnection.provider == provider
    ).first()

    if not conn:
        conn = IntegrationConnection(
            user_id=user_id,
            provider=provider,
            provider_account_id=str(user_data.get("id", user_data.get("login", "unknown"))),
            provider_account_name=user_data.get("name") or user_data.get("login") or user_data.get("site_name") or user_data.get("workspace_name"),
            avatar_url=user_data.get("avatar_url") or user_data.get("workspace_icon"),
            access_token_enc=access_token_enc,
            refresh_token_enc=refresh_token_enc,
            scopes=token_res.get("scopes"),
            status="CONNECTED",
            metadata_json=json.dumps({"connected_at": datetime.utcnow().isoformat()}),
            last_sync_at=datetime.utcnow()
        )
        db.add(conn)
    else:
        conn.provider_account_id = str(user_data.get("id", user_data.get("login", conn.provider_account_id)))
        conn.provider_account_name = user_data.get("name") or user_data.get("login") or user_data.get("site_name") or user_data.get("workspace_name") or conn.provider_account_name
        conn.avatar_url = user_data.get("avatar_url") or user_data.get("workspace_icon") or conn.avatar_url
        conn.access_token_enc = access_token_enc
        conn.refresh_token_enc = refresh_token_enc or conn.refresh_token_enc
        conn.status = "CONNECTED"
        conn.error_message = None
        conn.last_sync_at = datetime.utcnow()

    db.commit()
    db.refresh(conn)

    status_data = await prov.get_status(conn)
    return {
        "status": "success",
        "message": f"Successfully connected to {provider.upper()}!",
        "connection": status_data
    }


# ---------------------------------------------------------
# Direct Action Endpoints (Preserving compatibility with existing modals)
# Must be defined BEFORE /{provider}/... parameterized routes
# ---------------------------------------------------------

class JiraIssueRequest(BaseModel):
    component_name: str = Field(..., description="Target software component / file path")
    priority_score: float = Field(..., ge=0.0, le=100.0, description="5D Mathematical Priority Score")
    remediation_effort_hours: float = Field(default=8.0, description="Estimated remediation effort in hours")
    defect_probability: Optional[float] = Field(default=0.45, description="ML Predicted Defect Probability (0-1.0)")
    technical_risk: Optional[float] = Field(default=65.0, description="Technical Risk score (0-100)")
    business_impact: Optional[float] = Field(default=70.0, description="Business Impact score (0-100)")
    roi_quadrant: Optional[str] = Field(default="Quick Wins", description="ROI Matrix Quadrant")
    summary: Optional[str] = None
    issue_type: Optional[str] = "Task"
    explanation: Optional[str] = None


class JiraBulkExportRequest(BaseModel):
    sprint_name: Optional[str] = "Sprint 24 — Technical Debt Remediation"
    components: List[JiraIssueRequest]


class NotionSyncRequest(BaseModel):
    database_id: Optional[str] = None
    components: List[JiraIssueRequest]


class NotionAuditReportRequest(BaseModel):
    title: Optional[str] = "Executive Technical Debt Audit — Q3 2026"
    total_components: Optional[int] = 100
    avg_priority_score: Optional[float] = 64.2
    quick_wins_count: Optional[int] = 24
    critical_hotspots_count: Optional[int] = 12


@router.post("/jira/create-issue", summary="Create Single Jira Refactoring Issue")
async def create_single_jira_issue(payload: JiraIssueRequest):
    """Creates a single Jira Cloud issue for a specific technical debt component with ML defect metrics."""
    from backend.services.jira_service import create_jira_issue
    res = await create_jira_issue(payload.model_dump())
    return res


@router.post("/jira/bulk-export", summary="Bulk Export Prioritized Components to Jira Sprint")
async def bulk_export_sprint_to_jira(payload: JiraBulkExportRequest):
    """Converts a batch of prioritized debt components into Jira sprint backlog tickets."""
    from backend.services.jira_service import bulk_export_to_jira
    components_dict = [c.model_dump() for c in payload.components]
    res = await bulk_export_to_jira(components_dict, payload.sprint_name)
    return res


@router.post("/notion/sync", summary="Sync Components to Notion Database")
async def sync_to_notion_database(payload: NotionSyncRequest):
    """Synchronizes prioritized technical debt items into a live Notion database."""
    from backend.services.notion_service import sync_backlog_to_notion
    components_dict = [c.model_dump() for c in payload.components]
    res = await sync_backlog_to_notion(components_dict, payload.database_id)
    return res


@router.post("/notion/create-report", summary="Create Executive Audit Report in Notion")
async def create_audit_report_in_notion(payload: NotionAuditReportRequest):
    """Publishes a comprehensive Tech Debt Executive Audit Report to Notion."""
    from backend.services.notion_service import create_notion_audit_report
    res = await create_notion_audit_report(payload.model_dump())
    return res


@router.post("/config", summary="Update Live Integration Credentials")
def update_credentials_config(payload: ConfigUpdateRequest):
    """Dynamically updates integration credentials at runtime."""
    if payload.github_client_id is not None:
        settings.GITHUB_CLIENT_ID = payload.github_client_id
    if payload.github_client_secret is not None:
        settings.GITHUB_CLIENT_SECRET = payload.github_client_secret
    if payload.github_app_id is not None:
        settings.GITHUB_APP_ID = payload.github_app_id
    if payload.jira_domain is not None:
        settings.JIRA_DOMAIN = payload.jira_domain
    if payload.jira_email is not None:
        settings.JIRA_EMAIL = payload.jira_email
    if payload.jira_api_token is not None:
        settings.JIRA_API_TOKEN = payload.jira_api_token
    if payload.jira_project_key is not None:
        settings.JIRA_PROJECT_KEY = payload.jira_project_key
    if payload.notion_api_key is not None:
        settings.NOTION_API_KEY = payload.notion_api_key
    if payload.notion_database_id is not None:
        settings.NOTION_DATABASE_ID = payload.notion_database_id
    if payload.google_client_id is not None:
        settings.GOOGLE_CLIENT_ID = payload.google_client_id

    return {
        "status": "success",
        "message": "Integration configurations successfully updated."
    }


# ---------------------------------------------------------
# Dynamic Generic Provider Endpoints
# ---------------------------------------------------------

@router.get("/{provider}/resources", summary="List Accessible Repositories, Projects, or Databases")
async def get_provider_resources(
    provider: str,
    q: Optional[str] = Query(default=None, description="Search keyword query"),
    db: Session = Depends(get_db)
):
    """Fetches accessible repositories (GitHub), projects (Jira), or databases (Notion)."""
    prov = get_provider(provider)
    current_user = get_current_user()
    user_id = current_user.get("id", "usr_lead_01")

    conn = db.query(IntegrationConnection).filter(
        IntegrationConnection.user_id == user_id,
        IntegrationConnection.provider == provider
    ).first()

    resources = await prov.get_resources(conn, query=q)
    return resources


@router.post("/{provider}/sync", summary="Synchronize Selected Provider Resources")
async def sync_provider_resources(
    provider: str,
    payload: SyncRequest,
    db: Session = Depends(get_db)
):
    """Triggers deep AST scanning and technical-debt metric synchronization for selected resources."""
    prov = get_provider(provider)
    current_user = get_current_user()
    user_id = current_user.get("id", "usr_lead_01")

    conn = db.query(IntegrationConnection).filter(
        IntegrationConnection.user_id == user_id,
        IntegrationConnection.provider == provider
    ).first()

    result = await prov.sync(conn, payload.resource_ids, db)
    return result


@router.post("/{provider}/disconnect", summary="Disconnect Integration and Revoke Token")
async def disconnect_provider(
    provider: str,
    db: Session = Depends(get_db)
):
    """Safely disconnects provider integration."""
    prov = get_provider(provider)
    current_user = get_current_user()
    user_id = current_user.get("id", "usr_lead_01")

    conn = db.query(IntegrationConnection).filter(
        IntegrationConnection.user_id == user_id,
        IntegrationConnection.provider == provider
    ).first()

    await prov.disconnect(conn, db)
    return {
        "status": "success",
        "message": f"{provider.capitalize()} integration has been successfully disconnected."
    }


@router.post("/webhooks/{provider}", summary="Receive Inbound Webhook Events")
async def receive_provider_webhook(
    provider: str,
    request: Request,
    db: Session = Depends(get_db)
):
    """Processes incoming vendor webhooks (GitHub push/PR, Jira issue update)."""
    prov = get_provider(provider)
    headers = dict(request.headers)
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    result = await prov.handle_webhook(payload, headers, db)
    return result

