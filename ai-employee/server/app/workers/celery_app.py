from celery import Celery
from app.core.config import REDIS_URL

celery = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["app.workers.tasks"],
)

celery.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    beat_schedule={
        "check-low-stock-every-30-minutes": {
            "task": "tasks.check_low_stock_periodic",
            "schedule": 1800.0,
        },
        "nightly-demand-forecast": {
            "task": "tasks.run_nightly_demand_forecast",
            "schedule": 86400.0,
        },
    },
)
