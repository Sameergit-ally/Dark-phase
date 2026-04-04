"""
DarkGuard — Analyze Router
POST /api/v1/analyze — Core dark pattern detection endpoint.
"""

import time
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Request
from models.schemas import (
    AnalyzeRequest, AnalyzeResponse, Detection, Grade, PatternType
)
from services.groq_service import analyze_with_fallback
from services.vision_service import extract_text_from_screenshot
from services import supabase_service as db

logger = logging.getLogger("darkguard.analyze")
router = APIRouter(prefix="/api/v1", tags=["analyze"])


@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_page(request: Request, body: AnalyzeRequest):
    """
    Analyze a web page for dark patterns.
    Accepts DOM text and optional screenshot for OCR.
    """
    start_time = time.time()

    # Check cache first (same URL within 1 hour)
    try:
        cached = await db.get_cached_scan(body.url)
        if cached and cached.get("detections"):
            elapsed_ms = int((time.time() - start_time) * 1000)
            detections_list = cached.get("detections", [])

            return AnalyzeResponse(
                scan_id=cached["id"],
                url=body.url,
                domain=body.domain,
                grade=Grade(db.calculate_grade(len(detections_list))),
                patterns_found=len(detections_list),
                scan_duration_ms=elapsed_ms,
                detections=[
                    Detection(
                        pattern_type=PatternType(d["pattern_type"]),
                        confidence_score=d["confidence_score"],
                        explanation=d.get("explanation", ""),
                        element_selector=d.get("element_selector"),
                        language=d.get("language", "en"),
                    )
                    for d in detections_list
                ],
                cached=True,
            )
    except Exception as e:
        logger.warning(f"Cache check failed: {e}")

    # Combine DOM text with OCR text if screenshot provided
    full_text = body.dom_text
    if body.screenshot_base64:
        try:
            ocr_text = await extract_text_from_screenshot(body.screenshot_base64)
            if ocr_text:
                full_text = f"{body.dom_text}\n\n--- OCR Text ---\n{ocr_text}"
        except Exception as e:
            logger.warning(f"OCR failed, continuing with DOM text only: {e}")

    # Run AI analysis (Groq → ML fallback)
    try:
        result = await analyze_with_fallback(
            dom_text=full_text,
            url=body.url,
            language_hint=body.language_hint,
        )
    except Exception as e:
        logger.error(f"All analysis methods failed: {e}")
        result = {"detections": []}

    raw_detections = result.get("detections", [])
    elapsed_ms = int((time.time() - start_time) * 1000)

    # Get user_id from auth (optional — extension might not have auth)
    user_id = getattr(request.state, "user_id", None)

    # Save scan to database
    try:
        avg_conf = (
            sum(d.get("confidence_score", 0) for d in raw_detections) / len(raw_detections)
            if raw_detections else 0.0
        )

        scan = await db.create_scan(
            user_id=user_id,
            url=body.url,
            domain=body.domain,
            patterns_found=len(raw_detections),
            scan_duration_ms=elapsed_ms,
        )
        scan_id = scan["id"]

        # Save detections
        if raw_detections:
            await db.create_detections(scan_id, raw_detections)

        # Update trust score
        await db.upsert_trust_score(
            domain=body.domain,
            patterns_found=len(raw_detections),
            avg_confidence=avg_conf,
        )

    except Exception as e:
        logger.error(f"Database save failed: {e}")
        # Generate a fake scan_id for response
        import uuid
        scan_id = str(uuid.uuid4())

    # Build response
    grade = Grade(db.calculate_grade(len(raw_detections)))
    detections = [
        Detection(
            pattern_type=PatternType(d["pattern_type"]),
            confidence_score=d["confidence_score"],
            explanation=d.get("explanation", ""),
            text_snippet=d.get("text_snippet"),
            language=body.language_hint,
        )
        for d in raw_detections
        if d.get("pattern_type") in PatternType.__members__
    ]

    return AnalyzeResponse(
        scan_id=scan_id,
        url=body.url,
        domain=body.domain,
        grade=grade,
        patterns_found=len(detections),
        scan_duration_ms=elapsed_ms,
        detections=detections,
        cached=False,
    )
