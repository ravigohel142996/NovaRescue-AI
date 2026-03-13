"""
Helper utilities for NovaRescue AI.
"""

import base64
import hashlib
import json
import uuid
from datetime import datetime, timezone
from typing import Any


def generate_incident_id() -> str:
    """Generate a unique incident ID."""
    return f"INC-{uuid.uuid4().hex[:8].upper()}"


def get_utc_timestamp() -> str:
    """Return current UTC timestamp in ISO 8601 format."""
    return datetime.now(timezone.utc).isoformat()


def encode_image_base64(image_bytes: bytes) -> str:
    """Encode image bytes to base64 string."""
    return base64.b64encode(image_bytes).decode("utf-8")


def sanitize_json_output(raw: str) -> dict:
    """
    Attempt to parse JSON from model output, stripping markdown fences if needed.

    Args:
        raw: Raw string output from the model

    Returns:
        Parsed dict, or empty dict on failure
    """
    # Strip markdown code blocks
    cleaned = raw.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        # Remove first and last lines (``` fences)
        cleaned = "\n".join(lines[1:-1]) if len(lines) > 2 else cleaned

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Attempt to find JSON object within the string
        start = cleaned.find("{")
        end = cleaned.rfind("}") + 1
        if start != -1 and end > start:
            try:
                return json.loads(cleaned[start:end])
            except json.JSONDecodeError:
                pass
    return {}


def severity_to_color(severity: str) -> str:
    """Map severity level to a display color name."""
    mapping = {
        "low": "green",
        "medium": "yellow",
        "high": "orange",
        "critical": "red",
    }
    return mapping.get(severity.lower(), "gray")


def clamp(value: float, min_val: float, max_val: float) -> float:
    """Clamp a value between min and max."""
    return max(min_val, min(max_val, value))
