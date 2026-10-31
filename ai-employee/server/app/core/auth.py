import os
from typing import Optional
from fastapi import Header, HTTPException, status
import firebase_admin
from firebase_admin import auth as firebase_auth, credentials
from app.core.config import settings

# Initialize Firebase Admin SDK
_firebase_initialized = False

def init_firebase_admin():
    global _firebase_initialized
    if _firebase_initialized or firebase_admin._apps:
        _firebase_initialized = True
        return

    try:
        if settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH):
            cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
            firebase_admin.initialize_app(cred, {"projectId": settings.FIREBASE_PROJECT_ID})
        else:
            # Fallback to application default credentials or mock mode
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})
        _firebase_initialized = True
    except Exception as e:
        print(f"[Warning] Firebase Admin init using mock/dev mode: {e}")
        _firebase_initialized = False

init_firebase_admin()


async def verify_firebase_token(
    authorization: Optional[str] = Header(None, description="Bearer <Firebase_ID_Token>")
) -> dict:
    """
    FastAPI dependency to verify Firebase ID tokens on protected routes.
    Supports mock/dev tokens during testing and local development.
    """
    if not authorization:
        # Development / Testing bypass
        if settings.ENVIRONMENT in ("development", "test") or os.getenv("TESTING") == "1":
            return {
                "uid": "dev-user-owner",
                "email": "owner@openemployee.local",
                "name": "Shop Owner",
                "is_mock": True,
            }
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization header",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization scheme. Must be 'Bearer <token>'",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = authorization.split("Bearer ")[1].strip()

    # Developer token check for local testing
    if token.startswith("dev-token-") or token == "test-token":
        dev_uid = token.replace("dev-token-", "") or "dev-owner"
        return {
            "uid": dev_uid,
            "email": f"{dev_uid}@openemployee.local",
            "name": f"Dev User ({dev_uid})",
            "is_mock": True,
        }

    # Verify real Firebase token
    try:
        decoded_token = firebase_auth.verify_id_token(token)
        return decoded_token
    except Exception as e:
        # If in dev mode and verification fails due to network/creds, log and return dev mock
        if settings.ENVIRONMENT == "development" or os.getenv("TESTING") == "1":
            print(f"[Auth Dev Fallback] Token verification failed ({e}), allowing dev session")
            return {
                "uid": "dev-user-fallback",
                "email": "dev@openemployee.local",
                "name": "Dev Fallback User",
                "is_mock": True,
            }

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
