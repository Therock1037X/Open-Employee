import uuid
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, Body, Query, Response, HTTPException, Request

from app.core.auth import verify_firebase_token
from app.core.config import settings
from app.core.database import SessionLocal, WhatsAppMessageRecord, AuditLogRecord
from app.schemas.schemas import (
    WhatsAppMessage,
    WhatsAppImageMessage,
    WhatsAppTemplateRequest,
    WhatsAppStatusRequest,
    InstagramPostRequest,
    UPIOrderRequest,
    UPIOrderResponse,
    ExotelSMSRequest,
    ExotelSMSResponse,
)
from app.modules.integrations.whatsapp.client import whatsapp_client
from app.modules.integrations.instagram.client import instagram_client
from app.modules.integrations.indiamart.client import indiamart_client
from app.modules.integrations.payments_upi.client import razorpay_upi
from app.modules.integrations.finance_tools.tools import finance_tools
from app.modules.voice.telephony.client import exotel_client
from app.modules.agent.approval_gate.gate import approval_gate

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/ping")
def ping():
    """
    Status check for integrations.
    Returns whatsapp_mock: false when WHATSAPP_TOKEN and WHATSAPP_PHONE_ID are configured in server/.env.
    """
    is_mock = whatsapp_client.is_mock
    return {
        "module": "integrations",
        "status": "online",
        "whatsapp_mock": is_mock,
        "connectors": ["whatsapp_cloud", "instagram_graph", "indiamart", "razorpay_upi", "finance_tools"],
    }


