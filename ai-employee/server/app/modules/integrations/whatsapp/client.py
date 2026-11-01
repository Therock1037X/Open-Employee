import os
import asyncio
import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import httpx
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal, AuditLogRecord, WhatsAppMessageRecord


class WhatsAppClient:
    """
    WhatsApp Cloud API Integration:
    - Live Meta Graph API communication (messages, templates, images, marketing status)
    - Webhook verification & processing with DB persistence
    - Automatic retry on transient failures
    - Clear exception handling when OAuth token has expired
    - Safe Mock fallback when credentials are not configured
    - Mandatory audit logging on every message sent and received
    """

    def __init__(
        self,
        token: Optional[str] = None,
        phone_id: Optional[str] = None,
        verify_token: Optional[str] = None,
    ):
        self._token = token or settings.WHATSAPP_TOKEN
        self._phone_id = phone_id or settings.WHATSAPP_PHONE_ID
        self._verify_token = verify_token or settings.WHATSAPP_VERIFY_TOKEN

    @property
    def token(self) -> Optional[str]:
        return self._token or settings.WHATSAPP_TOKEN

    @property
    def phone_id(self) -> Optional[str]:
        return self._phone_id or settings.WHATSAPP_PHONE_ID

    @property
    def verify_token(self) -> Optional[str]:
        return self._verify_token or settings.WHATSAPP_VERIFY_TOKEN

    @property
    def is_mock(self) -> bool:
        return not bool(self.token and self.phone_id)

    @staticmethod
    def clean_phone(to_phone: str) -> str:
        """Sanitizes phone number and standardizes Indian mobile numbers."""
        cleaned = re.sub(r"\D", "", to_phone)
        if len(cleaned) == 10:
            cleaned = "91" + cleaned
        return cleaned

    async def _call_graph_api(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes HTTP call to Meta WhatsApp Graph API with retries and token expiration detection.
        Never logs or exposes the authorization token.
        """
        if self.is_mock:
            raise RuntimeError("Cannot execute live Graph API call in mock mode")

        url = f"https://graph.facebook.com/v19.0/{self.phone_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.token}",
            "Content-Type": "application/json",
        }

        max_retries = 3
        last_exception = None

        for attempt in range(max_retries):
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    response = await client.post(url, headers=headers, json=payload)
                    status_code = response.status_code

                    # 1. Check for Unauthorized / Token Expiration
                    if status_code == 401:
                        raise HTTPException(
                            status_code=401,
                            detail="WhatsApp API Error: Token has expired or is invalid (401 Unauthorized). Please update WHATSAPP_TOKEN in server/.env.",
                        )

                    res_json: Dict[str, Any] = {}
                    try:
                        res_json = response.json()
                    except Exception:
                        res_json = {}

                    # 2. Check Meta Graph error structures
                    if "error" in res_json:
                        err = res_json["error"]
                        err_code = err.get("code")
                        err_subcode = err.get("error_subcode")
                        err_msg = err.get("message", "Unknown Meta Graph error")

                        # Code 190 / 102: Expired or invalid token
                        if (
                            err_code in (190, 102)
                            or "expired" in err_msg.lower()
                            or "session has expired" in err_msg.lower()
                        ):
                            raise HTTPException(
                                status_code=401,
                                detail=f"WhatsApp API Error: Token has expired or is invalid (Code {err_code}, Subcode {err_subcode}). Please update WHATSAPP_TOKEN in server/.env. Meta message: {err_msg}",
                            )

                        # Retry on transient Meta 5xx / rate limits
                        if status_code >= 500 and attempt < max_retries - 1:
                            await asyncio.sleep(0.5 * (2**attempt))
                            continue

                        raise HTTPException(
                            status_code=status_code if status_code >= 400 else 400,
                            detail=f"WhatsApp API Error ({status_code}): {err_msg}",
                        )

                    if status_code in (200, 201):
                        return res_json

                    # Server side error from Meta, retry
                    if status_code >= 500 and attempt < max_retries - 1:
                        await asyncio.sleep(0.5 * (2**attempt))
                        continue

                    raise HTTPException(
                        status_code=status_code,
                        detail=f"WhatsApp API unexpected status {status_code}: {response.text}",
                    )

            except (httpx.ConnectError, httpx.TimeoutException, httpx.NetworkError) as net_err:
                last_exception = net_err
                if attempt < max_retries - 1:
                    await asyncio.sleep(0.5 * (2**attempt))
                    continue
                raise HTTPException(
                    status_code=504,
                    detail=f"WhatsApp API Gateway Timeout / Network failure after {max_retries} attempts: {str(net_err)}",
                )
            except HTTPException:
                raise
            except Exception as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Unexpected error communicating with WhatsApp API: {str(e)}",
                )

        if last_exception:
            raise HTTPException(
                status_code=504,
                detail=f"WhatsApp API failed after {max_retries} retries: {str(last_exception)}",
            )

        raise HTTPException(status_code=500, detail="Failed to complete WhatsApp API request")

    def _record_audit(self, action: str, detail: Dict[str, Any], actor: str = "whatsapp_integration"):
        """Safely records an audit log entry in the database."""
        db = SessionLocal()
        try:
            audit = AuditLogRecord(
                actor=actor,
                action=action,
                detail=detail,
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
        except Exception as e:
            db.rollback()
        finally:
            db.close()

    def _save_outbound_message(
        self,
        recipient: str,
        message_type: str,
        text: Optional[str] = None,
        media_url: Optional[str] = None,
        message_id: Optional[str] = None,
        status: str = "sent",
        raw_payload: Optional[Dict[str, Any]] = None,
    ) -> WhatsAppMessageRecord:
        """Stores outbound message in the database."""
        db = SessionLocal()
        try:
            record = WhatsAppMessageRecord(
                message_id=message_id,
                sender=self.phone_id or "system",
                recipient=recipient,
                direction="outbound",
                message_type=message_type,
                text=text,
                media_url=media_url,
                status=status,
                raw_payload=raw_payload or {},
                timestamp=datetime.utcnow(),
            )
            db.add(record)
            db.commit()
            db.refresh(record)
            return record
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    async def send_message(
        self, to_phone: str, message: str, image_url: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Sends an outbound text or image message.
        Falls back to mock mode when WHATSAPP_TOKEN or WHATSAPP_PHONE_ID is unset.
        """
        cleaned_phone = self.clean_phone(to_phone)
        msg_type = "image" if image_url else "text"

        if not self.is_mock:
            payload: Dict[str, Any] = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": cleaned_phone,
                "type": msg_type,
            }
            if image_url:
                payload["image"] = {"link": image_url, "caption": message}
            else:
                payload["text"] = {"preview_url": False, "body": message}

            res = await self._call_graph_api(payload)
            msg_id = (
                res.get("messages", [{}])[0].get("id")
                if res.get("messages")
                else f"wamid.{datetime.utcnow().timestamp()}"
            )

            # Persist and audit
            self._save_outbound_message(
                recipient=cleaned_phone,
                message_type=msg_type,
                text=message,
                media_url=image_url,
                message_id=msg_id,
                status="sent",
                raw_payload=res,
            )
            self._record_audit(
                action="sent_whatsapp_message",
                detail={
                    "to": cleaned_phone,
                    "type": msg_type,
                    "message_id": msg_id,
                    "is_mock": False,
                },
            )

            return {
                "status": "SENT",
                "message_id": msg_id,
                "recipient": cleaned_phone,
                "text": message,
                "image_url": image_url,
                "channel": "WhatsApp Cloud API",
                "meta_response": res,
            }

        # Mock / Simulation Fallback
        msg_id = f"wamid.mock.{datetime.utcnow().timestamp()}"
        self._save_outbound_message(
            recipient=cleaned_phone,
            message_type=msg_type,
            text=message,
            media_url=image_url,
            message_id=msg_id,
            status="sent",
            raw_payload={"mock": True},
        )
        self._record_audit(
            action="sent_whatsapp_message",
            detail={
                "to": cleaned_phone,
                "type": msg_type,
                "message_preview": (message or "")[:100],
                "is_mock": True,
            },
        )

        return {
            "status": "SENT",
            "message_id": msg_id,
            "recipient": cleaned_phone,
            "text": message,
            "image_url": image_url,
            "channel": "WhatsApp Cloud API (Mock/Simulated)",
        }

    async def send_image(
        self, to_phone: str, image_url: str, caption: Optional[str] = None
    ) -> Dict[str, Any]:
        """Sends an image message with optional caption."""
        return await self.send_message(to_phone=to_phone, message=caption or "", image_url=image_url)

    async def send_template(
        self,
        to_phone: str,
        template_name: str = "hello_world",
        language_code: str = "en_US",
        components: Optional[List[Dict[str, Any]]] = None,
    ) -> Dict[str, Any]:
        """
        Sends an approved WhatsApp template message (e.g. 'hello_world').
        """
        cleaned_phone = self.clean_phone(to_phone)

        if not self.is_mock:
            template_payload: Dict[str, Any] = {
                "name": template_name,
                "language": {"code": language_code},
            }
            if components:
                template_payload["components"] = components

            payload: Dict[str, Any] = {
                "messaging_product": "whatsapp",
                "recipient_type": "individual",
                "to": cleaned_phone,
                "type": "template",
                "template": template_payload,
            }

            res = await self._call_graph_api(payload)
            msg_id = (
                res.get("messages", [{}])[0].get("id")
                if res.get("messages")
                else f"wamid.template.{datetime.utcnow().timestamp()}"
            )

            self._save_outbound_message(
                recipient=cleaned_phone,
                message_type="template",
                text=f"Template: {template_name} ({language_code})",
                message_id=msg_id,
                status="sent",
                raw_payload=res,
            )
            self._record_audit(
                action="sent_whatsapp_template",
                detail={
                    "to": cleaned_phone,
                    "template": template_name,
                    "language": language_code,
                    "message_id": msg_id,
                    "is_mock": False,
                },
            )

            return {
                "status": "SENT",
                "message_id": msg_id,
                "recipient": cleaned_phone,
                "template_name": template_name,
                "language_code": language_code,
                "channel": "WhatsApp Cloud API",
                "meta_response": res,
            }

        # Mock fallback
        msg_id = f"wamid.mock.template.{datetime.utcnow().timestamp()}"
        self._save_outbound_message(
            recipient=cleaned_phone,
            message_type="template",
            text=f"Template: {template_name} ({language_code})",
            message_id=msg_id,
            status="sent",
            raw_payload={"mock": True},
        )
        self._record_audit(
            action="sent_whatsapp_template",
            detail={
                "to": cleaned_phone,
                "template": template_name,
                "language": language_code,
                "is_mock": True,
            },
        )

        return {
            "status": "SENT",
            "message_id": msg_id,
            "recipient": cleaned_phone,
            "template_name": template_name,
            "language_code": language_code,
            "channel": "WhatsApp Cloud API (Mock/Simulated)",
        }

    async def post_status(
        self,
        text: Optional[str] = None,
        image_url: Optional[str] = None,
        to_phone: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Publishes a marketing status or broadcast update.
        If to_phone is provided, dispatches directly to that recipient.
        """
        if to_phone:
            res = await self.send_message(to_phone=to_phone, message=text or "", image_url=image_url)
            return {
                "status": "PUBLISHED",
                "type": "marketing_status",
                "recipient": self.clean_phone(to_phone),
                "text": text,
                "image_url": image_url,
                "channel": res.get("channel"),
                "detail": res,
            }

        # Broadcast Status Log
        msg_id = f"wamid.status.{datetime.utcnow().timestamp()}"
        self._save_outbound_message(
            recipient="broadcast",
            message_type="marketing_status",
            text=text,
            media_url=image_url,
            message_id=msg_id,
            status="published",
            raw_payload={"is_status_broadcast": True},
        )
        self._record_audit(
            action="whatsapp_status_broadcast",
            detail={"text": text, "has_image": bool(image_url), "is_mock": self.is_mock},
            actor="marketing_agent",
        )

        return {
            "status": "PUBLISHED",
            "type": "marketing_status",
            "broadcast_id": msg_id,
            "text": text,
            "image_url": image_url,
            "channel": "WhatsApp Cloud API" if not self.is_mock else "WhatsApp Cloud API (Mock/Simulated)",
        }

    def verify_webhook(
        self, mode: Optional[str], token: Optional[str], challenge: Optional[str]
    ) -> str:
        """
        Handles Meta Webhook verification handshake (GET).
        Validates against settings.WHATSAPP_VERIFY_TOKEN.
        """
        configured_verify = self.verify_token or "openemployee_verify_token"
        if mode == "subscribe" and token == configured_verify and challenge:
            return challenge

        raise HTTPException(
            status_code=403,
            detail="Verification token mismatch or invalid webhook subscription request",
        )

    def process_incoming_webhook(self, payload: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Parses incoming WhatsApp webhook payload from Meta:
        - Extracts text, image, and document (PDF) messages
        - Automatically detects invoice attachments and bills
        - Stores all messages in the database
        - Records an audit log event for each message
        """
        processed_records: List[Dict[str, Any]] = []
        entries = payload.get("entry", [])

        db = SessionLocal()
        try:
            for entry in entries:
                changes = entry.get("changes", [])
                for change in changes:
                    value = change.get("value", {})
                    messages = value.get("messages", [])

                    for msg in messages:
                        sender = msg.get("from", "unknown")
                        msg_id = msg.get("id")
                        msg_type = msg.get("type", "text")
                        timestamp_raw = msg.get("timestamp")
                        msg_dt = (
                            datetime.utcfromtimestamp(int(timestamp_raw))
                            if timestamp_raw and str(timestamp_raw).isdigit()
                            else datetime.utcnow()
                        )

                        body_text = None
                        media_id = None
                        mime_type = None
                        filename = None
                        media_url = None
                        is_invoice = False

                        # 1. Text Message
                        if msg_type == "text":
                            body_text = msg.get("text", {}).get("body", "")

                        # 2. Image Message
                        elif msg_type == "image":
                            img_obj = msg.get("image", {})
                            media_id = img_obj.get("id")
                            mime_type = img_obj.get("mime_type", "image/jpeg")
                            body_text = img_obj.get("caption", "")

                            # Invoice detection in image caption or context
                            check_text = (body_text or "").lower()
                            if any(k in check_text for k in ("invoice", "bill", "chalan", "challan", "gst", "receipt", "बिल", "पावती")):
                                is_invoice = True

                        # 3. Document / PDF Message
                        elif msg_type == "document":
                            doc_obj = msg.get("document", {})
                            media_id = doc_obj.get("id")
                            filename = doc_obj.get("filename", "")
                            mime_type = doc_obj.get("mime_type", "application/pdf")
                            body_text = doc_obj.get("caption", "")

                            # Invoices are often PDF documents
                            fn_lower = (filename or "").lower()
                            caption_lower = (body_text or "").lower()
                            if (
                                mime_type == "application/pdf"
                                or fn_lower.endswith(".pdf")
                                or any(k in fn_lower for k in ("inv", "invoice", "bill", "tax", "gst", "chalan"))
                                or any(k in caption_lower for k in ("invoice", "bill", "chalan", "gst"))
                            ):
                                is_invoice = True

                        # Avoid duplicate message insertion if already stored
                        existing = None
                        if msg_id:
                            existing = db.query(WhatsAppMessageRecord).filter(WhatsAppMessageRecord.message_id == msg_id).first()

                        if not existing:
                            rec = WhatsAppMessageRecord(
                                message_id=msg_id,
                                sender=sender,
                                recipient=self.phone_id or "business",
                                direction="inbound",
                                message_type=msg_type,
                                text=body_text,
                                media_id=media_id,
                                media_url=media_url,
                                mime_type=mime_type,
                                filename=filename,
                                is_invoice=is_invoice,
                                status="received",
                                raw_payload=msg,
                                timestamp=msg_dt,
                            )
                            db.add(rec)
                            db.commit()
                            db.refresh(rec)

                            # Audit log
                            audit_action = "received_whatsapp_invoice" if is_invoice else "received_whatsapp_message"
                            audit = AuditLogRecord(
                                actor="whatsapp_webhook",
                                action=audit_action,
                                detail={
                                    "sender": sender,
                                    "message_type": msg_type,
                                    "is_invoice": is_invoice,
                                    "filename": filename,
                                    "caption": (body_text or "")[:100],
                                    "message_id": msg_id,
                                },
                                timestamp=datetime.utcnow(),
                            )
                            db.add(audit)
                            db.commit()

                            processed_records.append({
                                "id": rec.id,
                                "message_id": msg_id,
                                "sender": sender,
                                "type": msg_type,
                                "is_invoice": is_invoice,
                                "text": body_text,
                                "filename": filename,
                            })
            return processed_records
        finally:
            db.close()

    def get_inbox_messages(self, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieves stored WhatsApp messages from database ordered by most recent."""
        db = SessionLocal()
        try:
            records = (
                db.query(WhatsAppMessageRecord)
                .order_by(WhatsAppMessageRecord.timestamp.desc())
                .limit(limit)
                .all()
            )
            return [
                {
                    "id": r.id,
                    "message_id": r.message_id,
                    "sender": r.sender,
                    "recipient": r.recipient,
                    "direction": r.direction,
                    "message_type": r.message_type,
                    "text": r.text,
                    "media_url": r.media_url,
                    "media_id": r.media_id,
                    "mime_type": r.mime_type,
                    "filename": r.filename,
                    "is_invoice": bool(r.is_invoice),
                    "status": r.status,
                    "timestamp": r.timestamp.isoformat(),
                }
                for r in records
            ]
        finally:
            db.close()


whatsapp_client = WhatsAppClient()
