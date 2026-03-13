"""
Disaster Analysis Agent.

Uses Amazon Nova to analyze disaster type, severity, and risk levels
from text descriptions, images, or voice transcripts.
"""

import time
from typing import Optional

from services.nova_wrapper import NovaWrapper
from utils.logger import setup_logger
from utils.helpers import clamp

logger = setup_logger(__name__)

SIMULATION_DATA = {
    "disaster_type": "Flood",
    "severity_level": "high",
    "confidence_score": 87.5,
    "risk_score": 78.0,
    "affected_area_km2": 45.3,
    "estimated_affected_population": 12500,
    "geo_risk_assessment": (
        "Severe flooding affecting low-lying residential and commercial areas. "
        "River overflow detected within 2km radius. Critical infrastructure at risk."
    ),
    "infrastructure_damage_estimate": (
        "Roads: 60% impassable. Bridges: 2 structurally compromised. "
        "Power grid: Partial outage affecting ~8,000 households. "
        "Water treatment: Operating at reduced capacity."
    ),
    "casualty_probability": (
        "High probability of casualties in Zone A (northern residential). "
        "Moderate risk in Zone B (commercial district). "
        "Elderly and mobility-impaired residents at highest risk."
    ),
}


class DisasterAgent:
    """
    Disaster Analysis Agent.

    Analyzes incoming disaster reports and produces structured
    severity assessment and risk evaluation.
    """

    SYSTEM_PROMPT = """You are an expert disaster analysis AI for emergency response.
Your role is to analyze disaster reports and produce precise, structured assessments.
Always respond with valid JSON only. Be accurate and conservative in your estimates."""

    ANALYSIS_PROMPT = """Analyze the following emergency situation report and return a JSON object with:
- disaster_type: (string) Type of disaster (e.g., Flood, Fire, Earthquake, Landslide, Hurricane, etc.)
- severity_level: (string) One of: low, medium, high, critical
- confidence_score: (float 0-100) Confidence in this analysis
- risk_score: (float 0-100) Overall risk score
- affected_area_km2: (float) Estimated affected area in square kilometers
- estimated_affected_population: (int) Estimated number of people affected
- geo_risk_assessment: (string) Detailed geographic risk assessment
- infrastructure_damage_estimate: (string) Infrastructure damage assessment
- casualty_probability: (string) Casualty probability assessment

Emergency Report:
{description}

Location: {location}

Respond ONLY with a valid JSON object. No other text."""

    def __init__(self, simulation_mode: bool = True):
        self.nova = NovaWrapper(simulation_mode=simulation_mode)
        self.simulation_mode = simulation_mode

    def analyze(
        self,
        description: str,
        location: str = "Unknown",
        image_base64: Optional[str] = None,
        image_media_type: str = "image/jpeg",
    ) -> dict:
        """
        Analyze a disaster report.

        Args:
            description: Text description of the disaster
            location: Affected location
            image_base64: Optional base64-encoded image
            image_media_type: MIME type of image

        Returns:
            Structured disaster analysis dict
        """
        start_time = time.time()
        logger.info("🔍 DisasterAgent: Analyzing disaster report (simulation=%s)", self.simulation_mode)

        if self.simulation_mode:
            time.sleep(0.3)  # Simulate processing time
            result = dict(SIMULATION_DATA)
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info("✅ DisasterAgent completed in %dms (simulation)", elapsed_ms)
            return result

        prompt = self.ANALYSIS_PROMPT.format(
            description=description,
            location=location,
        )

        try:
            result = self.nova.invoke_and_parse_json(
                prompt=prompt,
                image_base64=image_base64,
                image_media_type=image_media_type,
            )

            # Validate and clamp numeric fields
            if "confidence_score" in result:
                result["confidence_score"] = clamp(float(result["confidence_score"]), 0, 100)
            if "risk_score" in result:
                result["risk_score"] = clamp(float(result["risk_score"]), 0, 100)

            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info("✅ DisasterAgent completed in %dms", elapsed_ms)
            return result

        except Exception as exc:
            logger.error("DisasterAgent failed: %s", exc)
            return {"error": str(exc), **SIMULATION_DATA}
