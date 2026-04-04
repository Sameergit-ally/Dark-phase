"""
DarkGuard — Supabase Service
Wrapper around supabase-py for all database operations.
"""

import os
import logging
from typing import Optional
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("darkguard.supabase")

_client: Optional[Client] = None


def get_supabase() -> Client:
    """Get or create the Supabase client singleton."""
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
        if not url or not key:
            logger.warning("Supabase credentials not configured — using mock mode")
            raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set")
        _client = create_client(url, key)
    return _client


# ─── Scan Operations ─────────────────────────────────────

async def create_scan(user_id: Optional[str], url: str, domain: str,
                      patterns_found: int, scan_duration_ms: int) -> dict:
    """Create a new scan record."""
    data = {
        "url": url,
        "domain": domain,
        "patterns_found": patterns_found,
        "scan_duration_ms": scan_duration_ms,
    }
    if user_id:
        data["user_id"] = user_id

    result = get_supabase().table("scans").insert(data).execute()
    return result.data[0] if result.data else {}


async def get_user_scans(user_id: str, limit: int = 20, offset: int = 0) -> list[dict]:
    """Get scans for a user."""
    result = (
        get_supabase()
        .table("scans")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .range(offset, offset + limit - 1)
        .execute()
    )
    return result.data or []


async def get_cached_scan(url: str, max_age_hours: int = 1) -> Optional[dict]:
    """Check if we have a recent scan for this URL."""
    from datetime import timedelta
    cutoff = datetime.now(timezone.utc) - timedelta(hours=max_age_hours)
    result = (
        get_supabase()
        .table("scans")
        .select("*, detections(*)")
        .eq("url", url)
        .gte("created_at", cutoff.isoformat())
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    if result.data:
        return result.data[0]
    return None


# ─── Detection Operations ────────────────────────────────

async def create_detections(scan_id: str, detections: list[dict]) -> list[dict]:
    """Insert multiple detection records for a scan."""
    if not detections:
        return []
    records = []
    for d in detections:
        records.append({
            "scan_id": scan_id,
            "pattern_type": d.get("pattern_type", "MISDIRECTION"),
            "confidence_score": d.get("confidence_score", 0.0),
            "element_selector": d.get("element_selector"),
            "explanation": d.get("explanation", ""),
            "language": d.get("language", "en"),
        })
    result = get_supabase().table("detections").insert(records).execute()
    return result.data or []


async def get_detections_for_scan(scan_id: str) -> list[dict]:
    """Get all detections for a scan."""
    result = (
        get_supabase()
        .table("detections")
        .select("*")
        .eq("scan_id", scan_id)
        .execute()
    )
    return result.data or []


# ─── Trust Score Operations ──────────────────────────────

def calculate_grade(patterns_found: int) -> str:
    """Calculate domain grade from pattern count."""
    if patterns_found == 0:
        return "A"
    elif patterns_found <= 2:
        return "B"
    elif patterns_found <= 5:
        return "C"
    elif patterns_found <= 10:
        return "D"
    else:
        return "F"


async def upsert_trust_score(domain: str, patterns_found: int,
                              avg_confidence: float) -> dict:
    """Update or create trust score for a domain."""
    existing = (
        get_supabase()
        .table("trust_scores")
        .select("*")
        .eq("domain", domain)
        .limit(1)
        .execute()
    )

    grade = calculate_grade(patterns_found)

    if existing.data:
        old = existing.data[0]
        new_total = old["total_scans"] + 1
        new_avg = ((old["avg_confidence"] * old["total_scans"]) + avg_confidence) / new_total
        new_grade = calculate_grade(patterns_found)

        result = (
            get_supabase()
            .table("trust_scores")
            .update({
                "grade": new_grade,
                "total_scans": new_total,
                "avg_confidence": round(new_avg, 4),
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })
            .eq("domain", domain)
            .execute()
        )
    else:
        result = (
            get_supabase()
            .table("trust_scores")
            .insert({
                "domain": domain,
                "grade": grade,
                "total_scans": 1,
                "avg_confidence": round(avg_confidence, 4),
                "last_updated": datetime.now(timezone.utc).isoformat(),
            })
            .execute()
        )

    return result.data[0] if result.data else {"grade": grade}


async def get_trust_score(domain: str) -> Optional[dict]:
    """Get trust score for a domain."""
    result = (
        get_supabase()
        .table("trust_scores")
        .select("*")
        .eq("domain", domain)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


async def get_leaderboard(sort: str = "worst", limit: int = 20) -> list[dict]:
    """Get trust score leaderboard."""
    query = get_supabase().table("trust_scores").select("*")

    if sort == "worst":
        query = query.order("avg_confidence", desc=True)
    else:
        query = query.order("avg_confidence", desc=False)

    result = query.limit(limit).execute()
    return result.data or []


# ─── Complaint Operations ────────────────────────────────

async def create_complaint(user_id: str, scan_id: str) -> dict:
    """Create a new complaint."""
    result = (
        get_supabase()
        .table("complaints")
        .insert({
            "user_id": user_id,
            "scan_id": scan_id,
            "status": "DRAFTED",
        })
        .execute()
    )
    return result.data[0] if result.data else {}


async def get_user_complaints(user_id: str) -> list[dict]:
    """Get all complaints for a user."""
    result = (
        get_supabase()
        .table("complaints")
        .select("*, scans(url, domain, patterns_found)")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def update_complaint(complaint_id: str, updates: dict) -> dict:
    """Update a complaint record."""
    updates["updated_at"] = datetime.now(timezone.utc).isoformat()
    result = (
        get_supabase()
        .table("complaints")
        .update(updates)
        .eq("id", complaint_id)
        .execute()
    )
    return result.data[0] if result.data else {}


async def get_complaint(complaint_id: str) -> Optional[dict]:
    """Get a single complaint with scan details."""
    result = (
        get_supabase()
        .table("complaints")
        .select("*, scans(*, detections(*))")
        .eq("id", complaint_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


# ─── Community Report Operations ─────────────────────────

async def create_community_report(user_id: str, url: str, description: str,
                                   pattern_type: str) -> dict:
    """Create a new community report."""
    result = (
        get_supabase()
        .table("community_reports")
        .insert({
            "user_id": user_id,
            "url": url,
            "description": description,
            "pattern_type": pattern_type,
            "status": "PENDING",
        })
        .execute()
    )
    return result.data[0] if result.data else {}


async def get_community_reports(status: Optional[str] = None,
                                 limit: int = 20) -> list[dict]:
    """Get community reports, optionally filtered by status."""
    query = get_supabase().table("community_reports").select("*")
    if status:
        query = query.eq("status", status)
    result = query.order("created_at", desc=True).limit(limit).execute()
    return result.data or []


async def get_user_reports(user_id: str) -> list[dict]:
    """Get all reports by a user."""
    result = (
        get_supabase()
        .table("community_reports")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


async def update_community_report(report_id: str, status: str,
                                   points: int = 0) -> dict:
    """Update community report status and award points."""
    result = (
        get_supabase()
        .table("community_reports")
        .update({"status": status, "points_awarded": points})
        .eq("id", report_id)
        .execute()
    )
    return result.data[0] if result.data else {}


async def add_user_points(user_id: str, points: int) -> None:
    """Add DarkGuard points to a user profile."""
    profile = (
        get_supabase()
        .table("profiles")
        .select("darkguard_points")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    if profile.data:
        current = profile.data[0]["darkguard_points"]
        get_supabase().table("profiles").update(
            {"darkguard_points": current + points}
        ).eq("id", user_id).execute()


async def get_community_leaderboard(limit: int = 20) -> list[dict]:
    """Get community leaderboard by points."""
    result = (
        get_supabase()
        .table("profiles")
        .select("id, full_name, darkguard_points")
        .order("darkguard_points", desc=True)
        .limit(limit)
        .execute()
    )
    return result.data or []


# ─── Audit Job Operations ───────────────────────────────

async def create_audit_job(user_id: str, url: str) -> dict:
    """Create a new audit job."""
    result = (
        get_supabase()
        .table("audit_jobs")
        .insert({
            "user_id": user_id,
            "url": url,
            "status": "QUEUED",
        })
        .execute()
    )
    return result.data[0] if result.data else {}


async def get_audit_job(job_id: str) -> Optional[dict]:
    """Get audit job status."""
    result = (
        get_supabase()
        .table("audit_jobs")
        .select("*")
        .eq("id", job_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


async def update_audit_job(job_id: str, updates: dict) -> dict:
    """Update audit job."""
    result = (
        get_supabase()
        .table("audit_jobs")
        .update(updates)
        .eq("id", job_id)
        .execute()
    )
    return result.data[0] if result.data else {}


async def get_user_audit_jobs(user_id: str) -> list[dict]:
    """Get all audit jobs for a user."""
    result = (
        get_supabase()
        .table("audit_jobs")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return result.data or []


# ─── User Profile Operations ────────────────────────────

async def get_user_profile(user_id: str) -> Optional[dict]:
    """Get user profile."""
    result = (
        get_supabase()
        .table("profiles")
        .select("*")
        .eq("id", user_id)
        .limit(1)
        .execute()
    )
    return result.data[0] if result.data else None


async def update_user_profile(user_id: str, updates: dict) -> dict:
    """Update user profile."""
    result = (
        get_supabase()
        .table("profiles")
        .update(updates)
        .eq("id", user_id)
        .execute()
    )
    return result.data[0] if result.data else {}
