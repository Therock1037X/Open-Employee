import random
from typing import Optional

class CaptionGenerator:
    """
    Generates engaging Hindi/Hinglish/English captions for store inventory updates.
    """

    TEMPLATES = [
        "✨ Naya taaza maal aa gaya hai! Fresh {product} ab available hai best wholesale rates pe. 🛒 Aaj hi dukaan pe visit karein ya WhatsApp karein!",
        "📢 Special Announcement: Premium quality {product} back in stock! Limited quantity available, jaldi order karein. 🚀 Call ya direct message karein.",
        "🏪 Aapki apni dukaan: Best price pe {product} uplabdh hai. Pure quality, guaranteed satisfaction! 🇮🇳 #LocalBusiness #ShopLocal",
        "💥 Aaj ka best deal: {product} ab dukaan pe available. Sabse saste aur acche rates! Contact us now for quick doorstep delivery. 📦",
    ]

    @classmethod
    def generate(cls, product: str = "Sugar", topic: Optional[str] = None) -> str:
        template = random.choice(cls.TEMPLATES)
        caption = template.format(product=product)
        if topic:
            caption += f" ✨ Focus: {topic}."
        return caption

caption_generator = CaptionGenerator()
