from pydantic import BaseModel
from typing import Optional, Literal
from datetime import datetime

class SaleEntry(BaseModel):
    product: str; quantity: float; price: float
    created_by: str; raw_text: Optional[str] = None; lang: str = "hi"

class StockMovement(BaseModel):
    product: str; delta: float; reason: Literal["sale","purchase","adjust"]

class AgentTask(BaseModel):
    id: str; kind: str; payload: dict
    status: Literal["pending","awaiting_approval","running","done","failed"] = "pending"
    run_at: Optional[datetime] = None

class ApprovalRequest(BaseModel):
    task_id: str; action: str; amount: Optional[float] = None
    status: Literal["pending","approved","rejected"] = "pending"

class AuditEvent(BaseModel):
    actor: str; action: str; detail: dict; ts: datetime
