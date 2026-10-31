from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Body
from app.core.auth import verify_firebase_token
from app.schemas.schemas import (
    AgentCommandRequest,
    AgentCommandResponse,
    ApprovalRequest,
    ApprovalDecision,
    ForecastRequest,
    ForecastResponse,
    GSTFilingRequest,
    GSTFilingResponse,
)
from app.modules.agent.planner.planner import agent_planner
from app.modules.agent.approval_gate.gate import approval_gate
from app.modules.forecasting.forecaster import forecaster
from app.modules.computer_use.portal_bot import portal_bot

router = APIRouter(prefix="/agent", tags=["agent"])


@router.get("/ping")
def ping():
    return {
        "module": "agent",
        "status": "online",
        "features": ["multilingual_llm", "planner", "approval_gate", "forecasting", "computer_use"],
    }


@router.post("/command", response_model=AgentCommandResponse)
async def process_natural_command(
    request: AgentCommandRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Multilingual Command Parser & Execution:
    Handles speech or typed business inputs ("2 kg sugar becha Ramesh ko 90 rs").
    """
    actor = current_user.get("name") or current_user.get("email") or current_user.get("uid") or "User"
    return await agent_planner.handle_user_command(
        text=request.text,
        lang=request.lang,
        actor=actor,
    )


@router.get("/approvals", response_model=List[ApprovalRequest])
def list_pending_approvals(current_user: dict = Depends(verify_firebase_token)):
    """
    List all tasks paused at the Approval Gate requiring human owner decision.
    """
    records = approval_gate.get_pending_approvals()
    return records


@router.post("/approvals/{task_id}/decision")
def decide_approval(
    task_id: str,
    decision: ApprovalDecision,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Approve or reject a sensitive money or external-send action.
    """
    actor = decision.decided_by or current_user.get("name") or "Owner"
    record = approval_gate.decide(
        task_id=task_id,
        approved=decision.approved,
        decided_by=actor,
        reason=decision.reason,
    )
    if not record:
        raise HTTPException(status_code=404, detail=f"Pending approval task '{task_id}' not found")
    return {"task_id": task_id, "status": record.status, "decided_by": record.decided_by}


@router.post("/forecast", response_model=ForecastResponse)
def get_demand_forecast(
    request: ForecastRequest = Body(...),
    current_user: dict = Depends(verify_firebase_token),
):
    """
    7-day sales and inventory forecast using Prophet / XGBoost logic.
    """
    return forecaster.forecast(product=request.product, days_ahead=request.days_ahead)


@router.post("/computer-use/gst-file", response_model=GSTFilingResponse)
async def run_computer_use_gst_filing(
    request: GSTFilingRequest,
    current_user: dict = Depends(verify_firebase_token),
):
    """
    Operates the mock GST Portal via Playwright browser automation and files GSTR-3B return.
    """
    cgst = round(request.tax_paid / 2, 2)
    sgst = round(request.tax_paid / 2, 2)

    result = await portal_bot.file_gstr3b(
        gstin=request.gstin,
        turnover=request.taxable_turnover,
        cgst=cgst,
        sgst=sgst,
    )

    from datetime import datetime
    return GSTFilingResponse(
        task_id="gst-" + result["arn"][-6:],
        arn=result["arn"],
        status=result["status"],
        return_period=request.return_period,
        message="GSTR-3B filed successfully by Playwright computer-use agent",
        filed_at=datetime.utcnow(),
    )
