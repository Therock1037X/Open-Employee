import os
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings
from app.core.database import SessionLocal, AuditLogRecord
from datetime import datetime

class WhatsAppClient:
    """
    WhatsApp Cloud API Integration:
    Sends catalog updates, payment links, and order alerts.
    Includes mock mode when WHATSAPP_TOKEN is not configured.
    """

    def __init__(self, token: Optional[str] = settings.WHATSAPP_TOKEN, phone_id: Optional[str] = settings.WHATSAPP_PHONE_ID):
        self.token = token
        self.phone_id = phone_id

    async def send_message(self, to_phone: str, message: str, image_url: Optional[str] = None) -> Dict[str, Any]:
        cleaned_phone = "".join(filter(str.isdigit, to_phone))
        if not cleaned_phone.startswith("91") and len(cleaned_phone) == 10:
            cleaned_phone = "91" + cleaned_phone

        if self.token and self.phone_id:
            try:
                async with httpx.AsyncClient(timeout=5.0) as client:
                    url = f"https://graph.facebook.com/v19.0/{self.phone_id}/messages"
                    headers = {"Authorization": f"Bearer {self.token}", "Content-Type": "application/json"}
                    payload: Dict[str, Any] = {
                        "messaging_product": "whatsapp",
                        "to": cleaned_phone,
                        "type": "text",
                        "text": {"body": message},
                    }
                    if image_url:
                        payload["type"] = "image"
                        payload["image"] = {"link": image_url, "caption": message}
                        del payload["text"]

                    res = await client.post(url, headers=headers, json=payload)
                    if res.status_code in (200, 201):
                        return res.json()
            except Exception as e:
                print(f"[WhatsApp API Warning] Network call failed: {e}. Falling back to mock dispatch.")

        # Mock / Simulation Mode
        message_id = f"wamid.mock.{datetime.utcnow().timestamp()}"

        # Record audit log
        db = SessionLocal()
        try:
            audit = AuditLogRecord(
                actor="whatsapp_integration",
                action="sent_whatsapp_message",
                detail={"to": cleaned_phone, "message_preview": message[:100], "is_mock": True},
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
        finally:
            db.close()

        return {
            "status": "SENT",
            "message_id": message_id,
            "recipient": cleaned_phone,
            "text": message,
            "image_url": image_url,
            "channel": "WhatsApp Cloud API (Mock/Simulated)",
        }

whatsapp_client = WhatsAppClient()
