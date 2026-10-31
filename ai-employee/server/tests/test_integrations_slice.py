import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
headers = {"Authorization": "Bearer dev-token-owner"}

def test_whatsapp_dispatch():
    res = client.post(
        "/integrations/whatsapp/send",
        headers=headers,
        json={"to_phone": "9876543210", "text": "Sugar restock order confirmed."},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SENT"
    assert "9876543210" in data["recipient"]

def test_instagram_post_with_auto_caption():
    res = client.post(
        "/integrations/instagram/post",
        headers=headers,
        json={
            "image_url": "https://example.com/fresh_sugar.jpg",
            "auto_generate_caption": True,
            "topic": "Pure Sugar M-30",
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "PUBLISHED"
    assert len(data["caption"]) > 10

def test_indiamart_leads():
    res = client.get("/integrations/indiamart/leads", headers=headers)
    assert res.status_code == 200
    leads = res.json()
    assert len(leads) >= 2
    assert "buyer_name" in leads[0]

def test_upi_checkout_generation():
    res = client.post(
        "/integrations/upi/order",
        headers=headers,
        json={"amount": 450.0, "customer_name": "Ramesh Gupta", "customer_phone": "9876543210"},
    )
    assert res.status_code == 200
    data = res.json()
    assert "upi://" in data["upi_link"]
    assert "https://" in data["qr_code_url"]
    assert data["amount"] == 450.0

def test_tax_calculation():
    res = client.get("/integrations/finance/tax-calculate?category=sugar&amount=1000.0&interstate=false")
    assert res.status_code == 200
    data = res.json()
    assert data["gst_rate"] == "5%"
    assert data["total_tax"] == 50.0
    assert data["cgst"] == 25.0
    assert data["sgst"] == 25.0
