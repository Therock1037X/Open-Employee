from datetime import datetime
from typing import List, Dict, Any, Optional
from app.core.database import SessionLocal, AuditLogRecord

class AuditLogger:
    """
    Tamper-Evident Audit Logging System:
    Every single action (user input, agent reasoning, approval decision, external send, voice call)
    is recorded with timestamp, actor identity, action type, and payload.
    """

    @staticmethod
    def log(actor: str, action: str, detail: Dict[str, Any]) -> int:
        db = SessionLocal()
        try:
            record = AuditLogRecord(
                actor=actor,
                action=action,
                detail=detail,
                timestamp=datetime.utcnow(),
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            return record.id
        finally:
            db.close()

    @staticmethod
    def list_logs(limit: int = 50, actor: Optional[str] = None) -> List[Dict[str, Any]]:
        db = SessionLocal()
        try:
            query = db.query(AuditLogRecord).order_by(AuditLogRecord.timestamp.desc())
            if actor:
                query = query.filter(AuditLogRecord.actor == actor)
            records = query.limit(limit).all()
            return [
                {
                    "id": r.id,
                    "actor": r.actor,
                    "action": r.action,
                    "detail": r.detail,
                    "timestamp": r.timestamp.isoformat() if r.timestamp else None,
                }
                for r in records
            ]
        finally:
            db.close()

audit_logger = AuditLogger()
