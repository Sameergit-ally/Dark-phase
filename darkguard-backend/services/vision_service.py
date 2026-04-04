"""
DarkGuard — Google Vision OCR Service
Extracts text from screenshots using Google Cloud Vision API.
"""

import os
import base64
import logging
import httpx
from typing import Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("darkguard.vision")

VISION_API_URL = "https://vision.googleapis.com/v1/images:annotate"


async def extract_text_from_screenshot(screenshot_base64: str) -> Optional[str]:
    """
    Send a base64-encoded screenshot to Google Vision API for OCR.
    Returns extracted text or None on failure.
    """
    api_key = os.getenv("GOOGLE_VISION_API_KEY", "")
    if not api_key:
        logger.warning("Google Vision API key not configured — skipping OCR")
        return None

    try:
        payload = {
            "requests": [
                {
                    "image": {"content": screenshot_base64},
                    "features": [{"type": "TEXT_DETECTION", "maxResults": 1}],
                }
            ]
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{VISION_API_URL}?key={api_key}",
                json=payload,
            )
            response.raise_for_status()
            data = response.json()

        responses = data.get("responses", [])
        if responses and "fullTextAnnotation" in responses[0]:
            return responses[0]["fullTextAnnotation"]["text"]

        return None

    except Exception as e:
        logger.error(f"Vision API error: {e}")
        return None
