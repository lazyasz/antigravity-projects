# Google OAuth 2.0 & Token Claims Verification Specification

## 1. Architecture Overview
- **Protocol**: OpenID Connect (OIDC) / OAuth 2.0 Authorization Code Flow (`initCodeClient`)
- **SDK**: Google Identity Services (GIS) — `https://accounts.google.com/gsi/client`
- **Frontend Stack**: React 18, Vite, `google.accounts.oauth2.initCodeClient` (`prompt: 'select_account'`)
- **Backend Stack**: Python 3.11+ (FastAPI), `google-auth` (`google.oauth2.id_token.verify_oauth2_token`), PyJWT

---

## 2. Core Cryptographic & Claim Validation Rules

Every Google token received by the backend must pass five distinct security checks before a session is issued:

| Claim | Type | Validation Rule | Security Purpose |
| :--- | :--- | :--- | :--- |
| **`signature`** | Cryptographic | Verified against Google's public JWK certs (`https://www.googleapis.com/oauth2/v3/certs`) | Guarantees token was signed by Google and not forged. |
| **`email_verified`**| `boolean` | **Must be strictly `true`** | Guarantees Google confirmed user owns the email. |
| **`sub`** | `string` | **Used as primary key** (`usr_google_{sub}`) | Permanent Google User ID; prevents account hijacking via email renames. |
| **`aud`** | `string` | **Must match `GOOGLE_CLIENT_ID`** | Rejects valid Google tokens minted for third-party apps. |
| **`iss`** | `string` | **`accounts.google.com`** or **`https://accounts.google.com`** | Verifies token origin. |
| **`exp`** | `integer` | **`exp > current_timestamp_utc`** | Rejects expired tokens. |

---

## 3. Diagnostic & Audit Endpoint (`POST /api/auth/google/inspect`)

A development and compliance inspection endpoint for verifying decoded token claims and audit pass/fail states.

### Request
```http
POST /api/auth/google/inspect HTTP/1.1
Host: pei-platform.onrender.com
Content-Type: application/json

{
  "credential": "eyJhbGciOiJSUzI1NiIsImtpZCI6..."
}
```

### Response (Sanitized Example)
```json
{
  "verified": true,
  "token_format_valid": true,
  "email": "engineer.lead@example.com",
  "email_verified": true,
  "google_sub": "109876543210987654321",
  "issuer": "https://accounts.google.com",
  "audience": "YOUR_CLIENT_ID.apps.googleusercontent.com",
  "is_expired": false,
  "expires_at": "2026-09-16T18:00:00+00:00",
  "claims_audit": {
    "email_verified_status": "PASSED",
    "issuer_status": "PASSED",
    "sub_anchor_status": "PASSED",
    "expiration_status": "PASSED"
  }
}
```

---

## 4. Production Hardening Guidelines

1. **No PII Logging**: Never log raw token strings, email addresses, or full claims dictionaries to unencrypted application logs.
2. **Rate Limiting**: Protect `/api/auth/google/code` and `/api/auth/google/inspect` with per-IP rate limiting (e.g. 10 requests / minute) to prevent token validation oracle attacks.
3. **Session Anchoring**: Application database tables anchor foreign keys to `google_sub` rather than mutable email strings.
4. **Sign-Out Disconnect**: Call `google.accounts.id.disableAutoSelect()` on logout so users are prompted to choose their account on subsequent logins.

---

## 5. Automated Verification Test Suite

Tests in [`backend/tests/test_auth_security.py`](file:///C:/Users/dhruv/.gemini/antigravity-ide/scratch/Predictive-Engineering-Intelligence-Platform/backend/tests/test_auth_security.py):
- `test_verified_google_user_accepted`: Validates standard verified Google token.
- `test_unverified_email_flag_detected`: Validates detection of `email_verified: false`.
- `test_permanent_sub_key_consistency`: Validates `sub` identity anchor consistency across email changes.
- `test_inspect_google_token_diagnostic`: Validates diagnostic report generation with unambiguous top-level `verified: bool`.
