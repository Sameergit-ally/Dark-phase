"""
DarkGuard — Celery Application Configuration
"""

import os
from celery import Celery
from celery.schedules import crontab
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

celery_app = Celery(
    "darkguard",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=[
        "tasks.pdf_tasks",
        "tasks.digest_tasks",
        "tasks.audit_tasks",
    ],
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    task_soft_time_limit=300,   # 5 min soft limit
    task_time_limit=600,        # 10 min hard limit
)

# Celery Beat Schedule
celery_app.conf.beat_schedule = {
    "weekly-digest": {
        "task": "tasks.digest_tasks.send_weekly_digest",
        "schedule": crontab(
            hour=9, minute=0,
            day_of_week="sunday",
        ),
    },
    "weekly-ml-retrain": {
        "task": "tasks.retrain_tasks.retrain_model",
        "schedule": crontab(
            hour=3, minute=0,
            day_of_week="monday",
        ),
    },
}
