"""
Module Interfaces & Cross-User Contracts

This file defines the exact Protocols (contracts) between:
- User 1: client/ and server/app/modules/business (Sales, Stock, Finance CRUD)
- User 2: server/app/{core,schemas,workers}, migrations, modules/{agent,forecasting,computer_use}, mock-portal/
- User 3: server/app/modules/integrations (whatsapp, instagram, indiamart, payments_upi, finance_tools, captions)
- User 4: server/app/modules/{voice,memory,audit}
"""

from typing import Protocol, List, Dict, Any, Optional
from datetime import datetime


# ==============================================================================
# User 1 Contract: Business Service (Needed by Agent, Voice & Forecasting)
# ==============================================================================
class BusinessService(Protocol):
    """What User 2, 3, and 4 need from User 1 (business module)."""

    def record_sale(self, entry: Dict[str, Any]) -> Dict[str, Any]:
        """Record a parsed sale and deduct stock automatically."""
        ...

    def get_stock(self, product: str) -> Optional[Dict[str, Any]]:
        """Get current stock level and threshold for a given product."""
        ...

    def get_all_stock(self) -> List[Dict[str, Any]]:
        """List all inventory items with low-stock alerts."""
        ...

    def update_stock(self, product: str, delta: float, reason: str) -> Dict[str, Any]:
        """Adjust inventory stock quantity."""
        ...

    def get_sales_history(self, product: Optional[str] = None, limit: int = 100) -> List[Dict[str, Any]]:
        """Retrieve recent sales data for demand forecasting."""
        ...


# ==============================================================================
# User 2 Contract: Agent, Forecasting & Computer Use
# ==============================================================================
class AgentPlanner(Protocol):
    """Autonomous agent planner and approval manager."""

    def parse_command(self, text: str, lang: str = "hi") -> Dict[str, Any]:
        """Parse natural language Hindi/Hinglish/English into structured tasks."""
        ...

    def evaluate_low_stock_and_plan(self, product: str, current_qty: float) -> str:
        """Trigger multi-step recovery: draft WhatsApp post + supplier Hindi call -> approval."""
        ...

    def execute_approved_task(self, task_id: str) -> Dict[str, Any]:
        """Execute a task once approved by the human owner."""
        ...


class Forecaster(Protocol):
    """Predictive sales and inventory forecasting using Prophet / XGBoost."""

    def forecast_demand(self, product: str, days_ahead: int = 7) -> Dict[str, Any]:
        """Forecast unit demand for the upcoming week and compute reorder point."""
        ...


class ComputerUseAutomator(Protocol):
    """Playwright browser automation for GST mock portal."""

    async def file_gstr3b_return(self, gstin: str, turnover: float, tax_paid: float) -> Dict[str, Any]:
        """Operate the mock GST portal via Playwright and return ARN acknowledgement."""
        ...


# ==============================================================================
# User 3 Contract: External Integrations
# ==============================================================================
class WhatsAppMessenger(Protocol):
    def send_message(self, to_phone: str, message: str, image_url: Optional[str] = None) -> Dict[str, Any]:
        """Send a WhatsApp message or customer alert."""
        ...


class InstagramPublisher(Protocol):
    def publish_post(self, image_url: str, caption: str) -> Dict[str, Any]:
        """Publish an image with auto-generated caption to Instagram."""
        ...


class IndiaMARTClient(Protocol):
    def fetch_recent_leads(self) -> List[Dict[str, Any]]:
        """Fetch buyer leads from IndiaMART portal."""
        ...


class UPIPaymentGateway(Protocol):
    def create_payment_order(self, amount: float, customer_name: str, phone: str) -> Dict[str, Any]:
        """Generate Razorpay UPI payment link and dynamic QR code."""
        ...


# ==============================================================================
# User 4 Contract: Voice, Memory & Audit
# ==============================================================================
class VoiceCaller(Protocol):
    def place_outbound_call(self, phone: str, script: str, lang: str = "hi") -> Dict[str, Any]:
        """Place an Indian-language voice call using Bhashini + Exotel."""
        ...


class MemoryStore(Protocol):
    def remember(self, key: str, value: str, metadata: Optional[Dict[str, Any]] = None) -> None:
        """Store business memory in PostgreSQL + pgvector."""
        ...

    def recall(self, query: str, k: int = 5) -> List[str]:
        """Recall relevant past context using vector similarity."""
        ...


class AuditLogger(Protocol):
    def log(self, actor: str, action: str, detail: Dict[str, Any]) -> None:
        """Append an unalterable audit log entry."""
        ...
