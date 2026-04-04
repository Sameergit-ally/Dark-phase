"""
DarkGuard — Groq AI Service
All LLM calls for dark pattern detection using Groq API.
"""

import os
import json
import logging
from typing import Optional
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("darkguard.groq")

_client: Optional[Groq] = None

SYSTEM_PROMPT = """You are DarkGuard, an AI specialized in detecting dark patterns in website UI/UX.
Analyze the provided DOM text and identify deceptive design patterns.

Pattern types you MUST detect:
- FAKE_URGENCY: Fake countdown timers, "Only N left", "Limited time offer" with no real deadline
- HIDDEN_CHARGES: Hidden fees, surprise costs revealed at checkout, pre-selected paid add-ons
- ROACH_MOTEL: Easy to subscribe but very hard to cancel or unsubscribe
- TRICK_QUESTION: Confusing double negatives, opt-out phrased as opt-in
- COOKIE_MANIPULATION: Dark patterns in cookie consent (forced accept, hidden reject, pre-checked tracking)
- CONFIRMSHAMING: Guilting user into a choice ("No thanks, I don't want to save money")
- BAIT_SWITCH: Advertising one thing then substituting another
- MISDIRECTION: Visual tricks that draw attention away from important info

Respond ONLY with valid JSON. No markdown, no explanation outside JSON.

Format:
{
  "detections": [
    {
      "pattern_type": "FAKE_URGENCY",
      "confidence_score": 0.85,
      "explanation": "Plain language 1-2 sentence explanation of the deceptive pattern",
      "text_snippet": "exact text from DOM that triggered this detection"
    }
  ]
}

If no dark patterns are found, respond with: {"detections": []}

IMPORTANT:
- confidence_score must be between 0.0 and 1.0
- Support multilingual detection: Hindi (Devanagari), Hinglish, Tamil, Bengali, Telugu, Marathi
- Examples: "केवल 2 बचे हैं" → FAKE_URGENCY, "सीमित समय ऑफर" → FAKE_URGENCY
- "अभी खरीदें नहीं तो छूट जाएगा" → CONFIRMSHAMING
- Only flag genuine dark patterns, not legitimate UI elements
- Be precise — false positives erode user trust
"""


def get_groq_client() -> Groq:
    """Get or create the Groq client singleton."""
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise ValueError("GROQ_API_KEY must be set")
        _client = Groq(api_key=api_key)
    return _client


async def analyze_dark_patterns(
    dom_text: str,
    url: str,
    language_hint: str = "en"
) -> dict:
    """
    Analyze DOM text for dark patterns using Groq LLM.
    Returns dict with 'detections' list.
    """
    try:
        client = get_groq_client()

        # Truncate DOM text to avoid token limits
        truncated_text = dom_text[:8000]

        user_message = f"""URL: {url}
Language hint: {language_hint}
DOM Text:
{truncated_text}"""

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.1,
            max_tokens=2000,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content
        if not content:
            logger.warning("Empty response from Groq")
            return {"detections": []}

        result = json.loads(content)

        # Validate and clean detections
        if "detections" not in result:
            result = {"detections": []}

        valid_types = {
            "FAKE_URGENCY", "HIDDEN_CHARGES", "ROACH_MOTEL",
            "TRICK_QUESTION", "COOKIE_MANIPULATION", "CONFIRMSHAMING",
            "BAIT_SWITCH", "MISDIRECTION"
        }

        cleaned = []
        for d in result.get("detections", []):
            if d.get("pattern_type") in valid_types:
                cleaned.append({
                    "pattern_type": d["pattern_type"],
                    "confidence_score": max(0.0, min(1.0, float(d.get("confidence_score", 0.5)))),
                    "explanation": str(d.get("explanation", "")),
                    "text_snippet": str(d.get("text_snippet", "")),
                })

        return {"detections": cleaned}

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Groq response as JSON: {e}")
        return {"detections": []}
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise  # Let caller handle fallback


async def analyze_with_fallback(
    dom_text: str,
    url: str,
    language_hint: str = "en"
) -> dict:
    """
    Try Groq first, fall back to ML classifier if Groq fails.
    """
    try:
        return await analyze_dark_patterns(dom_text, url, language_hint)
    except Exception as e:
        logger.warning(f"Groq failed, falling back to ML classifier: {e}")
        from services.ml_service import classify_patterns
        return await classify_patterns(dom_text)
