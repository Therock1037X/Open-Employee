import uuid
from datetime import datetime
from typing import Dict, Any, List, Optional
from app.core.database import (
    SessionLocal,
    Sale,
    Stock,
    AgentTaskRecord,
    AuditLogRecord,
)
from app.modules.agent.llm.client import llm_parser
from app.modules.agent.approval_gate.gate import approval_gate
from app.schemas.schemas import AgentCommandResponse

class AgentPlanner:
    """
    Autonomous agent workflow planner:
    Coordinates parsing, business updates, low-stock triggers, approval gating, and execution.
    """

    async def handle_user_command(
        self,
        text: str,
        lang: str = "hi",
        actor: str = "shop_employee",
    ) -> AgentCommandResponse:
        parsed = await llm_parser.parse_business_command(text, lang)
        action = parsed.get("action", "sale")
        task_id = str(uuid.uuid4())[:12]

        db = SessionLocal()
        try:
            if action == "sale":
                product_name = parsed.get("product", "Item")
                qty = float(parsed.get("quantity", 1.0))
                price = float(parsed.get("price", 0.0))
                customer = parsed.get("customer_name", "Walk-in Customer")

                # 1. Record Sale
                sale = Sale(
                    product=product_name,
                    quantity=qty,
                    price=price,
                    created_by=actor,
                    raw_text=text,
                    lang=lang,
                    created_at=datetime.utcnow(),
                )
                db.add(sale)

                # 2. Update Stock
                stock_item = db.query(Stock).filter(Stock.product.ilike(product_name)).first()
                if not stock_item:
                    stock_item = Stock(
                        product=product_name,
                        current_quantity=max(0.0, 100.0 - qty),
                        min_threshold=20.0,
                        unit=parsed.get("unit") or "kg",
                    )
                    db.add(stock_item)
                else:
                    stock_item.current_quantity = max(0.0, stock_item.current_quantity - qty)

                db.commit()

                # Audit log
                audit = AuditLogRecord(
                    actor=actor,
                    action="record_sale",
                    detail={"product": product_name, "quantity": qty, "price": price, "customer": customer},
                    timestamp=datetime.utcnow(),
                )
                db.add(audit)
                db.commit()

                # 3. Check for Low Stock Trigger
                low_stock_triggered = False
                summary = f"Recorded sale of {qty} {stock_item.unit} {product_name} to {customer} for ₹{price}."

                if stock_item.current_quantity <= stock_item.min_threshold:
                    low_stock_triggered = True
                    recovery_task_id = self.trigger_low_stock_plan(
                        product=product_name,
                        current_qty=stock_item.current_quantity,
                        db=db,
                    )
                    summary += f" Low stock warning! Stock is now {stock_item.current_quantity}{stock_item.unit}. Agent drafted supplier voice call & WhatsApp restock notice (Awaiting approval)."

                return AgentCommandResponse(
                    task_id=task_id,
                    action_type="sale",
                    status="completed",
                    requires_approval=low_stock_triggered,
                    summary=summary,
                    parsed_data={
                        "product": product_name,
                        "quantity": qty,
                        "price": price,
                        "customer": customer,
                        "remaining_stock": stock_item.current_quantity,
                    },
                )

            elif action == "file_gst":
                # GST filing via Computer Use requires human approval
                task = AgentTaskRecord(
                    id=task_id,
                    kind="gst_portal_filing",
                    payload={"period": "OCT-2026", "turnover": 125000.0, "tax": 6250.0},
                    status="awaiting_approval",
                    requires_approval=True,
                    created_at=datetime.utcnow(),
                )
                db.add(task)
                db.commit()

                approval_gate.register_for_approval(
                    task_id=task_id,
                    action="gst_submit",
                    details={"portal": "GST Mock Portal", "form": "GSTR-3B", "tax_amount": 6250.0},
                    amount=6250.0,
                    recipient="GST Network",
                    db=db,
                )

                return AgentCommandResponse(
                    task_id=task_id,
                    action_type="file_gst",
                    status="awaiting_approval",
                    requires_approval=True,
                    summary="GST return filing prepared. Pending owner approval before Playwright executes on GST portal.",
                    parsed_data=parsed,
                )

            else:
                return AgentCommandResponse(
                    task_id=task_id,
                    action_type=action,
                    status="completed",
                    requires_approval=False,
                    summary=f"Processed {action} command.",
                    parsed_data=parsed,
                )
        finally:
            db.close()

    def trigger_low_stock_plan(self, product: str, current_qty: float, db: Optional[Any] = None) -> str:
        """
        Creates low stock recovery plan:
        1. Draft supplier voice call in Hindi
        2. Draft WhatsApp customer status update
        3. Enters Approval Gate
        """
        close_session = False
        if db is None:
            db = SessionLocal()
            close_session = True

        try:
            task_id = str(uuid.uuid4())[:12]
            reorder_qty = 50.0
            supplier_phone = "+919876543210"

            task = AgentTaskRecord(
                id=task_id,
                kind="low_stock_recovery",
                payload={
                    "product": product,
                    "current_qty": current_qty,
                    "reorder_qty": reorder_qty,
                    "supplier_phone": supplier_phone,
                    "hindi_script": f"Namaste Gupta ji, hamare paas {product} lagbhag khatam ho gaya hai. Kripya {reorder_qty} kg ka fresh batch kal subah tak bhej dijiye.",
                },
                status="awaiting_approval",
                requires_approval=True,
                created_at=datetime.utcnow(),
            )
            db.add(task)

            # Register for approval gate
            approval_gate.register_for_approval(
                task_id=task_id,
                action="voice_call_supplier",
                details={
                    "product": product,
                    "supplier": "Gupta Wholesale Mart",
                    "supplier_phone": supplier_phone,
                    "script": f"Hindi Voice Call to order {reorder_qty} kg {product}",
                    "estimated_order_value": 4500.0,
                },
                amount=4500.0,
                recipient="Gupta Wholesale Mart",
                db=db,
            )

            # Audit
            audit = AuditLogRecord(
                actor="agent_planner",
                action="low_stock_workflow_triggered",
                detail={"product": product, "task_id": task_id, "reorder_qty": reorder_qty},
                timestamp=datetime.utcnow(),
            )
            db.add(audit)
            db.commit()
            return task_id
        finally:
            if close_session:
                db.close()

agent_planner = AgentPlanner()
