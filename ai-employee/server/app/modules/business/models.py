from datetime import datetime, timezone
from typing import Optional, Literal
from pydantic import BaseModel, Field
from sqlalchemy import Column, String, Float, DateTime, Integer, Text
from sqlalchemy.orm import declarative_base

Base = declarative_base()

# SQLAlchemy ORM Models (for User2 DB integration)
class SaleORM(Base):
    __tablename__ = "sales"

    id = Column(String(64), primary_key=True)
    product = Column(String(128), nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(32), default="unit")
    price = Column(Float, nullable=False)
    total_amount = Column(Float, nullable=False)
    customer = Column(String(128), default="Walk-in Customer")
    raw_text = Column(Text, nullable=True)
    lang = Column(String(16), default="hi")
    created_by = Column(String(128), default="owner")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class StockItemORM(Base):
    __tablename__ = "stock_items"

    id = Column(String(64), primary_key=True)
    product = Column(String(128), unique=True, nullable=False)
    quantity = Column(Float, nullable=False, default=0.0)
    unit = Column(String(32), default="unit")
    min_reorder_level = Column(Float, default=10.0)
    unit_cost = Column(Float, default=0.0)
    selling_price = Column(Float, default=0.0)
    last_updated = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class FinanceEntryORM(Base):
    __tablename__ = "finance_entries"

    id = Column(String(64), primary_key=True)
    type = Column(String(16), nullable=False)  # "income" or "expense"
    category = Column(String(64), default="sale")
    amount = Column(Float, nullable=False)
    payment_mode = Column(String(32), default="cash")  # "cash", "upi", "bank"
    reference_id = Column(String(128), nullable=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class UPIOrderORM(Base):
    __tablename__ = "upi_orders"

    order_id = Column(String(64), primary_key=True)
    amount = Column(Float, nullable=False)
    currency = Column(String(8), default="INR")
    customer_name = Column(String(128), default="Customer")
    customer_vpa = Column(String(128), nullable=True)
    note = Column(String(256), nullable=True)
    qr_payload = Column(Text, nullable=False)
    status = Column(String(32), default="pending")  # "pending", "paid", "failed"
    razorpay_order_id = Column(String(128), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


# Pydantic Request/Response Models for API
class SaleCreate(BaseModel):
    product: str
    quantity: float
    price: float
    unit: str = "unit"
    customer: Optional[str] = "Walk-in Customer"
    created_by: str = "owner"
    raw_text: Optional[str] = None
    lang: str = "hi"


class SaleResponse(BaseModel):
    id: str
    product: str
    quantity: float
    unit: str
    price: float
    total_amount: float
    customer: str
    raw_text: Optional[str] = None
    lang: str
    created_by: str
    created_at: datetime


class StockItemResponse(BaseModel):
    product: str
    quantity: float
    unit: str = "unit"
    min_reorder_level: float = 10.0
    unit_cost: float = 0.0
    selling_price: float = 0.0
    is_low_stock: bool = False
    last_updated: datetime


class StockAdjustmentRequest(BaseModel):
    product: str
    delta: float
    reason: Literal["sale", "purchase", "adjust"]
    unit: Optional[str] = "unit"
    note: Optional[str] = None


class FinanceEntryCreate(BaseModel):
    type: Literal["income", "expense"]
    category: str = "general"
    amount: float
    payment_mode: Literal["cash", "upi", "bank"] = "cash"
    reference_id: Optional[str] = None
    description: Optional[str] = None


class FinanceEntryResponse(BaseModel):
    id: str
    type: str
    category: str
    amount: float
    payment_mode: str
    reference_id: Optional[str] = None
    description: Optional[str] = None
    created_at: datetime


class FinanceSummaryResponse(BaseModel):
    total_income: float
    total_expense: float
    net_profit: float
    today_revenue: float
    today_transactions_count: int


class UPIOrderCreate(BaseModel):
    amount: float
    customer_name: Optional[str] = "Customer"
    customer_vpa: Optional[str] = None
    note: Optional[str] = "Store Payment"


class UPIOrderResponse(BaseModel):
    order_id: str
    amount: float
    currency: str
    customer_name: str
    note: str
    qr_payload: str
    upi_intent_url: str
    status: Literal["pending", "paid", "failed"]
    created_at: datetime


class ParsedEntryResponse(BaseModel):
    raw_text: str
    detected_lang: str
    action_type: Literal["sale", "stock_in", "expense", "unknown"]
    product: Optional[str] = None
    quantity: Optional[float] = None
    unit: Optional[str] = None
    amount: Optional[float] = None
    party: Optional[str] = None
    confidence: float


# --- Product Models ---
class ProductCreate(BaseModel):
    name: str
    category: str = "General"
    unit: str = "kg"
    cost_price: float = 0.0
    selling_price: float = 0.0
    reorder_level: float = 10.0
    current_stock: float = 0.0


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    cost_price: Optional[float] = None
    selling_price: Optional[float] = None
    reorder_level: Optional[float] = None
    current_stock: Optional[float] = None


class ProductResponse(BaseModel):
    id: int
    product_id: Optional[str] = None
    name: str
    category: str
    unit: str
    cost_price: float
    selling_price: float
    reorder_level: float
    current_stock: float
    is_low_stock: bool = False
    created_at: datetime


# --- Customer Models ---
class CustomerCreate(BaseModel):
    name: str
    phone: str
    language: str = "hi"
    credit_limit: float = 5000.0
    current_balance: float = 0.0
    address: Optional[str] = None


class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    language: Optional[str] = None
    credit_limit: Optional[float] = None
    current_balance: Optional[float] = None
    address: Optional[str] = None


class CustomerResponse(BaseModel):
    id: int
    customer_id: Optional[str] = None
    name: str
    phone: str
    language: str
    credit_limit: float
    current_balance: float
    address: Optional[str] = None
    created_at: datetime


# --- Supplier Models ---
class SupplierCreate(BaseModel):
    name: str
    contact_person: Optional[str] = None
    phone: str
    category: Optional[str] = None
    lead_time_days: int = 2
    address: Optional[str] = None


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    contact_person: Optional[str] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    lead_time_days: Optional[int] = None
    address: Optional[str] = None


class SupplierResponse(BaseModel):
    id: int
    supplier_id: Optional[str] = None
    name: str
    contact_person: Optional[str] = None
    phone: str
    category: Optional[str] = None
    lead_time_days: int
    address: Optional[str] = None
    created_at: datetime


# --- Purchase Models ---
class PurchaseCreate(BaseModel):
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    product: str
    quantity: float
    unit: str = "kg"
    unit_cost: float
    payment_mode: str = "bank"


class PurchaseResponse(BaseModel):
    id: int
    purchase_id: Optional[str] = None
    supplier_id: Optional[str] = None
    supplier_name: Optional[str] = None
    product: str
    quantity: float
    unit: str
    unit_cost: float
    total_amount: float
    status: str
    created_at: datetime


# --- Expense Models ---
class ExpenseCreate(BaseModel):
    category: str
    amount: float
    payment_mode: str = "cash"
    description: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    expense_id: Optional[str] = None
    category: str
    amount: float
    payment_mode: str
    description: Optional[str] = None
    date: datetime


# --- Unified Multilingual Quick Entry Schema ---
class BusinessEntryInput(BaseModel):
    text: str
    confirm: bool = False
    lang: str = "auto"


class BusinessEntryResult(BaseModel):
    status: str
    confidence: float
    action: str
    parsed: dict
    record_id: Optional[str] = None
    message: str
