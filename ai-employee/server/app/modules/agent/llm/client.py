import re
import json
from typing import Dict, Any, Optional
import httpx
from app.core.config import settings

class LLMParserClient:
    """
    Parses multilingual Indian business speech/text into structured tool calls.
    Connects to fine-tuned Llama/Qwen on vLLM, with an intelligent local parser fallback.
    """

    def __init__(self, base_url: str = settings.LLM_BASE_URL, model: str = settings.LLM_MODEL_NAME):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def parse_business_command(self, raw_text: str, lang: str = "hi") -> Dict[str, Any]:
        """
        Parses text like: '2 kg sugar becha Ramesh ko 90 rs' or '10 packet doodh aaya'.
        Returns structured action dictionary.
        """
        # Try real vLLM endpoint if available
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                prompt = (
                    f"You are an AI employee for an Indian grocery/retail shop. "
                    f"Extract intent, product, quantity, unit, price, and customer from this message: '{raw_text}'. "
                    f"Return ONLY a JSON object with keys: action (sale/purchase/check_stock/call_supplier/file_gst), "
                    f"product, quantity (float), unit (kg/litre/packet/piece), price (float), customer_name (str)."
                )
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    json={
                        "model": self.model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.1,
                    },
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data["choices"][0]["message"]["content"]
                    # Extract JSON substring
                    match = re.search(r"\{.*\}", content, re.DOTALL)
                    if match:
                        return json.loads(match.group(0))
        except Exception:
            # Fall back to intelligent local heuristic parser
            pass

        return self._local_heuristic_parser(raw_text, lang)

    def _local_heuristic_parser(self, text: str, lang: str) -> Dict[str, Any]:
        lower = text.lower()

        # Check for GST filing
        if any(w in lower for w in ["gst", "return", "tax", "gstr"]):
            return {
                "action": "file_gst",
                "product": None,
                "quantity": 0,
                "unit": None,
                "price": 0,
                "customer_name": None,
                "notes": "GST GSTR-3B monthly filing requested",
            }

        # Check for stock check
        if any(w in lower for w in ["check", "kitna hai", "bacha hai", "stock", "bache"]):
            product = "sugar"
            for word in ["sugar", "chini", "shakkar", "oil", "tel", "atta", "wheat", "rice", "chawal", "doodh", "milk"]:
                if word in lower:
                    product = word
                    break
            return {
                "action": "check_stock",
                "product": product.capitalize(),
                "quantity": 0,
                "unit": None,
                "price": 0,
                "customer_name": None,
            }

        # Parse Sale (default business entry)
        # e.g.: '2 kg sugar becha Ramesh ko 90 rs' or 'sold 5 packet biscuits 100'
        qty = 1.0
        unit = "kg"
        price = 0.0
        product = "Item"
        customer = "Walk-in Customer"

        # Extract quantity and unit
        qty_match = re.search(r"(\d+(\.\d+)?)\s*(kg|kilo|litre|ltr|packet|pkt|piece|pc|bori|bag|gram|gm)?", lower)
        if qty_match:
            qty = float(qty_match.group(1))
            if qty_match.group(3):
                unit = qty_match.group(3)

        # Extract price / rs
        price_match = re.search(r"(\d+(\.\d+)?)\s*(rs|rupaye|rupees|inr|₹)", lower)
        if price_match:
            price = float(price_match.group(1))
        else:
            # Check numbers that aren't the quantity
            numbers = re.findall(r"\b\d+(\.\d+)?\b", lower)
            if len(numbers) > 1:
                try:
                    price = float(numbers[-1][0] if isinstance(numbers[-1], tuple) else numbers[-1])
                except Exception:
                    price = 0.0

        # Extract customer name ('Ramesh ko', 'to Suresh', 'customer Priya')
        cust_match = re.search(r"(?:ko|to|for|customer|bhai)\s+([a-zA-Z]+)", text, re.IGNORECASE)
        if cust_match:
            customer = cust_match.group(1).capitalize()
        else:
            # check 'Ramesh ko' in reverse
            rev_match = re.search(r"([a-zA-Z]+)\s+ko\b", text, re.IGNORECASE)
            if rev_match:
                customer = rev_match.group(1).capitalize()

        # Extract product
        known_products = [
            ("sugar", "Sugar"),
            ("chini", "Sugar"),
            ("shakkar", "Sugar"),
            ("oil", "Cooking Oil"),
            ("tel", "Cooking Oil"),
            ("atta", "Wheat Flour"),
            ("wheat", "Wheat Flour"),
            ("rice", "Basmati Rice"),
            ("chawal", "Basmati Rice"),
            ("doodh", "Milk"),
            ("milk", "Milk"),
            ("dal", "Toor Dal"),
            ("biscuit", "Biscuits"),
            ("chai", "Tea Leaves"),
            ("tea", "Tea Leaves"),
        ]

        for term, standard_name in known_products:
            if term in lower:
                product = standard_name
                break

        return {
            "action": "sale",
            "product": product,
            "quantity": qty,
            "unit": unit,
            "price": price,
            "customer_name": customer,
            "raw_input": text,
        }

llm_parser = LLMParserClient()
