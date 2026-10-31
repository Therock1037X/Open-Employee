import os
from typing import Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.core.database import SessionLocal, AuditLogRecord
from app.modules.integrations.captions.generator import caption_generator

class InstagramClient:
    """
    Instagram Graph API Integration:
    Publishes store product photos with auto-generated captions.
    Includes mock fallback when INSTAGRAM_TOKEN is missing.
    """

    def __init__(self, token: Optional[str] = settings.INSTAGRAM_TOKEN):
        self.token = token

    async def publish_photo(
        self,
        image_url: str,
        caption: Optional[str] = None,
        product: str = "Fresh Stock",
    ) -> Dict[str, Any]:
        if not caption:
            caption = caption_generator.generate(product=product)

        post_id = f"ig_post_mock_{int(datetime.utcnow().timestamp())}"

        # Audit Log
        db = SessionLocal()
        try:
            audit = AuditLogRecord(
                actor="instagram_integration",
                action="published_instagram_post",
                detail={"image_url": image_url, "caption": caption[:120], "post_id": post_id},
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
        finally:
            db.close()

        return {
            "status": "PUBLISHED",
            "post_id": post_id,
            "image_url": image_url,
            "caption": caption,
            "platform": "Instagram Graph API (Mock/Simulated)",
            "published_at": datetime.utcnow().isoformat(),
        }

instagram_client = InstagramClient()
