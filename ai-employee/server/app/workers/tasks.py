from datetime import datetime
from app.workers.celery_app import celery
from app.core.database import SessionLocal, Stock, AuditLogRecord
from app.modules.agent.planner.planner import agent_planner
from app.modules.forecasting.forecaster import forecaster
from app.modules.computer_use.portal_bot import portal_bot

@celery.task(name="tasks.check_low_stock_periodic")
def check_low_stock_periodic():
    """
    Autonomous heartbeat job: Runs after dashboard closes.
    Checks inventory levels across all store items and triggers autonomous agent if stock is low.
    """
    db = SessionLocal()
    triggered_products = []
    try:
        stocks = db.query(Stock).all()
        for item in stocks:
            if item.current_quantity <= item.min_threshold:
                task_id = agent_planner.trigger_low_stock_plan(
                    product=item.product,
                    current_qty=item.current_quantity,
                    db=db,
                )
                triggered_products.append({"product": item.product, "task_id": task_id})

        return {"status": "ok", "low_stock_alerts_triggered": triggered_products}
    finally:
        db.close()


@celery.task(name="tasks.run_nightly_demand_forecast")
def run_nightly_demand_forecast():
    """
    Periodic job: updates 7-day sales and inventory predictions.
    """
    res = forecaster.forecast(product="Sugar", days_ahead=7)
    return {"status": "ok", "forecast": res.model_dump()}


@celery.task(name="tasks.run_async_gst_filing")
def run_async_gst_filing(gstin: str, turnover: float, cgst: float, sgst: float):
    """
    Runs computer use GST portal filing in Celery worker.
    """
    import asyncio
    return asyncio.run(portal_bot.file_gstr3b(gstin=gstin, turnover=turnover, cgst=cgst, sgst=sgst))
