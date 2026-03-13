"""
Medical Resource Planning Agent.

Calculates medical resource requirements based on disaster analysis output.
"""

import time
from typing import Optional

from services.nova_wrapper import NovaWrapper
from utils.logger import setup_logger

logger = setup_logger(__name__)

SIMULATION_DATA = {
    "required_ambulances": 24,
    "required_doctors": 48,
    "required_nurses": 96,
    "emergency_units": 8,
    "blood_units_needed": 350,
    "hospital_distribution": [
        {"hospital": "Central Emergency Hospital", "beds_allocated": 120, "distance_km": 3.2, "status": "receiving"},
        {"hospital": "North Medical Center", "beds_allocated": 80, "distance_km": 7.1, "status": "receiving"},
        {"hospital": "South General Hospital", "beds_allocated": 60, "distance_km": 9.4, "status": "on_standby"},
        {"hospital": "Riverside Trauma Center", "beds_allocated": 45, "distance_km": 12.8, "status": "on_standby"},
    ],
    "triage_zones": [
        "Zone A - Critical (Red): Immediate life-threatening injuries",
        "Zone B - Urgent (Yellow): Serious but stable conditions",
        "Zone C - Minor (Green): Walking wounded",
        "Zone D - Deceased (Black): Recovery and identification",
    ],
    "medical_priority": (
        "Prioritize evacuation of ICU patients, dialysis patients, and oxygen-dependent individuals. "
        "Deploy trauma teams to Zone A immediately. Establish field hospital at Sports Complex."
    ),
}


class MedicalAgent:
    """
    Medical Resource Planning Agent.

    Calculates and plans medical resources needed for disaster response.
    """

    ANALYSIS_PROMPT = """Based on the following disaster analysis, calculate medical resource requirements.
Return a JSON object with:
- required_ambulances: (int) Number of ambulances needed
- required_doctors: (int) Number of doctors needed
- required_nurses: (int) Number of nurses needed
- emergency_units: (int) Number of emergency response units
- blood_units_needed: (int) Blood units required
- hospital_distribution: (array) List of objects with: hospital, beds_allocated, distance_km, status
- triage_zones: (array) List of triage zone descriptions
- medical_priority: (string) Medical response priority statement

Disaster Analysis:
{disaster_analysis}

Respond ONLY with a valid JSON object. No other text."""

    def __init__(self, simulation_mode: bool = True):
        self.nova = NovaWrapper(simulation_mode=simulation_mode)
        self.simulation_mode = simulation_mode

    def plan(self, disaster_analysis: dict) -> dict:
        """
        Generate medical resource plan.

        Args:
            disaster_analysis: Output from DisasterAgent

        Returns:
            Medical resource plan dict
        """
        start_time = time.time()
        logger.info("🏥 MedicalAgent: Planning medical resources (simulation=%s)", self.simulation_mode)

        if self.simulation_mode:
            time.sleep(0.4)
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info("✅ MedicalAgent completed in %dms (simulation)", elapsed_ms)
            return dict(SIMULATION_DATA)

        import json
        prompt = self.ANALYSIS_PROMPT.format(
            disaster_analysis=json.dumps(disaster_analysis, indent=2)
        )

        try:
            result = self.nova.invoke_and_parse_json(prompt=prompt)
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info("✅ MedicalAgent completed in %dms", elapsed_ms)
            return result
        except Exception as exc:
            logger.error("MedicalAgent failed: %s", exc)
            return {"error": str(exc), **SIMULATION_DATA}
