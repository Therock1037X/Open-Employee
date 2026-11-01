import os
import re
import uuid
from datetime import datetime
from typing import Dict, Any, Optional
import httpx
from fastapi import HTTPException

from app.core.config import settings
from app.core.database import SessionLocal, AuditLogRecord


class ExotelClient:
    """
    Exotel Telephony & SMS Client:
    - Official Exotel REST API integration for outbound calls and SMS
    - HTTP Basic Authentication with EXOTEL_API_KEY and EXOTEL_API_TOKEN
    - Full Indian phone number normalization (+91 / 0 / 10-digit)
    - Trial account unverified number detection with human-friendly guidance
    - Graceful Mock Mode fallback when credentials are missing
    - Immutable Audit Logging on all dispatched calls and messages
    """

    def __init__(
        self,
        sid: Optional[str] = None,
        api_key: Optional[str] = None,
        api_token: Optional[str] = None,
        subdomain: Optional[str] = None,
        number: Optional[str] = None,
    ):
        self._sid = sid if sid is not None else settings.EXOTEL_SID
        self._api_key = api_key if api_key is not None else settings.EXOTEL_API_KEY
        self._api_token = api_token if api_token is not None else settings.EXOTEL_API_TOKEN
        self._subdomain = subdomain if subdomain is not None else getattr(settings, "EXOTEL_SUBDOMAIN", "api.exotel.com")
        self._number = number if number is not None else getattr(settings, "EXOTEL_NUMBER", None)

    @property
    def sid(self) -> Optional[str]:
        return self._sid

    @property
    def api_key(self) -> Optional[str]:
        return self._api_key

    @property
    def api_token(self) -> Optional[str]:
        return self._api_token

    @property
    def subdomain(self) -> str:
        sub = self._subdomain or getattr(settings, "EXOTEL_SUBDOMAIN", "api.exotel.com")
        return sub.strip()

    @property
    def number(self) -> Optional[str]:
        return self._number

    @property
    def is_mock(self) -> bool:
        """Mock mode when required Exotel credentials are not fully configured."""
        return not bool(
            self.sid and str(self.sid).strip()
            and self.api_key and str(self.api_key).strip()
            and self.api_token and str(self.api_token).strip()
        )

    @staticmethod
    def normalize_phone(phone: str) -> str:
        """
        Normalizes Indian phone numbers:
        - Strips spaces, dashes, parentheses, and dots
        - Formats 10-digit and STD numbers into international E.164 (+91XXXXXXXXXX)
        """
        if not phone:
            return ""
        cleaned = re.sub(r"[\s\-\(\)\.]", "", str(phone).strip())
        if cleaned.startswith("+"):
            cleaned = cleaned[1:]

        # 11 digits starting with 0 (e.g. 07620569571) -> 917620569571
        if len(cleaned) == 11 and cleaned.startswith("0"):
            cleaned = "91" + cleaned[1:]
        # 10 digits (e.g. 7620569571) -> 917620569571
        elif len(cleaned) == 10:
            cleaned = "91" + cleaned

        return f"+{cleaned}"

    @staticmethod
    def to_domestic_format(phone: str) -> str:
        """
        Formats normalized phone into standard Indian domestic format with leading 0
        (e.g., 07620569571) as accepted by some Exotel cluster endpoints.
        """
        e164 = ExotelClient.normalize_phone(phone)
        digits = re.sub(r"\D", "", e164)
        if digits.startswith("91") and len(digits) == 12:
            return "0" + digits[2:]
        return digits

    def _get_base_url(self) -> str:
        """Resolves the regional Exotel REST API base URL."""
        host = self.subdomain
        if "." not in host:
            host = f"{host}.exotel.com"
        return f"https://{host}/v1/Accounts/{self.sid}"

    def _record_audit(self, action: str, detail: Dict[str, Any], actor: str = "exotel_telephony"):
        """Records an audit log entry in the database."""
        db = SessionLocal()
        try:
            audit = AuditLogRecord(
                actor=actor,
                action=action,
                detail=detail,
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
        except Exception:
            db.rollback()
        finally:
            db.close()

    def _handle_exotel_error(self, status_code: int, response_data: Any, target_phone: str, action: str):
        """Interprets Exotel response and returns clear, human-actionable error messages."""
        err_msg = ""
        err_code = None

        if isinstance(response_data, dict):
            # Check for RestException or Call/SMS error payloads
            rest_ex = response_data.get("RestException") or response_data
            err_msg = str(rest_ex.get("Message") or rest_ex.get("message") or response_data)
            err_code = rest_ex.get("Code") or rest_ex.get("Status") or rest_ex.get("code")
        else:
            err_msg = str(response_data)

        lower_msg = err_msg.lower()

        # Check for trial account restrictions
        if (
            status_code in (400, 403)
            or err_code in (10809, 10815, 340030, 40000)
            or "unverified" in lower_msg
            or "trial" in lower_msg
            or "whitelist" in lower_msg
            or "not permitted" in lower_msg
        ):
            raise HTTPException(
                status_code=403,
                detail=(
                    f"Exotel Trial Account Restriction: Phone number '{target_phone}' is unverified. "
                    f"On an Exotel trial account, {action} can only be connected to numbers verified "
                    f"in your Exotel dashboard (Dashboard -> Co-workers & Groups / Numbers -> Verified Numbers). "
                    f"Please verify this number or complete business KYC. (Exotel detail: {err_msg})"
                ),
            )

        if status_code == 401:
            raise HTTPException(
                status_code=401,
                detail="Exotel API Authentication Failed (401 Unauthorized). Please check EXOTEL_API_KEY and EXOTEL_API_TOKEN in server/.env.",
            )

        raise HTTPException(
            status_code=status_code if status_code >= 400 else 400,
            detail=f"Exotel API Error ({status_code}): {err_msg}",
        )

    async def place_call(
        self,
        to: str,
        purpose: str = "general",
        script: Optional[str] = None,
        custom_caller_id: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Starts an outbound call from EXOTEL_NUMBER to the destination number.
        Returns Exotel's call SID and status.
        """
        normalized_to = self.normalize_phone(to)
        domestic_to = self.to_domestic_format(to)
        caller_id = custom_caller_id or self.number or "08045678900"

        # 1. Mock Mode Fallback
        if self.is_mock:
            mock_sid = f"mock-call-{uuid.uuid4().hex[:12]}"
            res = {
                "call_sid": mock_sid,
                "sid": mock_sid,
                "status": "in-progress",
                "to": normalized_to,
                "from": caller_id,
                "caller_id": caller_id,
                "purpose": purpose,
                "script": script,
                "mock": True,
                "created_at": datetime.utcnow().isoformat(),
            }
            self._record_audit(
                action="call_started_mock",
                detail={"call_sid": mock_sid, "to": normalized_to, "purpose": purpose},
            )
            return res

        # 2. Live Exotel Calls/connect API
        url = f"{self._get_base_url()}/Calls/connect.json"
        auth = (self.api_key, self.api_token)

        # In Exotel's Calls/connect:
        # Leg 1 (From): Dials destination or agent
        # Leg 2 (To): Connected party (or ExoPhone flow)
        # CallerId: ExoPhone virtual number displayed
        payload = {
            "From": domestic_to,
            "To": caller_id,
            "CallerId": caller_id,
            "CallType": "trans",
            "TimeLimit": "300",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, data=payload, auth=auth)
                status_code = response.status_code

                try:
                    res_json = response.json()
                except Exception:
                    res_json = {"raw": response.text}

                if status_code not in (200, 201):
                    self._handle_exotel_error(
                        status_code=status_code,
                        response_data=res_json,
                        target_phone=to,
                        action="outbound calls",
                    )

                # Parse Exotel Call JSON
                call_data = res_json.get("Call") or res_json
                call_sid = call_data.get("Sid") or f"exo_{uuid.uuid4().hex[:12]}"
                call_status = call_data.get("Status") or "in-progress"

                result = {
                    "call_sid": call_sid,
                    "sid": call_sid,
                    "status": call_status,
                    "to": normalized_to,
                    "from": caller_id,
                    "caller_id": caller_id,
                    "purpose": purpose,
                    "date_created": call_data.get("DateCreated") or datetime.utcnow().isoformat(),
                    "mock": False,
                }

                self._record_audit(
                    action="call_started_live",
                    detail={"call_sid": call_sid, "to": normalized_to, "purpose": purpose, "status": call_status},
                )
                return result

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to communicate with Exotel Call API: {str(e)}",
            )

    async def get_call_status(self, sid: str) -> Dict[str, Any]:
        """Checks real-time status of a call SID via Exotel API."""
        if self.is_mock or sid.startswith("mock-"):
            return {
                "call_sid": sid,
                "sid": sid,
                "status": "completed",
                "duration": 42,
                "price": "0.00",
                "mock": True,
            }

        url = f"{self._get_base_url()}/Calls/{sid}.json"
        auth = (self.api_key, self.api_token)

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url, auth=auth)
                if response.status_code == 404:
                    raise HTTPException(status_code=404, detail=f"Exotel Call SID '{sid}' not found")
                if response.status_code != 200:
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"Exotel Call status query failed: {response.text}",
                    )
                res_json = response.json()
                call_data = res_json.get("Call") or res_json
                return {
                    "call_sid": call_data.get("Sid", sid),
                    "sid": call_data.get("Sid", sid),
                    "status": call_data.get("Status", "unknown"),
                    "duration": call_data.get("Duration"),
                    "recording_url": call_data.get("RecordingUrl"),
                    "date_created": call_data.get("DateCreated"),
                    "date_updated": call_data.get("DateUpdated"),
                    "mock": False,
                }
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch call status from Exotel: {str(e)}")

    async def send_sms(self, to: str, text: str) -> Dict[str, Any]:
        """
        Sends an SMS via Exotel official API.
        Returns Exotel's response.
        """
        normalized_to = self.normalize_phone(to)
        domestic_to = self.to_domestic_format(to)
        from_header = self.number or "EXOTEL"

        # 1. Mock Mode Fallback
        if self.is_mock:
            mock_sid = f"mock-sms-{uuid.uuid4().hex[:12]}"
            res = {
                "sms_sid": mock_sid,
                "sid": mock_sid,
                "status": "sent",
                "to": normalized_to,
                "from": from_header,
                "text": text,
                "mock": True,
                "created_at": datetime.utcnow().isoformat(),
            }
            self._record_audit(
                action="sms_sent_mock",
                detail={"sms_sid": mock_sid, "to": normalized_to, "text_len": len(text)},
            )
            return res

        # 2. Live Exotel Sms/send API
        url = f"{self._get_base_url()}/Sms/send.json"
        auth = (self.api_key, self.api_token)

        payload = {
            "From": from_header,
            "To": domestic_to,
            "Body": text,
            "EncodingType": "unicode" if any(ord(c) > 127 for c in text) else "plain",
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, data=payload, auth=auth)
                status_code = response.status_code

                try:
                    res_json = response.json()
                except Exception:
                    res_json = {"raw": response.text}

                if status_code not in (200, 201):
                    self._handle_exotel_error(
                        status_code=status_code,
                        response_data=res_json,
                        target_phone=to,
                        action="outbound SMS",
                    )

                sms_data = res_json.get("SMSMessage") or res_json
                sms_sid = sms_data.get("Sid") or f"sms_{uuid.uuid4().hex[:12]}"
                sms_status = sms_data.get("Status") or "sent"

                result = {
                    "sms_sid": sms_sid,
                    "sid": sms_sid,
                    "status": sms_status,
                    "to": normalized_to,
                    "from": from_header,
                    "body": text,
                    "date_created": sms_data.get("DateCreated") or datetime.utcnow().isoformat(),
                    "mock": False,
                }

                self._record_audit(
                    action="sms_sent_live",
                    detail={"sms_sid": sms_sid, "to": normalized_to, "status": sms_status},
                )
                return result

        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to communicate with Exotel SMS API: {str(e)}",
            )


# Singleton instances
exotel_client = ExotelClient()
