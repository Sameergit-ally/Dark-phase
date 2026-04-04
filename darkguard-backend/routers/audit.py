"""
DarkGuard — Audit Router
B2B Self-Audit Portal endpoints.
"""

import logging
from fastapi import APIRouter, HTTPException, Request, Query
from models.schemas import AuditStartRequest, AuditJobResponse, AuditStatus
from services import supabase_service as db

logger = logging.getLogger("darkguard.audit")
router = APIRouter(prefix="/api/v1", tags=["audit"])


def require_auth(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id


@router.post("/audit/start", response_model=AuditJobResponse)
async def start_audit(body: AuditStartRequest, request: Request):
    """Start a B2B audit crawl for a website."""
    user_id = require_auth(request)

    try:
        job = await db.create_audit_job(user_id=user_id, url=body.url)
    except Exception as e:
        logger.error(f"Failed to create audit job: {e}")
        raise HTTPException(status_code=500, detail="Failed to create audit job")

    # Trigger async crawl task
    try:
        from tasks.audit_tasks import run_audit_task
        run_audit_task.delay(job["id"])
        logger.info(f"Audit task queued for job {job['id']}")
    except Exception as e:
        logger.warning(f"Celery task dispatch failed: {e}")

    return AuditJobResponse(
        id=job["id"],
        url=job["url"],
        status=AuditStatus(job.get("status", "QUEUED")),
        pages_crawled=job.get("pages_crawled", 0),
        report_url=job.get("report_url"),
        created_at=job["created_at"],
    )


@router.get("/audit/{job_id}/status", response_model=AuditJobResponse)
async def get_audit_status(job_id: str, request: Request):
    """Check audit job status."""
    try:
        job = await db.get_audit_job(job_id)
    except Exception as e:
        logger.error(f"Failed to get audit job: {e}")
        raise HTTPException(status_code=500, detail="Failed to get audit status")

    if not job:
        raise HTTPException(status_code=404, detail="Audit job not found")

    return AuditJobResponse(
        id=job["id"],
        url=job["url"],
        status=AuditStatus(job.get("status", "QUEUED")),
        pages_crawled=job.get("pages_crawled", 0),
        report_url=job.get("report_url"),
        created_at=job["created_at"],
    )


@router.get("/audit/jobs")
async def list_audit_jobs(request: Request):
    """List user's audit jobs."""
    user_id = require_auth(request)

    try:
        jobs = await db.get_user_audit_jobs(user_id)
    except Exception as e:
        logger.error(f"Failed to fetch audit jobs: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch audit jobs")

    return {"jobs": jobs, "count": len(jobs)}
