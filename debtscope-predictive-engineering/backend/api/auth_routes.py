"""
Authentication & RBAC API Routes.
Exposes endpoints for Server-Side Google OAuth 2.0 Authorization Flow,
JWT token verification, and 1-Click evaluation persona switching.
"""

from fastapi import APIRouter, HTTPException, status, Query
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from backend.services.auth_service import (
    get_current_user,
    set_active_profile,
    verify_google_credential,
    inspect_google_token,
    get_google_login_url,
    exchange_google_code,
    mint_user_jwt,
    verify_user_jwt,
    logout_user,
    DEMO_PROFILES
)
from backend.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication & RBAC"])


class GoogleLoginRequest(BaseModel):
    credential: str = Field(..., description="Google OAuth 2.0 ID Token JWT string")


class SwitchProfileRequest(BaseModel):
    profile_key: str = Field(..., description="Demo profile key (e.g. 'dhruv', 'sarah', 'alex', 'developer')")


class VerifyJwtRequest(BaseModel):
    token: str = Field(..., description="Application JWT token string")


@router.get("/me", summary="Get Current Authenticated User")
def get_me():
    """Returns the current active user session profile, role, and granted permissions."""
    user = get_current_user()
    token = mint_user_jwt(user)
    return {
        "status": "authenticated",
        "user": user,
        "token": token
    }


@router.get("/profiles", summary="List Available Demo Profiles")
def list_demo_profiles():
    """Returns the set of available role-based demo profiles for evaluation."""
    return {
        "profiles": DEMO_PROFILES,
        "active_profile": get_current_user()
    }


@router.get("/google/login", summary="Initiate Google OAuth 2.0 Authorization Code Flow")
def google_oauth_login():
    """
    Redirects user to Google OAuth 2.0 consent screen if client ID is set,
    or smoothly authenticates with signed evaluation JWT if in sandbox mode.
    """
    if not settings.GOOGLE_CLIENT_ID:
        user = get_current_user()
        token = mint_user_jwt(user)
        frontend_url = settings.FRONTEND_URL.rstrip("/")
        return RedirectResponse(f"/?auth_success=true#token={token}")
    
    auth_url = get_google_login_url()
    return RedirectResponse(auth_url)



@router.get("/google/callback", summary="Google OAuth 2.0 Callback Handler")
async def google_oauth_callback(code: str = Query(..., description="Authorization code from Google"), state: Optional[str] = None):
    """
    Exchanges code for tokens on backend, mints application JWT,
    and redirects to frontend with #token=... fragment.
    """
    res = await exchange_google_code(code)
    app_token = res.get("app_token", "")
    frontend_url = settings.FRONTEND_URL.rstrip("/")
    
    # Use URL fragment (#token=...) to keep JWT out of server access logs
    redirect_url = f"{frontend_url}/auth/callback#token={app_token}"
    return RedirectResponse(redirect_url)


class GoogleCodeExchangeRequest(BaseModel):
    code: str = Field(..., description="One-time authorization code from Google Identity Services popup")


@router.post("/google/code", summary="Exchange Google OAuth 2.0 Authorization Code from Popup")
async def exchange_google_code_endpoint(payload: GoogleCodeExchangeRequest):
    """
    Exchanges authorization code received from GIS initCodeClient popup flow
    at Google Token endpoint (redirect_uri='postmessage'), validates user info,
    and returns authenticated user object with signed application JWT.
    """
    if not payload.code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google OAuth authorization code."
        )
    result = await exchange_google_code(payload.code, redirect_uri="postmessage")
    return {
        "status": "success",
        "user": result["user"],
        "token": result["app_token"]
    }


@router.post("/verify-jwt", summary="Verify and Decode Application JWT")
def verify_jwt_endpoint(payload: VerifyJwtRequest):
    """Verifies client-stored JWT and returns active user profile."""
    user = verify_user_jwt(payload.token)
    return {
        "status": "valid",
        "user": user
    }


@router.post("/google", summary="Authenticate via Direct Google ID Token")
def login_with_google_id_token(payload: GoogleLoginRequest):
    """
    Direct ID token verification fallback.
    """
    if not payload.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing Google OAuth credential token."
        )
    user = verify_google_credential(payload.credential)
    token = mint_user_jwt(user)
    return {
        "status": "success",
        "message": f"Successfully authenticated as {user['name']} ({user['role']})",
        "user": user,
        "token": token
    }


@router.post("/google/inspect", summary="Inspect and Audit Google ID Token Claims")
def inspect_google_token_endpoint(payload: GoogleLoginRequest):
    """
    Diagnostic & audit endpoint for inspecting Google OIDC token claims:
    - email_verified
    - sub (Google unique user id)
    - aud (audience)
    - iss (issuer)
    - exp (token expiration)
    """
    if not payload.credential:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Missing token credential to inspect."
        )
    return inspect_google_token(payload.credential)


@router.post("/switch-profile", summary="Switch Demo Identity Profile")
def switch_profile(payload: SwitchProfileRequest):
    """
    Switches the platform persona (e.g. Lead Architect, Staff ML Engineer, Product Owner).
    """
    try:
        user = set_active_profile(payload.profile_key)
        token = mint_user_jwt(user)
        return {
            "status": "success",
            "message": f"Switched active persona to {user['name']} ({user['role']})",
            "user": user,
            "token": token
        }
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/logout", summary="Log Out Active Session")
def logout():
    """Logs out and resets to the default Lead Architect persona."""
    return logout_user()
