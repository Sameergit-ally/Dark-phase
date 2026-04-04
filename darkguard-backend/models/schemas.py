"""
DarkGuard — Pydantic v2 Models (Schemas)
All request/response models for the FastAPI application.
"""

from __future__ import annotations
from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from uuid import UUID


# ─── Enums ────────────────────────────────────────────────

class PatternType(str, Enum):
    FAKE_URGENCY = "FAKE_URGENCY"
    HIDDEN_CHARGES = "HIDDEN_CHARGES"
    ROACH_MOTEL = "ROACH_MOTEL"
    TRICK_QUESTION = "TRICK_QUESTION"
    COOKIE_MANIPULATION = "COOKIE_MANIPULATION"
    CONFIRMSHAMING = "CONFIRMSHAMING"
    BAIT_SWITCH = "BAIT_SWITCH"
    MISDIRECTION = "MISDIRECTION"


class Grade(str, Enum):
    A = "A"
    B = "B"
    C = "C"
    D = "D"
    F = "F"


class ComplaintStatus(str, Enum):
    DRAFTED = "DRAFTED"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    RESOLVED = "RESOLVED"


class ReportStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"


class AuditStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"


# ─── Detection ────────────────────────────────────────────

class Detection(BaseModel):
    pattern_type: PatternType
    confidence_score: float = Field(ge=0.0, le=1.0)
    explanation: str = ""
    element_selector: Optional[str] = None
    text_snippet: Optional[str] = None
    language: str = "en"


class DetectionDB(Detection):
    id: UUID
    scan_id: UUID
    created_at: datetime


# ─── Analyze ──────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    url: str
    domain: str
    dom_text: str
    screenshot_base64: Optional[str] = None
    language_hint: str = "en"


class AnalyzeResponse(BaseModel):
    scan_id: UUID
    url: str
    domain: str
    grade: Grade
    patterns_found: int
    scan_duration_ms: int
    detections: list[Detection]
    cached: bool = False


# ─── Trust Score ──────────────────────────────────────────

class TrustScoreResponse(BaseModel):
    domain: str
    grade: Grade
    total_scans: int
    avg_confidence: float
    last_updated: datetime


class LeaderboardEntry(BaseModel):
    domain: str
    grade: Grade
    total_scans: int
    patterns_found: int
    avg_confidence: float


# ─── Complaints ──────────────────────────────────────────

class ComplaintCreateRequest(BaseModel):
    scan_id: UUID


class ComplaintResponse(BaseModel):
    id: UUID
    scan_id: Optional[UUID]
    status: ComplaintStatus
    pdf_url: Optional[str]
    created_at: datetime
    updated_at: datetime


# ─── Community ───────────────────────────────────────────

class CommunityReportRequest(BaseModel):
    url: str
    description: str
    pattern_type: PatternType


class CommunityReportResponse(BaseModel):
    id: UUID
    url: str
    description: str
    pattern_type: PatternType
    status: ReportStatus
    points_awarded: int
    created_at: datetime


class CommunityLeaderboardEntry(BaseModel):
    user_id: UUID
    full_name: Optional[str]
    darkguard_points: int


# ─── Audit ───────────────────────────────────────────────

class AuditStartRequest(BaseModel):
    url: str


class AuditJobResponse(BaseModel):
    id: UUID
    url: str
    status: AuditStatus
    pages_crawled: int
    report_url: Optional[str]
    created_at: datetime


# ─── User Preferences ───────────────────────────────────

class UserPreferences(BaseModel):
    full_name: Optional[str] = None
    digest_channel: str = "email"
    digest_language: str = "en"


class UserProfile(BaseModel):
    id: UUID
    full_name: Optional[str]
    plan: str
    darkguard_points: int
    digest_channel: str
    digest_language: str
    created_at: datetime


# ─── Generic ─────────────────────────────────────────────

class MessageResponse(BaseModel):
    message: str
    success: bool = True
