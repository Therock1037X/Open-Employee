import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.core.database import SessionLocal, ApprovalRecord, AgentTaskRecord, AuditLogRecord

MONEY_ACTIONS = {"upi_payout", "refund", "vendor_payment", "order_inventory", "transfer_money"}
EXTERNAL_SEND_ACTIONS = {"whatsapp_send", "instagram_post", "voice_call_supplier", "gst_submit"}

class ApprovalGate:
    """
    Enforces the mandatory approval gate:
    Money-moving or external-send actions MUST pass human approval before execution.
    """

    @staticmethod
    def is_approval_required(action: str, payload: Dict[str, Any]) -> bool:
        act = action.lower()
        if act in MONEY_ACTIONS or act in EXTERNAL_SEND_ACTIONS:
            return True
        if payload.get("amount") and float(payload.get("amount", 0)) > 0:
            return True
        if payload.get("send_external"):
            return True
        return False

    @staticmethod
    def register_for_approval(
        task_id: str,
        action: str,
        details: Dict[str, Any],
        amount: Optional[float] = None,
        recipient: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> ApprovalRecord:
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            record = ApprovalRecord(
                task_id=task_id,
                action=action,
                amount=amount,
                recipient=recipient,
                details=details,
                status="pending",
                created_at=datetime.utcnow(),
            )
            db.add(record)

            # Update task record status
            task = db.query(AgentTaskRecord).filter(AgentTaskRecord.id == task_id).first()
            if task:
                task.status = "awaiting_approval"
                task.requires_approval = True

            # Log audit event
            audit = AuditLogRecord(
                actor="agent",
                action="approval_requested",
                detail={"task_id": task_id, "action": action, "amount": amount},
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
            db.refresh(record)
            return record
        finally:
            if close_session:
                db.close()

    @staticmethod
    def get_pending_approvals(db: Optional[Session] = None) -> List[ApprovalRecord]:
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            return (
                db.query(ApprovalRecord)
                .filter(ApprovalRecord.status == "pending")
                .order_by(ApprovalRecord.created_at.desc())
                .all()
            )
        finally:
            if close_session:
                db.close()

    @staticmethod
    def decide(
        task_id: str,
        approved: bool,
        decided_by: str = "Owner",
        reason: Optional[str] = None,
        db: Optional[Session] = None,
    ) -> Optional[ApprovalRecord]:
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            record = (
                db.query(ApprovalRecord)
                .filter(ApprovalRecord.task_id == task_id, ApprovalRecord.status == "pending")
                .first()
            )
            if not record:
                return None

            record.status = "approved" if approved else "rejected"
            record.decided_by = decided_by
            record.decided_at = datetime.utcnow()

            task = db.query(AgentTaskRecord).filter(AgentTaskRecord.id == task_id).first()
            if task:
                task.status = "running" if approved else "failed"

            # Log decision to audit
            audit = AuditLogRecord(
                actor=decided_by,
                action="approval_decision",
                detail={
                    "task_id": task_id,
                    "approved": approved,
                    "reason": reason,
                    "action": record.action,
                },
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
            db.refresh(record)

            # Auto-dispatch external send actions when approved
            if approved and record.action == "whatsapp_send":
                try:
                    from app.modules.integrations.whatsapp.client import whatsapp_client
                    import asyncio
                    details = record.details or {}
                    to_phone = details.get("to_phone") or record.recipient or ""
                    
                    try:
                        loop = asyncio.get_running_loop()
                        if details.get("template_name"):
                            loop.create_task(whatsapp_client.send_template(
                                to_phone=to_phone,
                                template_name=details.get("template_name", "hello_world"),
                                language_code=details.get("language_code", "en_US"),
                                components=details.get("components"),
                            ))
                        elif details.get("type") == "marketing_status":
                            loop.create_task(whatsapp_client.post_status(
                                text=details.get("text"),
                                image_url=details.get("image_url"),
                                to_phone=to_phone,
                            ))
                        else:
                            loop.create_task(whatsapp_client.send_message(
                                to_phone=to_phone,
                                message=details.get("message", ""),
                                image_url=details.get("image_url"),
                            ))
                    except RuntimeError:
                        # If no running loop, run synchronously with asyncio.run
                        if details.get("template_name"):
                            asyncio.run(whatsapp_client.send_template(
                                to_phone=to_phone,
                                template_name=details.get("template_name", "hello_world"),
                                language_code=details.get("language_code", "en_US"),
                                components=details.get("components"),
                            ))
                        elif details.get("type") == "marketing_status":
                            asyncio.run(whatsapp_client.post_status(
                                text=details.get("text"),
                                image_url=details.get("image_url"),
                                to_phone=to_phone,
                            ))
                        else:
                            asyncio.run(whatsapp_client.send_message(
                                to_phone=to_phone,
                                message=details.get("message", ""),
                                image_url=details.get("image_url"),
                            ))
                except Exception:
                    pass

            return record
        finally:
            if close_session:
                db.close()

approval_gate = ApprovalGate()
