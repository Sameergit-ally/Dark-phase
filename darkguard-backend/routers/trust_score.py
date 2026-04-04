"""
DarkGuard — Trust Score & Leaderboard Router
"""

import logging
import json
import os
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from models.schemas import TrustScoreResponse, LeaderboardEntry, Grade
from services import supabase_service as db

logger = logging.getLogger("darkguard.trust_score")
router = APIRouter(prefix="/api/v1", tags=["trust-score"])

# Simple in-memory cache (Redis in production)
_cache: dict = {}


@router.get("/trust-score/{domain}", response_model=TrustScoreResponse)
async def get_trust_score(domain: str):
    """Get the DarkGuard trust score for a domain."""
    # Check cache
    cache_key = f"trust:{domain}"
    if cache_key in _cache:
        cached = _cache[cache_key]
        import time
        if time.time() - cached["_ts"] < 3600:  # 1hr TTL
            return TrustScoreResponse(**{k: v for k, v in cached.items() if k != "_ts"})

    try:
        score = await db.get_trust_score(domain)
    except Exception as e:
        logger.error(f"Failed to get trust score: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch trust score")

    if not score:
        raise HTTPException(status_code=404, detail=f"No trust score found for {domain}")

    response = TrustScoreResponse(
        domain=score["domain"],
        grade=Grade(score["grade"]),
        total_scans=score["total_scans"],
        avg_confidence=score["avg_confidence"],
        last_updated=score["last_updated"],
    )

    # Update cache
    import time
    _cache[cache_key] = {**response.model_dump(), "_ts": time.time()}

    return response


@router.get("/leaderboard")
async def get_leaderboard(
    sort: str = Query("worst", enum=["worst", "best"]),
    limit: int = Query(20, ge=1, le=100),
):
    """Get the domain trust score leaderboard."""
    try:
        entries = await db.get_leaderboard(sort=sort, limit=limit)
    except Exception as e:
        logger.error(f"Failed to get leaderboard: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch leaderboard")

    return {
        "sort": sort,
        "count": len(entries),
        "entries": entries,
    }
