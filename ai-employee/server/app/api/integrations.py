from typing import List, Optional
from fastapi import APIRouter, Depends, Body
from app.core.auth import verify_firebase_token
from app.schemas.schemas import (
    WhatsAppMessage,
    InstagramPostRequest,
    UPIOrderRequest,
    UPIOrderResponse,
)
from app.modules.integrations.whatsapp.client import whatsapp_client
from app.modules.integrations.instagram.client import instagram_client
from app.modules.integrations.indiamart.client import indiamart_client
from app.modules.integrations.payments_upi.client import razorpay_upi
from app.modules.integrations.finance_tools.tools import finance_tools

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/ping")
def ping():
    return {
        "module": "integrations",
        "status": "online",
        "connectors": ["whatsapp_cloud", "instagram_graph", "indiamart", "razorpay_upi", "finance_tools"],
    }


@router.post("/whatsapp/send")
async def send_whatsapp(
    msg: WhatsAppMessage,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Sends WhatsApp message / catalog update to a customer or supplier.
    """
    return await whatsapp_client.send_message(
        to_phone=msg.to_phone,
        message=msg.text,
        image_url=msg.image_url,
    )


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
