import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings
from app.core.database import SessionLocal, WhatsAppMessageRecord, AuditLogRecord
from app.modules.integrations.whatsapp.client import whatsapp_client

client = TestClient(app)
auth_headers = {"Authorization": "Bearer dev-token-owner"}


def test_integrations_ping():
    """Verify /integrations/ping returns whatsapp_mock boolean."""
    res = client.get("/integrations/ping")
    assert res.status_code == 200
    data = res.json()
    assert "whatsapp_mock" in data
    assert data["module"] == "integrations"
    assert data["status"] == "online"


def test_send_whatsapp_unapproved_routes_to_approval_gate():
    """Outbound customer message without prior approval must pause in Approval Gate."""
    res = client.post(
        "/integrations/whatsapp/send",
        headers=auth_headers,
        json={
            "to_phone": "919876543210",
            "text": "Your order of 10kg Sugar is ready for pickup.",
            "approved": False,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "awaiting_approval"
    assert "task_id" in data
    assert data["recipient"] == "919876543210"

    # Verify message in database has pending_approval status
    db = SessionLocal()
    try:
        msg = (
            db.query(WhatsAppMessageRecord)
            .filter(WhatsAppMessageRecord.recipient == "919876543210")
            .order_by(WhatsAppMessageRecord.timestamp.desc())
            .first()
        )
        assert msg is not None
        assert msg.status == "pending_approval"
    finally:
        db.close()


def test_send_whatsapp_approved_dispatches():
    """Approved outbound message dispatches and writes audit log."""
    res = client.post(
        "/integrations/whatsapp/send",
        headers=auth_headers,
        json={
            "to_phone": "9876543210",
            "text": "Special 10% discount on Mustard Oil today!",
            "approved": True,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SENT"
    assert "919876543210" in data["recipient"]

    # Verify audit log entry
    db = SessionLocal()
    try:
        audit = (
            db.query(AuditLogRecord)
            .filter(AuditLogRecord.action == "sent_whatsapp_message")
            .order_by(AuditLogRecord.timestamp.desc())
            .first()
        )
        assert audit is not None
        assert "919876543210" in audit.detail.get("to", "")
    finally:
        db.close()


def test_send_whatsapp_image():
    """Test send-image endpoint."""
    res = client.post(
        "/integrations/whatsapp/send-image",
        headers=auth_headers,
        json={
            "to_phone": "9876543210",
            "image_url": "https://example.com/banner.jpg",
            "caption": "Fresh Diwali stock arrival",
            "approved": True,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SENT"
    assert data["image_url"] == "https://example.com/banner.jpg"


def test_send_whatsapp_template_hello_world():
    """Test POST /integrations/whatsapp/send-template with hello_world."""
    res = client.post(
        "/integrations/whatsapp/send-template",
        headers=auth_headers,
        json={
            "to_phone": "9876543210",
            "template_name": "hello_world",
            "language_code": "en_US",
            "approved": True,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SENT"
    assert data["template_name"] == "hello_world"
    assert data["language_code"] == "en_US"


def test_webhook_verification_handshake():
    """Test GET /integrations/whatsapp/webhook verification."""
    verify_token = settings.WHATSAPP_VERIFY_TOKEN or "openemployee_verify_token"
    challenge = "test_challenge_123456"

    # Valid handshake
    res = client.get(
        f"/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token={verify_token}&hub.challenge={challenge}"
    )
    assert res.status_code == 200
    assert res.text == challenge

    # Invalid token handshake
    res_bad = client.get(
        f"/integrations/whatsapp/webhook?hub.mode=subscribe&hub.verify_token=wrong_token&hub.challenge={challenge}"
    )
    assert res_bad.status_code == 403


def test_webhook_receiving_text_and_invoices():
    """
    Test POST /integrations/whatsapp/webhook:
    - Text message
    - Invoice image
    - Invoice PDF document
    Verifies DB storage and audit logs.
    """
    payload = {
      "object": "whatsapp_business_account",
      "entry": [
        {
          "id": "BIZ_123",
          "changes": [
            {
              "value": {
                "messaging_product": "whatsapp",
                "metadata": {"display_phone_number": "12345", "phone_number_id": "67890"},
                "messages": [
                  {
                    "from": "919988776655",
                    "id": "wamid.test.text.001",
                    "timestamp": "1710000000",
                    "type": "text",
                    "text": {"body": "Send 2 bags basmati rice"}
                  },
                  {
                    "from": "919988776655",
                    "id": "wamid.test.img.002",
                    "timestamp": "1710000010",
                    "type": "image",
                    "image": {
                      "id": "media_img_100",
                      "mime_type": "image/jpeg",
                      "caption": "Attached grocery invoice for wholesale billing"
                    }
                  },
                  {
                    "from": "919988776655",
                    "id": "wamid.test.doc.003",
                    "timestamp": "1710000020",
                    "type": "document",
                    "document": {
                      "id": "media_doc_200",
                      "filename": "Tax_Invoice_October_Dispatch.pdf",
                      "mime_type": "application/pdf",
                      "caption": "Monthly supplier bill"
                    }
                  }
                ]
              },
              "field": "messages"
            }
          ]
        }
      ]
    }

    res = client.post("/integrations/whatsapp/webhook", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "EVENT_RECEIVED"
    assert data["processed_count"] == 3

    # Check Database persistence
    db = SessionLocal()
    try:
        # 1. Text message
        m1 = db.query(WhatsAppMessageRecord).filter(WhatsAppMessageRecord.message_id == "wamid.test.text.001").first()
        assert m1 is not None
        assert m1.text == "Send 2 bags basmati rice"
        assert m1.is_invoice is False

        # 2. Image invoice
        m2 = db.query(WhatsAppMessageRecord).filter(WhatsAppMessageRecord.message_id == "wamid.test.img.002").first()
        assert m2 is not None
        assert m2.is_invoice is True
        assert m2.message_type == "image"

        # 3. Document PDF invoice
        m3 = db.query(WhatsAppMessageRecord).filter(WhatsAppMessageRecord.message_id == "wamid.test.doc.003").first()
        assert m3 is not None
        assert m3.is_invoice is True
        assert m3.filename == "Tax_Invoice_October_Dispatch.pdf"

        # Check Audit Log entries
        audits = (
            db.query(AuditLogRecord)
            .filter(AuditLogRecord.actor == "whatsapp_webhook")
            .all()
        )
        assert len(audits) >= 3
    finally:
        db.close()


def test_post_status_marketing():
    """Test POST /integrations/whatsapp/post-status."""
    res = client.post(
        "/integrations/whatsapp/post-status",
        headers=auth_headers,
        json={
            "text": "Weekend Bumper Sale: 20% off on all Pulses and Spices!",
            "image_url": "https://example.com/sale.jpg",
            "approved": True,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "PUBLISHED"
    assert data["type"] == "marketing_status"


def test_get_whatsapp_inbox():
    """Test GET /integrations/whatsapp/inbox."""
    res = client.get("/integrations/whatsapp/inbox", headers=auth_headers)
    assert res.status_code == 200
    messages = res.json()
    assert isinstance(messages, list)
    assert len(messages) >= 3


@pytest.mark.asyncio
async def test_token_expiration_clear_error():
    """Simulate Meta OAuth token expired error code 190 and verify clear error message."""
    client_instance = whatsapp_client
    # Temporarily set mock token to simulate live API error
    with patch.object(client_instance, "is_mock", False):
        with patch.object(client_instance, "token", "fake_token"):
            with patch.object(client_instance, "phone_id", "fake_phone"):
                mock_response = MagicMock()
                mock_response.status_code = 400
                mock_response.content = b"true"
                mock_response.json.return_value = {
                    "error": {
                        "message": "Error validating access token: Session has expired",
                        "type": "OAuthException",
                        "code": 190,
                        "error_subcode": 463,
                    }
                }

                with patch("httpx.AsyncClient.post", return_value=mock_response):
                    with pytest.raises(Exception) as exc_info:
                        await client_instance._call_graph_api({"messaging_product": "whatsapp"})
                    assert "Token has expired or is invalid (Code 190" in str(exc_info.value)
                    assert "WHATSAPP_TOKEN" in str(exc_info.value)