@router.post("/whatsapp/send")
async def send_whatsapp(
    msg: WhatsAppMessage,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Sends an outbound WhatsApp text or image message.
    Routes through the Approval Gate if approved is False.
    """
    if not msg.approved:
        task_id = f"wa-{uuid.uuid4().hex[:8]}"
        approval_gate.register_for_approval(
            task_id=task_id,
            action="whatsapp_send",
            details={
                "to_phone": msg.to_phone,
                "message": msg.text,
                "image_url": msg.image_url,
            },
            recipient=msg.to_phone,
        )

        db = SessionLocal()
        try:
            wa_rec = WhatsAppMessageRecord(
                message_id=f"pending.{task_id}",
                sender="business",
                recipient=msg.to_phone,
                direction="outbound",
                message_type="image" if msg.image_url else "text",
                text=msg.text,
                media_url=msg.image_url,
                status="pending_approval",
                timestamp=datetime.utcnow(),
            )
            db.add(wa_rec)
            db.commit()
        finally:
            db.close()

        return {
            "status": "awaiting_approval",
            "task_id": task_id,
            "action": "whatsapp_send",
            "recipient": msg.to_phone,
            "message": "Outbound customer message routed to Approval Gate for owner authorization.",
        }

    return await whatsapp_client.send_message(
        to_phone=msg.to_phone,
        message=msg.text,
        image_url=msg.image_url,
    )


@router.post("/whatsapp/send-image")
async def send_whatsapp_image(
    msg: WhatsAppImageMessage,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Sends an image with optional caption.
    Routes through Approval Gate if approved is False.
    """
    if not msg.approved:
        task_id = f"wa-img-{uuid.uuid4().hex[:8]}"
        approval_gate.register_for_approval(
            task_id=task_id,
            action="whatsapp_send",
            details={
                "to_phone": msg.to_phone,
                "message": msg.caption or "Image attachment",
                "image_url": msg.image_url,
            },
            recipient=msg.to_phone,
        )
        return {
            "status": "awaiting_approval",
            "task_id": task_id,
            "action": "whatsapp_send",
            "recipient": msg.to_phone,
            "message": "Outbound image message routed to Approval Gate for owner authorization.",
        }

    return await whatsapp_client.send_image(
        to_phone=msg.to_phone,
        image_url=msg.image_url,
        caption=msg.caption,
    )


@router.post("/whatsapp/send-template")
async def send_whatsapp_template(
    req: WhatsAppTemplateRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Sends an approved WhatsApp Cloud API Template message (e.g. 'hello_world').
    """
    if not req.approved:
        task_id = f"wa-tpl-{uuid.uuid4().hex[:8]}"
        approval_gate.register_for_approval(
            task_id=task_id,
            action="whatsapp_send",
            details={
                "to_phone": req.to_phone,
                "template_name": req.template_name,
                "language_code": req.language_code,
                "components": req.components,
            },
            recipient=req.to_phone,
        )
        return {
            "status": "awaiting_approval",
            "task_id": task_id,
            "action": "whatsapp_send",
            "recipient": req.to_phone,
            "message": "Template dispatch routed to Approval Gate.",
        }

    return await whatsapp_client.send_template(
        to_phone=req.to_phone,
        template_name=req.template_name,
        language_code=req.language_code,
        components=req.components,
    )


@router.post("/whatsapp/post-status")
async def post_whatsapp_status(
    req: WhatsAppStatusRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Publishes marketing broadcast status updates (text and/or image).
    Routes through the Approval Gate if approved is False.
    """
    if not req.approved:
        task_id = f"wa-status-{uuid.uuid4().hex[:8]}"
        approval_gate.register_for_approval(
            task_id=task_id,
            action="whatsapp_send",
            details={
                "type": "marketing_status",
                "text": req.text,
                "image_url": req.image_url,
                "to_phone": req.to_phone,
            },
            recipient=req.to_phone or "Broadcast Audience",
        )
        return {
            "status": "awaiting_approval",
            "task_id": task_id,
            "action": "whatsapp_send",
            "message": "Marketing status broadcast routed to Approval Gate for owner sign-off.",
        }

    return await whatsapp_client.post_status(
        text=req.text,
        image_url=req.image_url,
        to_phone=req.to_phone,
    )


@router.get("/whatsapp/webhook")
async def verify_whatsapp_webhook(
    hub_mode: Optional[str] = Query(None, alias="hub.mode"),
    hub_verify_token: Optional[str] = Query(None, alias="hub.verify_token"),
    hub_challenge: Optional[str] = Query(None, alias="hub.challenge"),
):
    """
    Meta Webhook verification handshake (GET).
    Validates token and echoes back the challenge.
    """
    challenge = whatsapp_client.verify_webhook(
        mode=hub_mode,
        token=hub_verify_token,
        challenge=hub_challenge,
    )
    return Response(content=str(challenge), media_type="text/plain")


@router.post("/whatsapp/webhook")
async def receive_whatsapp_webhook(
    payload: Dict[str, Any] = Body(...),
):
    """
    Meta Webhook event receiving (POST).
    Parses incoming messages, images, and PDF invoice documents,
    persisting them into the database and logging to the audit trail.
    """
    processed = whatsapp_client.process_incoming_webhook(payload)
    return {
        "status": "EVENT_RECEIVED",
        "processed_count": len(processed),
        "items": processed,
    }


@router.get("/whatsapp/inbox")
def get_whatsapp_inbox(
    limit: int = 50,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Retrieves stored WhatsApp inbox messages from the database.
    """
    return whatsapp_client.get_inbox_messages(limit=limit)


@router.post("/instagram/post")
async def post_instagram(
    post: InstagramPostRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Publishes an image post to Instagram with auto-generated caption.
    """
    return await instagram_client.publish_photo(
        image_url=post.image_url,
        caption=post.caption,
        product=post.topic or "Fresh Stock",
    )


@router.get("/indiamart/leads")
async def get_indiamart_leads(current_user: dict = Depends(verify_firebase_token)):
    """
    Fetches real-time buyer leads and inquiries from IndiaMART.
    """
    return await indiamart_client.get_recent_leads()


@router.post("/upi/order", response_model=UPIOrderResponse)
def create_upi_checkout(
    order: UPIOrderRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Generates an embedded Razorpay UPI payment link and dynamic QR code.
    """
    res = razorpay_upi.create_upi_payment_order(
        amount=order.amount,
        customer_name=order.customer_name,
        customer_phone=order.customer_phone,
        description=order.description,
    )
    return UPIOrderResponse(
        order_id=res["order_id"],
        amount=res["amount"],
        upi_link=res["upi_link"],
        qr_code_url=res["qr_code_url"],
        payment_link=res.get("payment_link"),
        status=res["status"],
    )


@router.get("/finance/tax-calculate")
def calculate_item_tax(
    category: str = "sugar",
    amount: float = 1000.0,
    interstate: bool = False,
):
    """
    Calculates GST breakdown (CGST, SGST, IGST) for an invoice amount.
    """
    return finance_tools.calculate_tax(item_category=category, taxable_value=amount, is_interstate=interstate)


@router.post("/sms/send", response_model=ExotelSMSResponse)
async def send_exotel_sms(
    sms_req: ExotelSMSRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Sends an outbound SMS using Exotel official API.
    Bypasses Approval Gate only when TEST_MODE=true or approved=True.
    In all other cases, requests are queued in the Approval Gate.
    """
    to_phone = exotel_client.normalize_phone(sms_req.to)

    if settings.TEST_MODE or sms_req.approved:
        res = await exotel_client.send_sms(to=to_phone, text=sms_req.text)
        db = SessionLocal()
        try:
            audit = AuditLogRecord(
                actor=current_user.get("name") or "owner",
                action="exotel_sms_sent",
                detail={
                    "sms_sid": res.get("sms_sid"),
                    "to": to_phone,
                    "text": sms_req.text,
                    "test_mode": settings.TEST_MODE,
                },
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
        finally:
            db.close()

        return ExotelSMSResponse(
            sms_sid=res.get("sms_sid"),
            sid=res.get("sms_sid"),
            status=res.get("status", "sent"),
            to=to_phone,
            mock=res.get("mock", False),
        )

    task_id = f"sms-{uuid.uuid4().hex[:8]}"
    approval_gate.register_for_approval(
        task_id=task_id,
        action="sms_send",
        details={"to": to_phone, "text": sms_req.text},
        recipient=to_phone,
    )

    db = SessionLocal()
    try:
        audit = AuditLogRecord(
            actor=current_user.get("name") or "owner",
            action="exotel_sms_pending_approval",
            detail={"task_id": task_id, "to": to_phone, "text": sms_req.text},
            timestamp=datetime.utcnow(),
        )
        db.add(audit)
        db.commit()
    finally:
        db.close()

    return ExotelSMSResponse(
        status="awaiting_approval",
        task_id=task_id,
        to=to_phone,
        message="Outbound SMS requires owner approval at Approval Gate before dispatch.",
    )

