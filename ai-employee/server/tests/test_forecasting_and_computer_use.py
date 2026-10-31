import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)
headers = {"Authorization": "Bearer dev-token-owner"}

def test_demand_forecast():
    res = client.post(
        "/agent/forecast",
        headers=headers,
        json={"product": "Sugar", "days_ahead": 7},
    )
    assert res.status_code == 200
    data = res.json()
    assert data["product"] == "Sugar"
    assert data["days_ahead"] == 7
    assert data["total_predicted_demand"] > 0
    assert len(data["daily_predictions"]) == 7

def test_computer_use_gst_filing():
    res = client.post(
        "/agent/computer-use/gst-file",
        headers=headers,
        json={
            "gstin": "27AABCT3518Q1ZB",
            "return_period": "OCT-2026",
            "taxable_turnover": 125000.0,
            "tax_paid": 6250.0,
        },
    )
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["arn"].startswith("AA271026")
    assert "Playwright" in data["message"]
