"""
DarkGuard — ML Retraining Celery Task
Weekly model retraining from approved detections.
"""

import logging
import asyncio
from tasks.celery_app import celery_app

logger = logging.getLogger("darkguard.tasks.retrain")


@celery_app.task(name="tasks.retrain_tasks.retrain_model")
def retrain_model():
    """Retrain the ML model with recent data. Runs weekly."""
    logger.info("Starting model retraining...")

    try:
        from ml.train import train_model
        train_model()
        logger.info("Model retraining complete")
        return {"status": "success"}
    except Exception as e:
        logger.error(f"Retraining failed: {e}")
        return {"status": "error", "message": str(e)}
