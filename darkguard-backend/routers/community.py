"""
DarkGuard — Community Router
Crowdsourced dark pattern reporting.
"""

import logging
from fastapi import APIRouter, HTTPException, Request, Query
from models.schemas import (
    CommunityReportRequest, CommunityReportResponse, ReportStatus, PatternType
)
from services import supabase_service as db

logger = logging.getLogger("darkguard.community")
router = APIRouter(prefix="/api/v1", tags=["community"])


def require_auth(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id


@router.post("/community/report", response_model=CommunityReportResponse)
async def submit_report(body: CommunityReportRequest, request: Request):
    """Submit a community dark pattern report."""
    user_id = require_auth(request)

    try:
        report = await db.create_community_report(
            user_id=user_id,
            url=body.url,
            description=body.description,
            pattern_type=body.pattern_type.value,
        )
    except Exception as e:
        logger.error(f"Failed to create report: {e}")
        raise HTTPException(status_code=500, detail="Failed to create report")

    return CommunityReportResponse(
        id=report["id"],
        url=report["url"],
        description=report["description"],
        pattern_type=PatternType(report["pattern_type"]),
        status=ReportStatus(report.get("status", "PENDING")),
        points_awarded=report.get("points_awarded", 0),
        created_at=report["created_at"],
    )


@router.get("/community/reports")
async def list_reports(
    status: str = Query(None),
    limit: int = Query(20, ge=1, le=100),
):
    """List community reports (public: approved only, admin: all)."""
    try:
        reports = await db.get_community_reports(status=status, limit=limit)
    except Exception as e:
        logger.error(f"Failed to fetch reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")

    return {"reports": reports, "count": len(reports)}


@router.get("/community/my-reports")
async def my_reports(request: Request):
    """Get current user's community reports."""
    user_id = require_auth(request)

    try:
        reports = await db.get_user_reports(user_id)
    except Exception as e:
        logger.error(f"Failed to fetch user reports: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch reports")

    return {"reports": reports, "count": len(reports)}


@router.post("/community/report/{report_id}/moderate")
async def moderate_report(
    report_id: str,
    action: str = Query(..., enum=["approve", "reject"]),
    request: Request = None,
):
    """Moderate a community report (admin only)."""
    # In production, check admin role
    status = "APPROVED" if action == "approve" else "REJECTED"
    points = 50 if action == "approve" else 0

    try:
        report = await db.update_community_report(report_id, status, points)

        # Award points if approved
        if action == "approve" and report.get("user_id"):
            await db.add_user_points(report["user_id"], points)

    except Exception as e:
        logger.error(f"Failed to moderate report: {e}")
        raise HTTPException(status_code=500, detail="Failed to moderate report")

    return {"message": f"Report {action}d", "report_id": report_id}


@router.get("/community/leaderboard")
async def community_leaderboard(limit: int = Query(20, ge=1, le=100)):
    """Get community leaderboard by DarkGuard Points."""
    try:
        entries = await db.get_community_leaderboard(limit=limit)
    except Exception as e:
        logger.error(f"Failed to fetch leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch leaderboard")

    return {"entries": entries, "count": len(entries)}
