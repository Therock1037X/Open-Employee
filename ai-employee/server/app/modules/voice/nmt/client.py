from typing import Dict, Any
from app.modules.voice.bhashini_service import bhashini_service

class BhashiniNMTClient:
    """
    Bhashini Neural Machine Translation (NMT):
    Translates Indian regional languages to English (for LLM tool calling) and back.
    """

    async def translate(self, text: str, source_lang: str, target_lang: str) -> Dict[str, Any]:
        return await bhashini_service.run_nmt(text=text, source_lang=source_lang, target_lang=target_lang)

bhashini_nmt = BhashiniNMTClient()
