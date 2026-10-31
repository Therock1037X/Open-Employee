import re
import uuid
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any

from app.schemas.schemas import SaleEntry, StockMovement
from app.modules.business.models import (
    SaleResponse,
    SaleCreate,
    StockItemResponse,
    StockAdjustmentRequest,
    FinanceEntryCreate,
    FinanceEntryResponse,
    FinanceSummaryResponse,
    UPIOrderCreate,
    UPIOrderResponse,
    ParsedEntryResponse,
)


class BusinessService:
    """Core domain service for sales, stock inventory, finance ledger, and UPI payment operations."""

    def __init__(self):
        # In-memory transactional datastore for zero-dependency standalone execution
        self.sales: Dict[str, Dict[str, Any]] = {}
        self.stock: Dict[str, Dict[str, Any]] = {}
        self.finance: Dict[str, Dict[str, Any]] = {}
        self.upi_orders: Dict[str, Dict[str, Any]] = {}

        # Pre-seed realistic Indian MSME starter stock
        self._seed_default_inventory()

    def _seed_default_inventory(self):
        default_items = [
            {"product": "Sugar (चीनी)", "quantity": 45.0, "unit": "kg", "min_reorder_level": 20.0, "unit_cost": 38.0, "selling_price": 45.0},
            {"product": "Atta (गेहूं का आटा)", "quantity": 12.0, "unit": "kg", "min_reorder_level": 15.0, "unit_cost": 32.0, "selling_price": 40.0},
            {"product": "Mustard Oil (सरसों तेल)", "quantity": 8.0, "unit": "L", "min_reorder_level": 10.0, "unit_cost": 130.0, "selling_price": 155.0},
            {"product": "Toor Dal (अरहर दाल)", "quantity": 25.0, "unit": "kg", "min_reorder_level": 10.0, "unit_cost": 140.0, "selling_price": 165.0},
            {"product": "Basmati Rice (बासमती चावल)", "quantity": 30.0, "unit": "kg", "min_reorder_level": 15.0, "unit_cost": 75.0, "selling_price": 95.0},
            {"product": "Tea Leaves (चाय पत्ती)", "quantity": 14.0, "unit": "kg", "min_reorder_level": 5.0, "unit_cost": 280.0, "selling_price": 340.0},
        ]
        now = datetime.now(timezone.utc)
        for item in default_items:
            self.stock[item["product"].lower()] = {
                "id": str(uuid.uuid4()),
                "product": item["product"],
                "quantity": item["quantity"],
                "unit": item["unit"],
                "min_reorder_level": item["min_reorder_level"],
                "unit_cost": item["unit_cost"],
                "selling_price": item["selling_price"],
                "last_updated": now,
            }

    # ---------------- Sales Operations ---------------- #

    def record_sale(self, sale_in: SaleCreate) -> SaleResponse:
        sale_id = f"SALE-{uuid.uuid4().hex[:8].upper()}"
        total_amount = round(sale_in.quantity * sale_in.price, 2)
        now = datetime.now(timezone.utc)

        sale_record = {
            "id": sale_id,
            "product": sale_in.product,
            "quantity": sale_in.quantity,
            "unit": sale_in.unit,
            "price": sale_in.price,
            "total_amount": total_amount,
            "customer": sale_in.customer or "Walk-in Customer",
            "raw_text": sale_in.raw_text,
            "lang": sale_in.lang,
            "created_by": sale_in.created_by,
            "created_at": now,
        }
        self.sales[sale_id] = sale_record

        # Automatically deduct stock
        self.adjust_stock(
            StockAdjustmentRequest(
                product=sale_in.product,
                delta=-sale_in.quantity,
                reason="sale",
                unit=sale_in.unit,
                note=f"Deducted for {sale_id}",
            )
        )

        # Automatically credit financial ledger
        self.record_finance_entry(
            FinanceEntryCreate(
                type="income",
                category="sale",
                amount=total_amount,
                payment_mode="cash",
                reference_id=sale_id,
                description=f"Sale of {sale_in.quantity} {sale_in.unit} {sale_in.product} to {sale_in.customer}",
            )
        )

        return SaleResponse(**sale_record)

    def list_sales(self, limit: int = 50, skip: int = 0) -> List[SaleResponse]:
        all_sales = sorted(self.sales.values(), key=lambda s: s["created_at"], reverse=True)
        return [SaleResponse(**s) for s in all_sales[skip : skip + limit]]

    # ---------------- Stock / Inventory Operations ---------------- #

    def list_stock(self) -> List[StockItemResponse]:
        items = []
        for s in self.stock.values():
            is_low = s["quantity"] <= s["min_reorder_level"]
            items.append(
                StockItemResponse(
                    product=s["product"],
                    quantity=s["quantity"],
                    unit=s["unit"],
                    min_reorder_level=s["min_reorder_level"],
                    unit_cost=s["unit_cost"],
                    selling_price=s["selling_price"],
                    is_low_stock=is_low,
                    last_updated=s["last_updated"],
                )
            )
        return sorted(items, key=lambda x: (not x.is_low_stock, x.product))

    def adjust_stock(self, adj: StockAdjustmentRequest) -> StockItemResponse:
        key = adj.product.lower().strip()
        now = datetime.now(timezone.utc)

        if key in self.stock:
            curr = self.stock[key]
            new_qty = max(0.0, curr["quantity"] + adj.delta)
            curr["quantity"] = new_qty
            curr["last_updated"] = now
            item_data = curr
        else:
            new_qty = max(0.0, adj.delta)
            item_data = {
                "id": str(uuid.uuid4()),
                "product": adj.product.strip(),
                "quantity": new_qty,
                "unit": adj.unit or "unit",
                "min_reorder_level": 10.0,
                "unit_cost": 0.0,
                "selling_price": 0.0,
                "last_updated": now,
            }
            self.stock[key] = item_data

        is_low = item_data["quantity"] <= item_data["min_reorder_level"]
        return StockItemResponse(
            product=item_data["product"],
            quantity=item_data["quantity"],
            unit=item_data["unit"],
            min_reorder_level=item_data["min_reorder_level"],
            unit_cost=item_data["unit_cost"],
            selling_price=item_data["selling_price"],
            is_low_stock=is_low,
            last_updated=item_data["last_updated"],
        )

    def get_low_stock_alerts(self) -> List[StockItemResponse]:
        all_items = self.list_stock()
        return [item for item in all_items if item.is_low_stock]

    # ---------------- Finance Operations ---------------- #

    def record_finance_entry(self, entry_in: FinanceEntryCreate) -> FinanceEntryResponse:
        entry_id = f"FIN-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc)

        record = {
            "id": entry_id,
            "type": entry_in.type,
            "category": entry_in.category,
            "amount": round(entry_in.amount, 2),
            "payment_mode": entry_in.payment_mode,
            "reference_id": entry_in.reference_id,
            "description": entry_in.description,
            "created_at": now,
        }
        self.finance[entry_id] = record
        return FinanceEntryResponse(**record)

    def list_finance_entries(self, limit: int = 50) -> List[FinanceEntryResponse]:
        entries = sorted(self.finance.values(), key=lambda f: f["created_at"], reverse=True)
        return [FinanceEntryResponse(**f) for f in entries[:limit]]

    def get_finance_summary(self) -> FinanceSummaryResponse:
        total_income = sum(f["amount"] for f in self.finance.values() if f["type"] == "income")
        total_expense = sum(f["amount"] for f in self.finance.values() if f["type"] == "expense")
        net_profit = round(total_income - total_expense, 2)

        # Today's statistics
        today_date = datetime.now(timezone.utc).date()
        today_income = sum(
            f["amount"]
            for f in self.finance.values()
            if f["type"] == "income" and f["created_at"].date() == today_date
        )
        today_count = sum(
            1 for f in self.finance.values() if f["created_at"].date() == today_date
        )

        return FinanceSummaryResponse(
            total_income=round(total_income, 2),
            total_expense=round(total_expense, 2),
            net_profit=net_profit,
            today_revenue=round(today_income, 2),
            today_transactions_count=today_count,
        )

    # ---------------- UPI & Razorpay Checkout ---------------- #

    def create_upi_order(self, order_in: UPIOrderCreate) -> UPIOrderResponse:
        order_id = f"UPI-{uuid.uuid4().hex[:8].upper()}"
        now = datetime.now(timezone.utc)
        merchant_vpa = "openemployee@icici"
        merchant_name = "Open Employee Store"

        # Standard Indian UPI URI schema (NPCI standard compliant)
        amount_str = f"{order_in.amount:.2f}"
        note_str = (order_in.note or "Store Payment").replace(" ", "%20")
        name_str = merchant_name.replace(" ", "%20")
        upi_intent = f"upi://pay?pa={merchant_vpa}&pn={name_str}&am={amount_str}&cu=INR&tn={note_str}&tr={order_id}"

        order_record = {
            "order_id": order_id,
            "amount": order_in.amount,
            "currency": "INR",
            "customer_name": order_in.customer_name or "Customer",
            "note": order_in.note or "Store Payment",
            "qr_payload": upi_intent,
            "upi_intent_url": upi_intent,
            "status": "pending",
            "created_at": now,
        }
        self.upi_orders[order_id] = order_record
        return UPIOrderResponse(**order_record)

    def list_upi_orders(self, limit: int = 20) -> List[UPIOrderResponse]:
        orders = sorted(self.upi_orders.values(), key=lambda o: o["created_at"], reverse=True)
        return [UPIOrderResponse(**o) for o in orders[:limit]]

    def get_upi_status(self, order_id: str) -> Optional[UPIOrderResponse]:
        if order_id not in self.upi_orders:
            return None
        return UPIOrderResponse(**self.upi_orders[order_id])

    def simulate_upi_payment_success(self, order_id: str) -> Optional[UPIOrderResponse]:
        if order_id not in self.upi_orders:
            return None

        order = self.upi_orders[order_id]
        if order["status"] != "paid":
            order["status"] = "paid"
            # Auto-record income entry in ledger
            self.record_finance_entry(
                FinanceEntryCreate(
                    type="income",
                    category="upi_collection",
                    amount=order["amount"],
                    payment_mode="upi",
                    reference_id=order_id,
                    description=f"UPI Payment from {order['customer_name']} ({order['note']})",
                )
            )

        return UPIOrderResponse(**order)

    # ---------------- Multilingual Quick Entry Parser ---------------- #

    def parse_entry_text(self, text: str) -> ParsedEntryResponse:
        """Parses multilingual Hinglish/Hindi/English audio transcripts or text inputs."""
        cleaned = text.strip()
        lower = cleaned.lower()

        # Heuristic detection for Hinglish sales: e.g. "2 kg sugar becha Ramesh ko 90 rs"
        # Or "5 packet biscuit becha 100 me"
        sale_keywords = ["becha", "sale", "sold", "bika", "diya"]
        expense_keywords = ["bill", "rent", "kharch", "paid", "diye", "electricity", "salary"]
        stock_keywords = ["kharida", "purchased", "bought", "restock", "aaya", "stock in"]

        action_type = "unknown"
        if any(w in lower for w in sale_keywords):
            action_type = "sale"
        elif any(w in lower for w in expense_keywords):
            action_type = "expense"
        elif any(w in lower for w in stock_keywords):
            action_type = "stock_in"

        # Extract amount/price: looks for "90 rs", "rs 90", "₹90", "90 rupaye", "90 mein"
        amount = None
        price_match = re.search(r'(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:rs|rupaye|rupees|mein|ko)?', lower)
        # More targeted price match
        numbers = re.findall(r'(\d+(?:\.\d+)?)', lower)
        quant = None
        unit = "unit"

        # Detect unit & quantity
        units_pattern = r'(\d+(?:\.\d+)?)\s*(kg|kilo|gram|gm|packet|pkt|bottle|box|liter|litre|l|piece|pc|bori|bag)'
        unit_match = re.search(units_pattern, lower)
        if unit_match:
            quant = float(unit_match.group(1))
            unit = unit_match.group(2)
        elif len(numbers) >= 2:
            quant = float(numbers[0])
            amount = float(numbers[1])
        elif len(numbers) == 1:
            if action_type == "expense":
                amount = float(numbers[0])
            else:
                quant = float(numbers[0])

        if len(numbers) >= 2 and amount is None:
            amount = float(numbers[-1])

        # Detect party / customer: "<name> ko" or "to/for/se <name>"
        party = None
        # Check "<name> ko" first (very common in Hindi: "Ramesh ko")
        party_suffix_match = re.search(r'([a-zA-Z\u0900-\u097F]+)\s+ko\b', cleaned, re.IGNORECASE)
        if party_suffix_match:
            cand = party_suffix_match.group(1).strip()
            if cand.lower() not in ["sugar", "chini", "atta", "dal", "oil", "sabji", "maal"]:
                party = cand.capitalize()
        if not party:
            party_prefix_match = re.search(r'(?:to|for|se)\s+([a-zA-Z\u0900-\u097F]+)', cleaned, re.IGNORECASE)
            if party_prefix_match:
                cand = party_prefix_match.group(1).strip()
                if cand.lower() not in ["90", "rs", "mein", "rupaye", "cash"]:
                    party = cand.capitalize()

        # Detect product name
        product = None
        common_products = [
            "sugar", "chini", "चीनी",
            "atta", "aata", "आटा",
            "oil", "tel", "तेल",
            "dal", "daal", "दाल",
            "rice", "chawal", "चावल",
            "tea", "chai", "चाय",
            "biscuit", "soap", "shampoo",
            "milk", "doodh", "दूध",
        ]
        for cp in common_products:
            if cp in lower:
                product = cp.capitalize()
                break

        if not product and action_type in ["sale", "stock_in"]:
            # Fallback product extraction between quantity and action verb
            words = cleaned.split()
            if len(words) > 2:
                product = words[1].capitalize()

        detected_lang = "hi" if any(ord(c) >= 0x0900 and ord(c) <= 0x097F for c in cleaned) else "hinglish"

        return ParsedEntryResponse(
            raw_text=cleaned,
            detected_lang=detected_lang,
            action_type=action_type if action_type != "unknown" else "sale",
            product=product or "Product",
            quantity=quant or 1.0,
            unit=unit,
            amount=amount or (quant * 50.0 if quant else 100.0),
            party=party or "Customer",
            confidence=0.88,
        )


# Singleton instance for the service
business_service = BusinessService()
