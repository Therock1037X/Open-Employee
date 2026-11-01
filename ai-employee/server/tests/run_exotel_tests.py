import sys
import os
import asyncio

SERVER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from app.core.config import settings
from app.modules.voice.telephony.client import ExotelClient, exotel_client
from app.schemas.schemas import ExotelCallRequest, ExotelSMSRequest
from app.api.voice import start_voice_call, get_call_status
from app.api.integrations import send_exotel_sms
from app.modules.agent.approval_gate.gate import approval_gate


def test_normalize():
    print("Testing phone normalization...", end=" ", flush=True)
    assert ExotelClient.normalize_phone("7620569571") == "+917620569571"
    assert ExotelClient.to_domestic_format("7620569571") == "07620569571"
    assert ExotelClient.normalize_phone(" +91 76205-69571 ") == "+917620569571"
    assert ExotelClient.normalize_phone("07620569571") == "+917620569571"
    print("PASSED")


def test_mock_client():
    print("Testing mock client calls...", end=" ", flush=True)
    c = ExotelClient(sid="", api_key="", api_token="")
    assert c.is_mock is True

    call_res = asyncio.run(c.place_call("7620569571", "test"))
    assert call_res["mock"] is True
    assert call_res["call_sid"].startswith("mock-call-")

    status_res = asyncio.run(c.get_call_status(call_res["call_sid"]))
    assert status_res["mock"] is True
    assert status_res["status"] == "completed"

    sms_res = asyncio.run(c.send_sms("7620569571", "test SMS"))
    assert sms_res["mock"] is True
    assert sms_res["sms_sid"].startswith("mock-sms-")
    print("PASSED")


def test_trial_error():
    print("Testing trial account error detection...", end=" ", flush=True)
    c = ExotelClient(sid="dummy", api_key="dummy", api_token="dummy")
    trial_payload = {
        "RestException": {
            "Status": 403,
            "Message": "Call not allowed to unverified number in trial account",
            "Code": 10809,
        }
    }
    caught = False
    try:
        c._handle_exotel_error(403, trial_payload, "9999999999", "outbound call")
    except Exception as e:
        assert "Trial Account" in str(e)
        assert "unverified" in str(e)
        caught = True
    assert caught is True
    print("PASSED")


def test_approval_routing():
    print("Testing Approval Gate vs TEST_MODE...", end=" ", flush=True)
    orig_test_mode = settings.TEST_MODE
    orig_sid = exotel_client._sid
    try:
        exotel_client._sid = None  # Force mock for unit test

        # 1. TEST_MODE = False -> awaiting_approval
        settings.TEST_MODE = False
        req = ExotelCallRequest(to="7620569571", purpose="supplier_reorder", approved=False)
        res = asyncio.run(start_voice_call(call_req=req, current_user={"name": "Owner"}))
        assert res.status == "awaiting_approval"
        assert res.task_id.startswith("call-")

        # 2. TEST_MODE = True -> bypass approval gate
        settings.TEST_MODE = True
        req_test = ExotelCallRequest(to="7620569571", purpose="supplier_reorder", approved=False)
        res_test = asyncio.run(start_voice_call(call_req=req_test, current_user={"name": "Owner"}))
        assert res_test.status in ("in-progress", "completed", "queued")
        assert res_test.call_sid is not None

        # 3. SMS routing
        settings.TEST_MODE = False
        sms_req = ExotelSMSRequest(to="7620569571", text="Stock arrived", approved=False)
        sms_res = asyncio.run(send_exotel_sms(sms_req=sms_req, current_user={"name": "Owner"}))
        assert sms_res.status == "awaiting_approval"
        assert sms_res.task_id.startswith("sms-")

        settings.TEST_MODE = True
        sms_test = asyncio.run(send_exotel_sms(sms_req=sms_req, current_user={"name": "Owner"}))
        assert sms_test.status in ("sent", "queued")
        assert sms_test.sms_sid is not None

    finally:
        settings.TEST_MODE = orig_test_mode
        exotel_client._sid = orig_sid
    print("PASSED")


if __name__ == "__main__":
    test_normalize()
    test_mock_client()
    test_trial_error()
    test_approval_routing()
    print("\nALL 4 EXOTEL UNIT TESTS PASSED SUCCESSFULLY!")
