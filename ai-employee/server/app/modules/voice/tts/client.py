from typing import Dict, Any
from app.modules.voice.bhashini_service import bhashini_service

class BhashiniTTSClient:
    """
    Bhashini Text-to-Speech (TTS):
    Synthesizes natural Indian accent speech in 14+ Indian languages.
    """

    async def synthesize_speech(self, text: str, lang: str = "hi", gender: str = "female") -> Dict[str, Any]:
        return await bhashini_service.run_tts(text=text, lang=lang, gender=gender)

bhashini_tts = BhashiniTTSClient()
