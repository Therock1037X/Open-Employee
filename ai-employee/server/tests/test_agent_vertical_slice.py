import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import SessionLocal, Stock

client = TestClient(app)

def test_multilingual_sale_entry_and_stock_deduction():
    # Setup test stock
    db = SessionLocal()
    try:
        stock = db.query(Stock).filter(Stock.product == "Sugar").first()
        if not stock:
            stock = Stock(product="Sugar", current_quantity=22.0, min_threshold=20.0, unit="kg")
            db.add(stock)
        else:
            stock.current_quantity = 22.0
            stock.min_threshold = 20.0
        db.commit()
    finally:
        db.close()

    # Post Hindi/Hinglish sale: "2 kg sugar becha Ramesh ko 90 rs"
    headers = {"Authorization": "Bearer dev-token-owner"}
    response = client.post(
        "/agent/command",
        headers=headers,
        json={"text": "2 kg sugar becha Ramesh ko 90 rs", "lang": "hi"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["action_type"] == "sale"
    assert data["status"] == "completed"
    assert "Sugar" in data["summary"]
    assert data["parsed_data"]["price"] == 90.0

    # Stock was 22, deducted 2 -> 20 <= 20 threshold -> Low stock triggered!
    assert data["requires_approval"] is True
    assert "Low stock warning" in data["summary"]

def test_approval_gate_workflow():
    headers = {"Authorization": "Bearer dev-token-owner"}

    # 1. Fetch pending approvals
    list_res = client.get("/agent/approvals", headers=headers)
    assert list_res.status_code == 200
    approvals = list_res.json()
    assert len(approvals) > 0

    pending_task = approvals[0]
    task_id = pending_task["task_id"]

    # 2. Decide approval (Approve)
    decision_res = client.post(
        f"/agent/approvals/{task_id}/decision",
        headers=headers,
        json={"approved": True, "decided_by": "Vinit (Owner)", "reason": "Proceed with supplier restock call"},
    )
    assert decision_res.status_code == 200
    decision_data = decision_res.json()
    assert decision_data["status"] == "approved"
