"""
DarkGuard — ML Fallback Service
scikit-learn TF-IDF classifier for when Groq API is unavailable.
"""

import os
import logging
import pickle
import re
from typing import Optional

logger = logging.getLogger("darkguard.ml")

_model = None
_vectorizer = None

# Keyword-based fallback patterns (used when no trained model exists)
KEYWORD_PATTERNS = {
    "FAKE_URGENCY": [
        r"only \d+ left", r"limited time", r"hurry", r"expires? (in|soon)",
        r"countdown", r"act now", r"don't miss", r"last chance",
        r"selling fast", r"almost gone", r"few remaining",
        # Hindi
        r"केवल \d+ बचे", r"सीमित समय", r"जल्दी करें", r"अभी खरीदें",
        # Hinglish
        r"sirf \d+ bache", r"jaldi karo", r"limited stock",
    ],
    "HIDDEN_CHARGES": [
        r"service fee", r"processing fee", r"convenience fee",
        r"handling charge", r"additional charge", r"extra fee",
        r"₹\d+.*fee", r"\$\d+.*fee", r"added to (your )?cart",
        # Hindi
        r"सेवा शुल्क", r"अतिरिक्त शुल्क",
    ],
    "ROACH_MOTEL": [
        r"cancel.*difficult", r"unsubscribe.*call", r"contact.*cancel",
        r"cancellation fee", r"cannot cancel online",
        r"call (us |to )?cancel", r"write.*cancel",
    ],
    "TRICK_QUESTION": [
        r"don't not", r"uncheck.*don't", r"opt.?out.*receive",
        r"deselect.*if you don.?t",
    ],
    "COOKIE_MANIPULATION": [
        r"accept all", r"accept cookies", r"i agree",
        r"reject.*hidden", r"manage.*preferences",
    ],
    "CONFIRMSHAMING": [
        r"no thanks.*i (don.?t|hate|prefer not)",
        r"i.?ll pass on", r"i don.?t (want|need|like) (saving|discount|money)",
        r"no.*i.?d rather (pay|miss|lose)",
    ],
    "BAIT_SWITCH": [
        r"price changed", r"updated price", r"was .*now",
        r"original.*price.*\d+.*new.*\d+",
    ],
    "MISDIRECTION": [
        r"recommended", r"most popular", r"best (value|deal)",
        r"pre.?selected", r"default.*selected", r"already.*added",
    ],
}


def load_model() -> bool:
    """Try to load a trained model from disk."""
    global _model, _vectorizer
    model_path = os.path.join(os.path.dirname(__file__), "..", "ml", "model.pkl")
    vec_path = os.path.join(os.path.dirname(__file__), "..", "ml", "vectorizer.pkl")

    if os.path.exists(model_path) and os.path.exists(vec_path):
        try:
            with open(model_path, "rb") as f:
                _model = pickle.load(f)
            with open(vec_path, "rb") as f:
                _vectorizer = pickle.load(f)
            logger.info("ML model loaded successfully")
            return True
        except Exception as e:
            logger.error(f"Failed to load ML model: {e}")
    return False


async def classify_patterns(dom_text: str) -> dict:
    """
    Classify dark patterns using ML model or keyword fallback.
    Returns same format as Groq service.
    """
    # Try ML model first
    if _model is not None and _vectorizer is not None:
        return _classify_with_model(dom_text)

    # Fall back to keyword matching
    return _classify_with_keywords(dom_text)


def _classify_with_model(dom_text: str) -> dict:
    """Use trained scikit-learn model."""
    try:
        features = _vectorizer.transform([dom_text])
        prediction = _model.predict(features)
        probabilities = _model.predict_proba(features)

        detections = []
        for i, cls in enumerate(_model.classes_):
            prob = float(probabilities[0][i])
            if prob > 0.3:
                detections.append({
                    "pattern_type": cls,
                    "confidence_score": round(prob, 3),
                    "explanation": f"ML classifier detected potential {cls.replace('_', ' ').lower()} pattern.",
                    "text_snippet": dom_text[:200],
                })

        return {"detections": detections}
    except Exception as e:
        logger.error(f"ML classification failed: {e}")
        return _classify_with_keywords(dom_text)


def _classify_with_keywords(dom_text: str) -> dict:
    """Simple keyword/regex-based pattern detection."""
    text_lower = dom_text.lower()
    detections = []

    for pattern_type, patterns in KEYWORD_PATTERNS.items():
        matches = []
        for pattern in patterns:
            found = re.findall(pattern, text_lower, re.IGNORECASE)
            matches.extend(found)

        if matches:
            confidence = min(0.3 + (len(matches) * 0.1), 0.75)
            detections.append({
                "pattern_type": pattern_type,
                "confidence_score": round(confidence, 3),
                "explanation": f"Keyword match detected: found {len(matches)} indicator(s) for {pattern_type.replace('_', ' ').lower()}.",
                "text_snippet": matches[0] if matches else "",
            })

    return {"detections": detections}


# Try loading model on import
load_model()
