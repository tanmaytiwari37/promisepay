"""Verify Firebase ID tokens (Google sign-in) on the server.

Uses google-auth, which checks the signature against Google's public keys
plus the audience/issuer for our Firebase project. No service-account secret needed.
"""
from typing import Optional
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from app.core.config import settings

_request = google_requests.Request()


def verify_firebase_token(token: str) -> Optional[dict]:
    """Return the decoded token claims, or None if the token is invalid."""
    if not settings.FIREBASE_PROJECT_ID:
        return None
    try:
        return google_id_token.verify_firebase_token(
            token, _request, audience=settings.FIREBASE_PROJECT_ID
        )
    except Exception:
        return None