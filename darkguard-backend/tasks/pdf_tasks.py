"""
DarkGuard — PDF Generation Celery Task
Generates CCPA complaint PDFs asynchronously.
"""

import logging
import asyncio
from tasks.celery_app import celery_app

logger = logging.getLogger("darkguard.tasks.pdf")


@celery_app.task(
    name="tasks.pdf_tasks.generate_complaint_pdf_task",
    bind=True,
    max_retries=3,
    default_retry_delay=30,
)
def generate_complaint_pdf_task(self, complaint_id: str):
    """
    Generate a CCPA complaint PDF for the given complaint.
    Runs as a Celery background task.
    """
    logger.info(f"Starting PDF generation for complaint {complaint_id}")

    try:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        result = loop.run_until_complete(_generate_pdf(complaint_id))
        loop.close()
        return result
    except Exception as exc:
        logger.error(f"PDF generation failed: {exc}")
        raise self.retry(exc=exc)


async def _generate_pdf(complaint_id: str) -> dict:
    """Internal async PDF generation logic."""
    from services import supabase_service as db
    from services.pdf_service import generate_complaint_pdf, upload_pdf_to_storage

    # Get complaint details
    complaint = await db.get_complaint(complaint_id)
    if not complaint:
        raise ValueError(f"Complaint {complaint_id} not found")

    # Get user profile
    user_profile = await db.get_user_profile(complaint["user_id"])
    user_name = user_profile.get("full_name", "DarkGuard User") if user_profile else "DarkGuard User"

    # Get scan and detections
    scan = complaint.get("scans", {})
    detections = scan.get("detections", []) if scan else []

    # Generate PDF
    pdf_bytes = await generate_complaint_pdf(
        user_name=user_name,
        user_email="",  # From auth profile in production
        website_url=scan.get("url", "Unknown"),
        domain=scan.get("domain", "Unknown"),
        detections=detections,
    )

    # Upload to Supabase Storage
    filename = f"complaint_{complaint_id}.pdf"
    pdf_url = await upload_pdf_to_storage(pdf_bytes, filename)

    # Update complaint record
    await db.update_complaint(complaint_id, {
        "status": "SUBMITTED",
        "pdf_url": pdf_url,
    })

    logger.info(f"PDF generated and uploaded for complaint {complaint_id}")
    return {"complaint_id": complaint_id, "pdf_url": pdf_url}
