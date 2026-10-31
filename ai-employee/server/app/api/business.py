from typing import List, Optional
from fastapi import APIRouter, HTTPException, Query, Body

from app.modules.business.service import business_service
from app.modules.business.models import (
    SaleCreate,
    SaleResponse,
    StockItemResponse,
    StockAdjustmentRequest,
    FinanceEntryCreate,
    FinanceEntryResponse,
    FinanceSummaryResponse,
    UPIOrderCreate,
    UPIOrderResponse,
    ParsedEntryResponse,
)

router = APIRouter(prefix="/business", tags=["business"])


@router.get("/ping")
def ping():
    """Health check for business module."""
    return {"module": "business", "status": "ok"}


@router.get("/summary")
def get_business_summary():
    """Returns top-level dashboard metrics for the business."""
    finance = business_service.get_finance_summary()
    stock = business_service.list_stock()
    low_stock = [s for s in stock if s.is_low_stock]
    recent_sales = business_service.list_sales(limit=5)
    recent_upi = business_service.list_upi_orders(limit=5)

    return {
        "finance": finance,
        "total_products_count": len(stock),
        "low_stock_count": len(low_stock),
        "low_stock_items": low_stock,
        "recent_sales_count": len(recent_sales),
        "pending_upi_count": sum(1 for o in recent_upi if o.status == "pending"),
    }


# ---------------- Sales Endpoints ---------------- #

@router.post("/sales", response_model=SaleResponse)
def create_sale(payload: SaleCreate):
    """Records a new sale, automatically deducts inventory and registers income in finance ledger."""
    return business_service.record_sale(payload)


@router.get("/sales", response_model=List[SaleResponse])
def get_sales(limit: int = Query(50, ge=1, le=200), skip: int = Query(0, ge=0)):
    """Fetches paginated sales history."""
    return business_service.list_sales(limit=limit, skip=skip)


@router.post("/sales/parse", response_model=ParsedEntryResponse)
def parse_voice_or_text_entry(text: str = Body(..., embed=True)):
    """Heuristic / NLP parsing endpoint for multilingual Hinglish/Hindi audio transcripts or text."""
    return business_service.parse_entry_text(text)


# ---------------- Stock Endpoints ---------------- #

@router.get("/stock", response_model=List[StockItemResponse])
def get_stock():
    """Returns current inventory stock levels with low-stock alerts."""
    return business_service.list_stock()


@router.post("/stock/movement", response_model=StockItemResponse)
def record_stock_movement(adj: StockAdjustmentRequest):
    """Adjusts stock level (restock purchase, loss adjustment, audit correction)."""
    return business_service.adjust_stock(adj)


@router.get("/stock/alerts", response_model=List[StockItemResponse])
def get_stock_alerts():
    """Returns products that have breached min_reorder_level."""
    return business_service.get_low_stock_alerts()


# ---------------- Finance Endpoints ---------------- #

@router.get("/finance/summary", response_model=FinanceSummaryResponse)
def get_finance_summary():
    """Returns income, expenses, and net profit."""
    return business_service.get_finance_summary()


@router.get("/finance/ledger", response_model=List[FinanceEntryResponse])
def get_finance_ledger(limit: int = Query(50, ge=1, le=200)):
    """Returns chronological ledger entries."""
    return business_service.list_finance_entries(limit=limit)


@router.post("/finance/record", response_model=FinanceEntryResponse)
def record_manual_finance_entry(entry: FinanceEntryCreate):
    """Allows manual recording of operational expenses (rent, electricity, supplier advance) or income."""
    return business_service.record_finance_entry(entry)


# ---------------- Razorpay UPI Endpoints ---------------- #

@router.post("/upi/create-order", response_model=UPIOrderResponse)
def create_upi_checkout(order: UPIOrderCreate):
    """Generates an embedded Razorpay/UPI QR payload and payment intent URL."""
    return business_service.create_upi_order(order)


@router.get("/upi/orders", response_model=List[UPIOrderResponse])
def list_upi_orders(limit: int = Query(20, ge=1, le=100)):
    """Lists recent UPI payment requests."""
    return business_service.list_upi_orders(limit=limit)


@router.get("/upi/status/{order_id}", response_model=UPIOrderResponse)
def check_upi_order_status(order_id: str):
    """Checks real-time payment status of a UPI checkout order."""
    res = business_service.get_upi_status(order_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"UPI order {order_id} not found")
    return res


@router.post("/upi/simulate-success/{order_id}", response_model=UPIOrderResponse)
def simulate_customer_paid_upi(order_id: str):
    """Simulates instant UPI payment webhook from bank/Razorpay for testing."""
    res = business_service.simulate_upi_payment_success(order_id)
    if not res:
        raise HTTPException(status_code=404, detail=f"UPI order {order_id} not found")
    return res
