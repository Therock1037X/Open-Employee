from datetime import datetime
from typing import Optional, Literal, List, Dict, Any
from pydantic import BaseModel, Field, model_validator

# --- Business & Sales Schemas (User 1) ---

class SaleEntry(BaseModel):
    product: str
    quantity: float
    price: float
    created_by: str
    customer_name: Optional[str] = "Walk-in Customer"
    raw_text: Optional[str] = None
    lang: str = "hi"


class SaleResponse(SaleEntry):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class StockMovement(BaseModel):
    product: str
    delta: float
    reason: Literal["sale", "purchase", "adjust"]


class StockItem(BaseModel):
    id: int
    product: str
    current_quantity: float
    min_threshold: float
    unit: str
    updated_at: datetime

    class Config:
        from_attributes = True


# --- Agent & Task Schemas (User 2) ---

class AgentCommandRequest(BaseModel):
    text: str = Field(..., description="Spoken or typed command, e.g., '2 kg sugar becha Ramesh ko 90 rs'")
    lang: str = Field("hi", description="ISO language code: hi, en, hinglish, ta, te, etc.")
    audio_base64: Optional[str] = None


class AgentTask(BaseModel):
    id: str
    kind: str
    payload: Dict[str, Any] = Field(default_factory=dict)
    status: Literal["pending", "awaiting_approval", "running", "done", "failed"] = "pending"
    result: Optional[Dict[str, Any]] = None
    requires_approval: bool = False
    run_at: Optional[datetime] = None
    created_at: Optional[datetime] = None


class AgentCommandResponse(BaseModel):
    task_id: str
    action_type: str
    status: str
    requires_approval: bool
    summary: str
    parsed_data: Dict[str, Any] = Field(default_factory=dict)


class ApprovalRequest(BaseModel):
    id: Optional[int] = None
    task_id: str
    action: str
    amount: Optional[float] = None
    recipient: Optional[str] = None
    details: Dict[str, Any] = Field(default_factory=dict)
    status: Literal["pending", "approved", "rejected"] = "pending"
    decided_by: Optional[str] = None
    decided_at: Optional[datetime] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class ApprovalDecision(BaseModel):
    approved: bool
    decided_by: str = "Owner"
    reason: Optional[str] = None


# --- Forecasting & Computer Use Schemas (User 2) ---

class ForecastRequest(BaseModel):
    product: str = "Sugar"
    days_ahead: int = 7


class DailyPrediction(BaseModel):
    date: str
    predicted_sales: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    product: str
    current_stock: float
    days_ahead: int
    total_predicted_demand: float
    recommended_reorder_quantity: float
    stockout_risk: bool
    daily_predictions: List[DailyPrediction]


class GSTFilingRequest(BaseModel):
    gstin: str = "27AABCT3518Q1ZB"
    return_period: str = "OCT-2026"
    taxable_turnover: float = 125000.0
    tax_paid: float = 6250.0


class GSTFilingResponse(BaseModel):
    task_id: str
    arn: str
    status: str
    return_period: str
    message: str
    filed_at: datetime


# --- Integrations Schemas (User 3) ---

class WhatsAppMessage(BaseModel):
    to_phone: str
    text: str
    image_url: Optional[str] = None
    approved: bool = False


class WhatsAppImageMessage(BaseModel):
    to_phone: str
    image_url: str
    caption: Optional[str] = None
    approved: bool = False


class WhatsAppTemplateRequest(BaseModel):
    to_phone: str
    template_name: str = "hello_world"
    language_code: str = "en_US"
    components: Optional[List[Dict[str, Any]]] = None
    approved: bool = True


class WhatsAppStatusRequest(BaseModel):
    text: Optional[str] = None
    image_url: Optional[str] = None
    to_phone: Optional[str] = None
    approved: bool = False


class InstagramPostRequest(BaseModel):
    image_url: str
    caption: Optional[str] = None
    auto_generate_caption: bool = True
    topic: Optional[str] = "Fresh Grocery Stock"


class IndiaMARTLead(BaseModel):
    query_id: str
    buyer_name: str
    buyer_mobile: str
    product_name: str
    quantity: str
    location: str
    created_at: str


class UPIOrderRequest(BaseModel):
    amount: float
    customer_name: str = "Valued Customer"
    customer_phone: str = "9876543210"
    description: str = "Store Purchase"


class UPIOrderResponse(BaseModel):
    order_id: str
    amount: float
    upi_link: str
    qr_code_url: str
    status: str


# --- Voice, Memory & Audit Schemas (User 4) ---

class VoiceCallRequest(BaseModel):
    phone: str
    script: str
    lang: str = "hi"
    supplier_name: Optional[str] = "Wholesale Supplier"
    product_to_order: Optional[str] = "Sugar"


class VoiceCallResponse(BaseModel):
    call_id: str
    status: str
    language: str
    simulated_transcript: Optional[str] = None
    outcome: str


class MemoryItem(BaseModel):
    key: str
    content: str
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AuditEvent(BaseModel):
    actor: str
    action: str
    detail: Dict[str, Any] = Field(default_factory=dict)
    ts: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        from_attributes = True
