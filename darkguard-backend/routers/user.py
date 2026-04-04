"""
DarkGuard — User Router
User profile and preferences management.
"""

import logging
from fastapi import APIRouter, HTTPException, Request
from models.schemas import UserPreferences, UserProfile
from services import supabase_service as db

logger = logging.getLogger("darkguard.user")
router = APIRouter(prefix="/api/v1", tags=["user"])


def require_auth(request: Request) -> str:
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user_id


@router.get("/user/preferences")
async def get_preferences(request: Request):
    """Get current user's profile and preferences."""
    user_id = require_auth(request)

    try:
        profile = await db.get_user_profile(user_id)
    except Exception as e:
        logger.error(f"Failed to get profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to get profile")

    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    return profile


@router.put("/user/preferences")
async def update_preferences(body: UserPreferences, request: Request):
    """Update user preferences."""
    user_id = require_auth(request)

    updates = body.model_dump(exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    try:
        profile = await db.update_user_profile(user_id, updates)
    except Exception as e:
        logger.error(f"Failed to update profile: {e}")
        raise HTTPException(status_code=500, detail="Failed to update profile")

    return profile


@router.get("/user/stats")
async def get_user_stats(request: Request):
    """Get aggregated user statistics."""
    user_id = require_auth(request)

    try:
        profile = await db.get_user_profile(user_id)
        scans = await db.get_user_scans(user_id, limit=1000)
        complaints = await db.get_user_complaints(user_id)
        reports = await db.get_user_reports(user_id)

        total_patterns = sum(s.get("patterns_found", 0) for s in scans)
        approved_reports = len([r for r in reports if r.get("status") == "APPROVED"])

        return {
            "total_scans": len(scans),
            "total_patterns_found": total_patterns,
            "total_complaints": len(complaints),
            "total_community_reports": len(reports),
            "approved_reports": approved_reports,
            "darkguard_points": profile.get("darkguard_points", 0) if profile else 0,
            "plan": profile.get("plan", "free") if profile else "free",
        }
    except Exception as e:
        logger.error(f"Failed to get stats: {e}")
        raise HTTPException(status_code=500, detail="Failed to get user stats")
