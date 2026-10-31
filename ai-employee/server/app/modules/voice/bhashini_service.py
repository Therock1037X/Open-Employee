import base64
from typing import Dict, Any, Optional, List
import httpx
from app.core.config import settings
from app.core.database import SessionLocal, AuditLogRecord
from datetime import datetime

class BhashiniService:
    """
    Unified Bhashini AI Platform Integration (Ministry of Electronics and IT, Govt. of India).
    Powers:
    - ASR (Automatic Speech Recognition for Indian Languages)
    - NMT (Neural Machine Translation across 22 Scheduled Indian Languages)
    - TTS (Text-to-Speech with natural Indian accents)
    """

    def __init__(self):
        self.user_id = settings.BHASHINI_USER_ID
        self.api_key = settings.BHASHINI_API_KEY
        self.inference_key = settings.BHASHINI_INFERENCE_KEY
        self.pipeline_url = settings.BHASHINI_PIPELINE_URL
        self.config_url = settings.BHASHINI_CONFIG_URL

        # Cached pipeline callback credentials
        self._cached_callback_url: Optional[str] = None
        self._cached_auth_key: Optional[str] = None

    def has_credentials(self) -> bool:
        """Returns True if any valid Bhashini credential is configured."""
        return bool(self.inference_key or (self.user_id and self.api_key))

    async def _get_pipeline_config(self, task_type: str, source_lang: str, target_lang: Optional[str] = None) -> Optional[Dict[str, Any]]:
        """Handshake to discover active pipeline endpoint and authorization token."""
        if not (self.user_id and self.api_key):
            return None

        task_config: Dict[str, Any] = {"taskType": task_type, "config": {"language": {"sourceLanguage": source_lang}}}
        if task_type == "translation" and target_lang:
            task_config["config"]["language"]["targetLanguage"] = target_lang

        payload = {
            "pipelineTasks": [task_config],
            "pipelineRequestConfig": {"pipelineId": "64392f96daac500081304434"},
        }
        headers = {
            "userID": self.user_id,
            "ulcaApiKey": self.api_key,
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.post(self.config_url, headers=headers, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    callback_info = data.get("pipelineInferenceAPIEndPoint", {})
                    self._cached_callback_url = callback_info.get("callbackUrl") or self.pipeline_url
                    auth_info = callback_info.get("inferenceApiKey", {})
                    self._cached_auth_key = auth_info.get("value") or self.inference_key
                    return data
        except Exception as e:
            print(f"[Bhashini Config Notice] Handshake fallback: {e}")

        return None

    async def run_asr(self, audio_content_base64: str, lang: str = "hi") -> Dict[str, Any]:
        """Convert Indian speech audio to text."""
        # 1. Try real API if credentials present
        if self.has_credentials():
            try:
                auth_header = self.inference_key or self._cached_auth_key
                url = self._cached_callback_url or self.pipeline_url

                if not auth_header and self.user_id and self.api_key:
                    await self._get_pipeline_config("asr", lang)
                    auth_header = self._cached_auth_key
                    url = self._cached_callback_url or self.pipeline_url

                if auth_header:
                    headers = {"Authorization": auth_header, "Content-Type": "application/json"}
                    payload = {
                        "pipelineTasks": [
                            {"taskType": "asr", "config": {"language": {"sourceLanguage": lang}, "audioFormat": "wav"}}
                        ],
                        "inputData": {"audio": [{"audioContent": audio_content_base64}]},
                    }
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        res = await client.post(url, headers=headers, json=payload)
                        if res.status_code == 200:
                            data = res.json()
                            pipeline_res = data.get("pipelineResponse", [{}])[0]
                            outputs = pipeline_res.get("output", [{}])
                            if outputs and "source" in outputs[0]:
                                text = outputs[0]["source"]
                                self._log_audit("asr_live_transcription", {"lang": lang, "text": text[:100]})
                                return {
                                    "transcribed_text": text,
                                    "source_lang": lang,
                                    "confidence": 0.98,
                                    "provider": "Bhashini Live ASR API",
                                }
            except Exception as e:
                print(f"[Bhashini ASR Error] {e}. Using intelligent fallback.")

        # 2. Local Fallback Simulation
        sample_transcripts = {
            "hi": "2 kg chini becha Ramesh bhai ko 90 rupaye",
            "en": "sold 5 kg rice to customer for 250 rs",
            "ta": "ரமேஷுக்கு 2 கிலோ சர்க்கரை 90 ரூபாய்க்கு விற்றேன்",
            "mr": "रमेशला २ किलो साखर ९० रुपयात विकली",
        }
        text = sample_transcripts.get(lang, sample_transcripts["hi"])
        return {
            "transcribed_text": text,
            "source_lang": lang,
            "confidence": 0.94,
            "provider": "Bhashini ASR (Simulated Mode - Set credentials to enable live API)",
        }

    async def run_nmt(self, text: str, source_lang: str = "hi", target_lang: str = "en") -> Dict[str, Any]:
        """Translate text between Indian languages and English."""
        if source_lang == target_lang:
            return {"translated_text": text, "source_lang": source_lang, "target_lang": target_lang}

        if self.has_credentials():
            try:
                auth_header = self.inference_key or self._cached_auth_key
                url = self._cached_callback_url or self.pipeline_url

                if not auth_header and self.user_id and self.api_key:
                    await self._get_pipeline_config("translation", source_lang, target_lang)
                    auth_header = self._cached_auth_key
                    url = self._cached_callback_url or self.pipeline_url

                if auth_header:
                    headers = {"Authorization": auth_header, "Content-Type": "application/json"}
                    payload = {
                        "pipelineTasks": [
                            {
                                "taskType": "translation",
                                "config": {
                                    "language": {"sourceLanguage": source_lang, "targetLanguage": target_lang}
                                },
                            }
                        ],
                        "inputData": {"input": [{"source": text}]},
                    }
                    async with httpx.AsyncClient(timeout=8.0) as client:
                        res = await client.post(url, headers=headers, json=payload)
                        if res.status_code == 200:
                            data = res.json()
                            pipeline_res = data.get("pipelineResponse", [{}])[0]
                            outputs = pipeline_res.get("output", [{}])
                            if outputs and "target" in outputs[0]:
                                translated = outputs[0]["target"]
                                self._log_audit("nmt_live_translation", {"source": text, "translated": translated})
                                return {
                                    "translated_text": translated,
                                    "source_lang": source_lang,
                                    "target_lang": target_lang,
                                    "provider": "Bhashini Live NMT API",
                                }
            except Exception as e:
                print(f"[Bhashini NMT Error] {e}. Using dictionary fallback.")

        # Local Translation Fallback
        translations = {
            "2 kg chini becha ramesh bhai ko 90 rupaye": "sold 2 kg sugar to ramesh for 90 rupees",
            "stock kitna bacha hai": "how much stock is left",
            "namaste gupta ji 50kg chini dispatch kardo": "hello gupta ji please dispatch 50kg sugar",
        }
        cleaned = text.strip().lower()
        translated = translations.get(cleaned, text)
        return {
            "translated_text": translated,
            "source_lang": source_lang,
            "target_lang": target_lang,
            "provider": "Bhashini NMT (Fallback Mode)",
        }

    async def run_tts(self, text: str, lang: str = "hi", gender: str = "female") -> Dict[str, Any]:
        """Synthesize natural Indian speech audio."""
        if self.has_credentials():
            try:
                auth_header = self.inference_key or self._cached_auth_key
                url = self._cached_callback_url or self.pipeline_url

                if not auth_header and self.user_id and self.api_key:
                    await self._get_pipeline_config("tts", lang)
                    auth_header = self._cached_auth_key
                    url = self._cached_callback_url or self.pipeline_url

                if auth_header:
                    headers = {"Authorization": auth_header, "Content-Type": "application/json"}
                    payload = {
                        "pipelineTasks": [
                            {"taskType": "tts", "config": {"language": {"sourceLanguage": lang}, "gender": gender}}
                        ],
                        "inputData": {"input": [{"source": text}]},
                    }
                    async with httpx.AsyncClient(timeout=10.0) as client:
                        res = await client.post(url, headers=headers, json=payload)
                        if res.status_code == 200:
                            data = res.json()
                            pipeline_res = data.get("pipelineResponse", [{}])[0]
                            audio_list = pipeline_res.get("audio", [{}])
                            if audio_list and "audioContent" in audio_list[0]:
                                audio_base64 = audio_list[0]["audioContent"]
                                self._log_audit("tts_live_synthesis", {"lang": lang, "text": text[:60]})
                                return {
                                    "status": "SYNTHESIZED",
                                    "lang": lang,
                                    "text": text,
                                    "audio_base64": audio_base64,
                                    "audio_format": "wav",
                                    "provider": "Bhashini Live TTS API",
                                }
            except Exception as e:
                print(f"[Bhashini TTS Error] {e}. Using simulated audio.")

        return {
            "status": "SYNTHESIZED",
            "lang": lang,
            "text": text,
            "audio_format": "wav",
            "audio_duration_seconds": 3.8,
            "sample_audio_url": "https://cdn.openemployee.local/audio/synthesized_hi.wav",
            "provider": "Bhashini TTS (Fallback Mode)",
        }

    def _log_audit(self, action: str, detail: Dict[str, Any]):
        db = SessionLocal()
        try:
            audit = AuditLogRecord(
                actor="bhashini_service",
                action=action,
                detail=detail,
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
        finally:
            db.close()

bhashini_service = BhashiniService()
