"""
IntegrationProvider Abstract Base Class.
Defines the standardized interface that all ecosystem providers (GitHub, Jira, Notion) must implement.
"""

from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from backend.database.models import IntegrationConnection


class IntegrationProvider(ABC):
    """Standard contract for all DebtScope external data integrations."""

    provider_name: str = "generic"

    @abstractmethod
    def get_authorization_url(self, state: str, redirect_uri: Optional[str] = None) -> str:
        """Returns the vendor OAuth 2.0 authorization URL with required scopes and CSRF state."""
        pass

    @abstractmethod
    async def exchange_code(self, code: str, state: Optional[str] = None, redirect_uri: Optional[str] = None) -> Dict[str, Any]:
        """Exchanges authorization code for access and refresh tokens, fetching user identity."""
        pass

    @abstractmethod
    async def get_status(self, connection: Optional[IntegrationConnection]) -> Dict[str, Any]:
        """Returns connection health, token expiry, connected account name, and resource count."""
        pass

    @abstractmethod
    async def get_resources(self, connection: Optional[IntegrationConnection], query: Optional[str] = None) -> Dict[str, Any]:
        """Fetches accessible repositories, Jira projects, or Notion databases."""
        pass

    @abstractmethod
    async def sync(self, connection: Optional[IntegrationConnection], resource_ids: List[str], db: Session) -> Dict[str, Any]:
        """Synchronizes selected resources, maps them into normalized entities, and updates telemetry."""
        pass

    @abstractmethod
    async def disconnect(self, connection: Optional[IntegrationConnection], db: Session) -> bool:
        """Revokes vendor tokens and sets connection record status to DISCONNECTED."""
        pass

    @abstractmethod
    async def handle_webhook(self, payload: Dict[str, Any], headers: Dict[str, str], db: Session) -> Dict[str, Any]:
        """Processes incoming webhook events from the vendor and triggers incremental AST analysis."""
        pass
