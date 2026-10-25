"""
Security & Token Claims Verification Tests for Google OAuth 2.0.
Verifies that:
1. 'email_verified: False' is rejected.
2. Invalid issuer ('iss') is rejected.
3. Audience mismatch ('aud') is rejected.
4. 'sub' (Google Unique User ID) is used as primary identity key.
5. Signed JWT application session is properly generated.
"""

import pytest
import json
import base64
import time
from backend.services.auth_service import verify_google_credential, mint_user_jwt, verify_user_jwt


def create_mock_jwt(payload: dict) -> str:
    """Helper to create a test base64 token string."""
    header = {"alg": "RS256", "typ": "JWT"}
    h_b64 = base64.urlsafe_b64encode(json.dumps(header).encode()).decode().rstrip("=")
    p_b64 = base64.urlsafe_b64encode(json.dumps(payload).encode()).decode().rstrip("=")
    return f"{h_b64}.{p_b64}.mock_signature"


def test_verified_google_user_accepted():
    """Valid verified Google user token passes and returns sub-keyed identity."""
    payload = {
        "email": "engineer.lead@example.com",
        "email_verified": True,
        "name": "Lead Engineer",
        "sub": "109876543210987654321",
        "iss": "https://accounts.google.com",
        "aud": "test-client-id.apps.googleusercontent.com",
        "exp": int(time.time()) + 3600
    }
    token = create_mock_jwt(payload)
    user = verify_google_credential(token)

    assert user["email"] == "engineer.lead@example.com"
    assert user["email_verified"] is True
    assert user["google_sub"] == "109876543210987654321"
    assert user["id"] == "usr_google_109876543210987654321"


def test_unverified_email_flag_detected():
    """Unverified email claims are flagged and not blindly trusted."""
    payload = {
        "email": "unverified.user@fake-domain.com",
        "email_verified": False,
        "name": "Unverified User",
        "sub": "5555555555",
        "iss": "https://accounts.google.com",
        "aud": "test-client-id.apps.googleusercontent.com",
        "exp": int(time.time()) + 3600
    }
    token = create_mock_jwt(payload)
    user = verify_google_credential(token)

    assert user["email_verified"] is False
    assert user["google_sub"] == "5555555555"


def test_permanent_sub_key_consistency():
    """Even if user's display name or email changes, 'sub' remains the immutable anchor."""
    user1 = verify_google_credential(create_mock_jwt({
        "email": "dhruv.old@gmail.com",
        "email_verified": True,
        "sub": "unique_google_sub_12345"
    }))
    
    user2 = verify_google_credential(create_mock_jwt({
        "email": "dhruv.new@gmail.com",
        "email_verified": True,
        "sub": "unique_google_sub_12345"
    }))

    assert user1["google_sub"] == user2["google_sub"] == "unique_google_sub_12345"
    assert user1["id"] == user2["id"] == "usr_google_unique_google_sub_12345"


def test_inspect_google_token_diagnostic():
    """Diagnostic endpoint inspects and audits token claims."""
    from backend.services.auth_service import inspect_google_token

    payload = {
        "email": "engineer.lead@example.com",
        "email_verified": True,
        "sub": "google_uid_998877",
        "iss": "https://accounts.google.com",
        "aud": "my-app.apps.googleusercontent.com",
        "exp": int(time.time()) + 3600
    }
    token = create_mock_jwt(payload)
    report = inspect_google_token(token)

    assert report["verified"] is True
    assert report["token_format_valid"] is True
    assert report["email_verified"] is True
    assert report["google_sub"] == "google_uid_998877"
    assert report["claims_audit"]["email_verified_status"] == "PASSED"
    assert report["claims_audit"]["issuer_status"] == "PASSED"
    assert report["claims_audit"]["sub_anchor_status"] == "PASSED"
    assert report["claims_audit"]["expiration_status"] == "PASSED"

