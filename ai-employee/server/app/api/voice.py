import uuid
from typing import Dict, Any, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, Body, HTTPException, Request

from app.core.auth import verify_firebase_token
from app.core.config import settings
from app.core.database import SessionLocal, AuditLogRecord
from app.schemas.schemas import (
    VoiceCallRequest,
    VoiceCallResponse,
    ExotelCallRequest,
    ExotelCallResponse,
)
from app.modules.voice.asr.client import bhashini_asr
from app.modules.voice.nmt.client import bhashini_nmt
from app.modules.voice.tts.client import bhashini_tts
from app.modules.voice.telephony.client import exotel_client
from app.modules.voice.bhashini_service import bhashini_service
from app.modules.agent.approval_gate.gate import approval_gate

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/ping")
def ping():
    return {
        "module": "voice",
        "status": "online",
        "providers": ["bhashini_asr", "bhashini_nmt", "bhashini_tts", "exotel_telephony"],
        "exotel_mock": exotel_client.is_mock,
        "test_mode": settings.TEST_MODE,
        "bhashini_live_configured": bhashini_service.has_credentials(),
    }


@router.post("/call", response_model=ExotelCallResponse)
async def start_voice_call(
    call_req: ExotelCallRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Exotel Outbound Call:
    Starts an outbound call from EXOTEL_NUMBER to the given phone number.
    Returns Exotel's call SID and status.
    Approval Gate is bypassed ONLY when TEST_MODE=true or approved=True.
    In all other cases, requests are queued in the Approval Gate.
    """
    to_phone = exotel_client.normalize_phone(call_req.to)

    # Check TEST_MODE flag or explicit approval
    if settings.TEST_MODE or call_req.approved:
        # Proceed directly with outbound call
        res = await exotel_client.place_call(
            to=to_phone,
            purpose=call_req.purpose or "general",
            script=call_req.script,
        )

        # Audit Log Entry
        db = SessionLocal()
        try:
            audit = AuditLogRecord(
                actor=current_user.get("name") or "owner",
                action="exotel_call_started",
                detail={
                    "call_sid": res.get("call_sid"),
                    "to": to_phone,
                    "purpose": call_req.purpose,
                    "test_mode": settings.TEST_MODE,
                },
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
        finally:
            db.close()

        return ExotelCallResponse(
            call_sid=res.get("call_sid"),
            sid=res.get("call_sid"),
            status=res.get("status", "in-progress"),
            to=to_phone,
            from_number=res.get("from"),
            purpose=call_req.purpose,
            mock=res.get("mock", False),
        )

    # Route through Approval Gate
    task_id = f"call-{uuid.uuid4().hex[:8]}"
    approval_gate.register_for_approval(
        task_id=task_id,
        action="voice_call",
        details={
            "to": to_phone,
            "purpose": call_req.purpose,
            "script": call_req.script,
        },
        recipient=to_phone,
    )

    # Audit Log Entry for pending approval
    db = SessionLocal()
    try:
        audit = AuditLogRecord(
            actor=current_user.get("name") or "owner",
            action="exotel_call_pending_approval",
            detail={"task_id": task_id, "to": to_phone, "purpose": call_req.purpose},
            timestamp=datetime.utcnow(),
        )
        db.add(audit)
        db.commit()
    finally:
        db.close()

    return ExotelCallResponse(
        status="awaiting_approval",
        task_id=task_id,
        to=to_phone,
        purpose=call_req.purpose,
        message="Outbound call requires owner approval at Approval Gate before dialing.",
    )


@router.get("/call/{sid}", response_model=Dict[str, Any])
async def get_call_status(
    sid: str,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Checks the status and details of an Exotel call by its SID.
    """
    return await exotel_client.get_call_status(sid)



@router.post("/transcribe")
async def transcribe_audio(
    audio_base64: str = Body(..., embed=True),
    lang: str = Body("hi", embed=True),
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Bhashini ASR: converts spoken voice into Indian language text.
    """
    return await bhashini_asr.transcribe_audio(audio_data=audio_base64, source_lang=lang)


@router.post("/translate")
async def translate_text(
    text: str = Body(..., embed=True),
    source_lang: str = Body("hi", embed=True),
    target_lang: str = Body("en", embed=True),
):
    """
    Bhashini NMT: translates Indian regional languages.
    """
    return await bhashini_nmt.translate(text=text, source_lang=source_lang, target_lang=target_lang)


@router.post("/synthesize")
async def synthesize_speech(
    text: str = Body(..., embed=True),
    lang: str = Body("hi", embed=True),
):
    """
    Bhashini TTS: produces Indian accent speech audio.
    """
    return await bhashini_tts.synthesize_speech(text=text, lang=lang)


@router.post("/call/outbound", response_model=VoiceCallResponse)
async def trigger_supplier_voice_call(
    call_req: VoiceCallRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Exotel Outbound Call: places simulated or real telephony call in Hindi/regional language.
    """
    res = await exotel_client.place_call(
        phone=call_req.phone,
        script=call_req.script,
        lang=call_req.lang,
        supplier_name=call_req.supplier_name or "Gupta Wholesale Mart",
    )
    return VoiceCallResponse(
        call_id=res["call_sid"],
        status=res["status"],
        language=res["language"],
        simulated_transcript=res["simulated_transcript"],
        outcome=res["outcome"],
    )


@router.get("/languages")
def get_supported_regional_languages():
    """
    Returns all 10 major Indian regional languages powered by Bhashini AI.
    """
    return [
        {"code": "hi", "name": "Hindi", "native": "हिन्दी", "script": "Devanagari"},
        {"code": "mr", "name": "Marathi", "native": "मराठी", "script": "Devanagari"},
        {"code": "gu", "name": "Gujarati", "native": "ગુજરાતી", "script": "Gujarati"},
        {"code": "ta", "name": "Tamil", "native": "தமிழ்", "script": "Tamil"},
        {"code": "te", "name": "Telugu", "native": "తెలుగు", "script": "Telugu"},
        {"code": "kn", "name": "Kannada", "native": "ಕನ್ನಡ", "script": "Kannada"},
        {"code": "ml", "name": "Malayalam", "native": "മലയാളം", "script": "Malayalam"},
        {"code": "bn", "name": "Bengali", "native": "বাংলা", "script": "Bengali"},
        {"code": "pa", "name": "Punjabi", "native": "ਪੰਜਾਬੀ", "script": "Gurmukhi"},
        {"code": "en", "name": "English", "native": "English", "script": "Latin"},
    ]


@router.post("/tts")
async def bhashini_tts_alias(payload: Dict[str, Any] = Body(...)):
    """Standard alias for Bhashini Text-to-Speech synthesis."""
    text = payload.get("text", "")
    lang = payload.get("lang", "hi")
    gender = payload.get("gender", "female")
    return await bhashini_service.run_tts(text=text, lang=lang, gender=gender)


@router.post("/asr")
async def bhashini_asr_alias(payload: Dict[str, Any] = Body(...)):
    """Standard alias for Bhashini Automatic Speech Recognition."""
    audio_base64 = payload.get("audio_base64", "")
    lang = payload.get("lang", "hi")
    return await bhashini_service.run_asr(audio_content_base64=audio_base64, lang=lang)
