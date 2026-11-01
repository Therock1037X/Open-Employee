import pytest
from fastapi.testclient import TestClient
from fastapi import HTTPException
from app.main import app
from app.core.config import settings
from app.modules.voice.telephony.client import ExotelClient, exotel_client

client = TestClient(app)
headers = {"Authorization": "Bearer dev-token-owner"}


def test_normalize_phone():
    # 10-digit standard Indian phone
    assert ExotelClient.normalize_phone("7620569571") == "+917620569571"
    assert ExotelClient.to_domestic_format("7620569571") == "07620569571"

    # With dashes and spaces
    assert ExotelClient.normalize_phone(" +91 76205-69571 ") == "+917620569571"

    # Leading zero format
    assert ExotelClient.normalize_phone("07620569571") == "+917620569571"

    # Already formatted E.164
    assert ExotelClient.normalize_phone("+917620569571") == "+917620569571"


def test_trial_account_error_handling():
    c = ExotelClient(sid="dummy_sid", api_key="dummy_k", api_token="dummy_t")

    trial_payload = {
        "RestException": {
            "Status": 403,
            "Message": "Call not allowed to unverified number in trial account",
            "Code": 10809,
        }
    }

    with pytest.raises(HTTPException) as exc_info:
        c._handle_exotel_error(
            status_code=403,
            response_data=trial_payload,
            target_phone="9999999999",
            action="outbound call",
        )

    assert exc_info.value.status_code == 403
    assert "Trial Account" in exc_info.value.detail
    assert "unverified" in exc_info.value.detail


def test_voice_call_approval_gate_routing():
    orig_test_mode = settings.TEST_MODE
    orig_sid = exotel_client._sid
    try:
        exotel_client._sid = None

        # 1. When TEST_MODE is False and approved is False: should queue in Approval Gate
        settings.TEST_MODE = False
        res = client.post(
            "/voice/call",
            headers=headers,
            json={"to": "7620569571", "purpose": "supplier_reorder", "approved": False},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "awaiting_approval"
        assert data["task_id"] is not None
        assert data["task_id"].startswith("call-")

        # 2. When TEST_MODE is True: should bypass Approval Gate
        settings.TEST_MODE = True
        res_test = client.post(
            "/voice/call",
            headers=headers,
            json={"to": "7620569571", "purpose": "supplier_reorder", "approved": False},
        )
        assert res_test.status_code == 200
        data_test = res_test.json()
        assert data_test["status"] in ("in-progress", "completed", "queued")
        assert data_test["call_sid"] is not None

        # 3. GET /voice/call/{sid}
        sid = data_test["call_sid"]
        status_res = client.get(f"/voice/call/{sid}", headers=headers)
        assert status_res.status_code == 200
        assert status_res.json()["call_sid"] == sid

    finally:
        settings.TEST_MODE = orig_test_mode
        exotel_client._sid = orig_sid


def test_sms_approval_gate_routing():
    orig_test_mode = settings.TEST_MODE
    orig_sid = exotel_client._sid
    try:
        exotel_client._sid = None

        # 1. TEST_MODE False: queue in Approval Gate
        settings.TEST_MODE = False
        res = client.post(
            "/integrations/sms/send",
            headers=headers,
            json={"to": "7620569571", "text": "Stock arrived", "approved": False},
        )
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "awaiting_approval"
        assert data["task_id"] is not None
        assert data["task_id"].startswith("sms-")

        # 2. TEST_MODE True: bypass Approval Gate
        settings.TEST_MODE = True
        res_test = client.post(
            "/integrations/sms/send",
            headers=headers,
            json={"to": "7620569571", "text": "Stock arrived", "approved": False},
        )
        assert res_test.status_code == 200
        data_test = res_test.json()
        assert data_test["status"] in ("sent", "queued")
        assert data_test["sms_sid"] is not None

    finally:
        settings.TEST_MODE = orig_test_mode
        exotel_client._sid = orig_sid
