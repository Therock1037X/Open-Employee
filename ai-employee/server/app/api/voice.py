from fastapi import APIRouter, Depends, Body
from app.core.auth import verify_firebase_token
from app.schemas.schemas import VoiceCallRequest, VoiceCallResponse
from app.modules.voice.asr.client import bhashini_asr
from app.modules.voice.nmt.client import bhashini_nmt
from app.modules.voice.tts.client import bhashini_tts
from app.modules.voice.telephony.client import exotel_client

router = APIRouter(prefix="/voice", tags=["voice"])


@router.get("/ping")
def ping():
    return {
        "module": "voice",
        "status": "online",
        "providers": ["bhashini_asr", "bhashini_nmt", "bhashini_tts", "exotel_telephony"],
    }


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
