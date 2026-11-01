"""
test_exotel.py - Interactive CLI verification script for Exotel Outbound Voice Call & SMS.
Usage:
    python scripts/test_exotel.py <phone_number>
Example:
    python scripts/test_exotel.py 7620569571
"""

import sys
import os
import asyncio

# Ensure UTF-8 output on Windows
sys.stdout.reconfigure(encoding="utf-8")
sys.stderr.reconfigure(encoding="utf-8")

# Add server directory to path
SERVER_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if SERVER_DIR not in sys.path:
    sys.path.insert(0, SERVER_DIR)

from dotenv import load_dotenv
load_dotenv(os.path.join(SERVER_DIR, ".env"), override=True)

from app.core.config import settings
from app.modules.voice.telephony.client import exotel_client


async def run_test(target_phone: str):
    print("=" * 60)
    print("       OPEN EMPLOYEE - EXOTEL CALL & SMS VERIFICATION       ")
    print("=" * 60)

    # 1. Inspect Client Mode
    print(f"[*] Target Phone Input:   {target_phone}")
    normalized = exotel_client.normalize_phone(target_phone)
    domestic = exotel_client.to_domestic_format(target_phone)
    print(f"[*] Normalized E.164:     {normalized}")
    print(f"[*] Domestic Format:      {domestic}")
    print(f"[*] Client Mode:          {'MOCK MODE (Keys missing)' if exotel_client.is_mock else 'LIVE EXOTEL API'}")
    print(f"[*] Subdomain Cluster:    {exotel_client.subdomain}")
    print(f"[*] Virtual ExoPhone:     {'Configured' if exotel_client.number else 'Not Configured'}")
    print(f"[*] Test Mode:            {settings.TEST_MODE}")
    print("-" * 60)

    # 2. Test Outbound Voice Call
    print("\n[STEP 1] Placing Test Voice Call...")
    call_sid = None
    try:
        call_res = await exotel_client.place_call(
            to=target_phone,
            purpose="test_verification",
            script="Namaste sir, this is an automated verification call from your AI Employee store.",
        )
        call_sid = call_res.get("call_sid") or call_res.get("sid")
        print("  -> Call Initiated Successfully!")
        print(f"  -> Call SID: {call_sid}")
        print(f"  -> Status:   {call_res.get('status')}")
        print(f"  -> Is Mock:  {call_res.get('mock', False)}")
    except Exception as e:
        print(f"  [X] Voice Call Error: {str(e)}")

    # 3. Check Call Status if SID available
    if call_sid:
        print("\n[STEP 2] Querying Call Status via GET /v1/Accounts/{sid}/Calls/{call_sid}...")
        try:
            status_res = await exotel_client.get_call_status(call_sid)
            print("  -> Status Query Response:")
            print(f"     Call SID:  {status_res.get('call_sid')}")
            print(f"     Status:    {status_res.get('status')}")
            print(f"     Duration:  {status_res.get('duration', 'N/A')} seconds")
        except Exception as e:
            print(f"  [X] Status Query Error: {str(e)}")

    # 4. Test Outbound SMS
    print("\n[STEP 3] Sending Test SMS...")
    sms_body = "Open Employee Alert: This is a verified test SMS from your AI Store Assistant."
    try:
        sms_res = await exotel_client.send_sms(
            to=target_phone,
            text=sms_body,
        )
        print("  -> SMS Dispatched Successfully!")
        print(f"  -> SMS SID:  {sms_res.get('sms_sid') or sms_res.get('sid')}")
        print(f"  -> Status:   {sms_res.get('status')}")
        print(f"  -> Is Mock:  {sms_res.get('mock', False)}")
    except Exception as e:
        print(f"  [X] SMS Dispatch Error: {str(e)}")

    print("\n" + "=" * 60)
    print("                 VERIFICATION FINISHED                      ")
    print("=" * 60)


if __name__ == "__main__":
    phone_arg = sys.argv[1] if len(sys.argv) > 1 else "7620569571"
    asyncio.run(run_test(phone_arg))
