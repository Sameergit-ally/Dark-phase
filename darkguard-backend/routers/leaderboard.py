"""
DarkGuard — Leaderboard Router
Public leaderboard for domain trust scores.
"""

import logging
from fastapi import APIRouter, Query
from services import supabase_service as db

logger = logging.getLogger("darkguard.leaderboard")
router = APIRouter(prefix="/api/v1", tags=["leaderboard"])


@router.get("/leaderboard")
async def get_leaderboard(
    sort: str = Query("worst", enum=["worst", "best"]),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Public leaderboard — no auth required.
    Sorted by worst (most dark patterns) or best (cleanest sites).
    """
    try:
        entries = await db.get_leaderboard(sort=sort, limit=limit)
    except Exception as e:
        logger.error(f"Failed to get leaderboard: {e}")
        return {"sort": sort, "count": 0, "entries": []}

    return {
        "sort": sort,
        "count": len(entries),
        "entries": entries,
    }
