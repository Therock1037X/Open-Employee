import os
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings

class IndiaMARTClient:
    """
    IndiaMART B2B Leads Integration:
    Polls buyer leads and wholesale inquiries for the store.
    """

    def __init__(self, api_key: Optional[str] = settings.INDIAMART_API_KEY):
        self.api_key = api_key

    async def get_recent_leads(self) -> List[Dict[str, Any]]:
        # Simulated buyer leads for small Indian business catalog
        return [
            {
                "query_id": "IM-2026-90182",
                "buyer_name": "Rajesh Kumar (Sweet Mart)",
                "buyer_mobile": "+919820011223",
                "product_name": "Commercial Grade Sugar M-30",
                "quantity": "500 kg",
                "location": "Pune, Maharashtra",
                "created_at": "Today, 10:30 AM",
            },
            {
                "query_id": "IM-2026-90183",
                "buyer_name": "Pooja Sharma (Catering Services)",
                "buyer_mobile": "+919871122334",
                "product_name": "Sunflower Cooking Oil (15L Tin)",
                "quantity": "10 Tins",
                "location": "Navi Mumbai, Maharashtra",
                "created_at": "Today, 11:15 AM",
            },
        ]

indiamart_client = IndiaMARTClient()
