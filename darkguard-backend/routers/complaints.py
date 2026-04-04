"""
DarkGuard — Complaints Router
CCPA complaint generation and tracking.
"""

import logging
from fastapi import APIRouter, HTTPException, Request, Depends
from models.schemas import ComplaintCreateRequest, ComplaintResponse, ComplaintStatus
from services import supabase_service as db

logger = logging.getLogger("darkguard.complaints")
router = APIRouter(prefix="/api/v1", tags=["complaints"])


def require_auth(request: Request) -> str:
    """Extract user_id from request state (set by auth middleware)."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id


@router.post("/complaints/generate", response_model=ComplaintResponse)
async def generate_complaint(body: ComplaintCreateRequest, request: Request):
    """
    Generate a CCPA complaint for a scan.
    Triggers async PDF generation via Celery.
    """
    user_id = require_auth(request)

    try:
        complaint = await db.create_complaint(
            user_id=user_id,
            scan_id=str(body.scan_id),
        )
    except Exception as e:
        logger.error(f"Failed to create complaint: {e}")
        raise HTTPException(status_code=500, detail="Failed to create complaint")

    # Trigger async PDF generation
    try:
        from tasks.pdf_tasks import generate_complaint_pdf_task
        generate_complaint_pdf_task.delay(complaint["id"])
        logger.info(f"PDF generation queued for complaint {complaint['id']}")
    except Exception as e:
        logger.warning(f"Celery task dispatch failed (will retry): {e}")

    return ComplaintResponse(
        id=complaint["id"],
        scan_id=complaint.get("scan_id"),
        status=ComplaintStatus(complaint.get("status", "DRAFTED")),
        pdf_url=complaint.get("pdf_url"),
        created_at=complaint["created_at"],
        updated_at=complaint.get("updated_at", complaint["created_at"]),
    )


@router.get("/complaints")
async def list_complaints(request: Request):
    """List all complaints for the authenticated user."""
    user_id = require_auth(request)

    try:
        complaints = await db.get_user_complaints(user_id)
    except Exception as e:
        logger.error(f"Failed to fetch complaints: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch complaints")

    return {"complaints": complaints, "count": len(complaints)}


@router.get("/complaints/{complaint_id}", response_model=ComplaintResponse)
async def get_complaint(complaint_id: str, request: Request):
    """Get a specific complaint with details."""
    user_id = require_auth(request)

    try:
        complaint = await db.get_complaint(complaint_id)
    except Exception as e:
        logger.error(f"Failed to fetch complaint: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch complaint")

    if not complaint:
        raise HTTPException(status_code=404, detail="Complaint not found")

    return ComplaintResponse(
        id=complaint["id"],
        scan_id=complaint.get("scan_id"),
        status=ComplaintStatus(complaint.get("status", "DRAFTED")),
        pdf_url=complaint.get("pdf_url"),
        created_at=complaint["created_at"],
        updated_at=complaint.get("updated_at", complaint["created_at"]),
    )
