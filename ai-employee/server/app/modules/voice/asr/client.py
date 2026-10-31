from typing import Dict, Any
from app.modules.voice.bhashini_service import bhashini_service

class BhashiniASRClient:
    """
    Bhashini Automatic Speech Recognition (ASR):
    Converts spoken Indian language audio (Hindi, Tamil, Telugu, Bengali, Marathi, etc.) into text.
    """

    async def transcribe_audio(self, audio_data: str, source_lang: str = "hi") -> Dict[str, Any]:
        return await bhashini_service.run_asr(audio_content_base64=audio_data, lang=source_lang)

bhashini_asr = BhashiniASRClient()
