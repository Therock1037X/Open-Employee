from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from app.core.auth import verify_firebase_token
from app.modules.audit.client import audit_logger

router = APIRouter(prefix="/audit", tags=["audit"])


@router.get("/ping")
def ping():
    return {
        "module": "audit",
        "status": "online",
        "features": ["immutable_event_ledger", "actor_tracking", "action_payload_logging"],
    }


@router.get("/logs", response_model=List[Dict[str, Any]])
def get_audit_trail(
    limit: int = Query(50, le=200),
    actor: Optional[str] = Query(None),
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Retrieve comprehensive audit log of every agent action and human decision.
    """
    return audit_logger.list_logs(limit=limit, actor=actor)
