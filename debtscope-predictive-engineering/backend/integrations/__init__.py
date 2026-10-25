"""
Unified External Integrations Architecture for DebtScope.
Provides standardized Provider adapters (GitHub, Jira, Notion, Google),
normalized telemetry entities, and secure encrypted token management.
"""

from backend.integrations.base import IntegrationProvider
from backend.integrations.normalizer import (
    NormalizedRepository,
    NormalizedCommit,
    NormalizedPullRequest,
    NormalizedIssue,
    NormalizedDoc,
)
from backend.integrations.token_security import TokenSecurity

__all__ = [
    "IntegrationProvider",
    "NormalizedRepository",
    "NormalizedCommit",
    "NormalizedPullRequest",
    "NormalizedIssue",
    "NormalizedDoc",
    "TokenSecurity",
]
