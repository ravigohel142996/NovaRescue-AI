"""
Communication & Authority Alert Agent.

Generates alert messages for authorities, public warnings,
SMS broadcasts, and media statements.
"""

import time

from services.nova_wrapper import NovaWrapper
from utils.logger import setup_logger

logger = setup_logger(__name__)

SIMULATION_DATA = {
    "authority_alert_message": (
        "PRIORITY ALERT - LEVEL RED | INCIDENT: INC-FLOOD-001 | "
        "TIME: Immediate Action Required | "
        "Severe flooding confirmed in Northern and River Valley Districts. "
        "Estimated 12,500 residents at immediate risk. "
        "Request immediate deployment of: 24 ambulances, 8 emergency response units, "
        "35 rescue boats, 145 vehicles. "
        "Establish Incident Command at City Emergency Center. "
        "Coordinate with National Guard for aerial support. "
        "All available personnel to report to designated staging areas immediately."
    ),
    "public_warning_message": (
        "⚠️ EMERGENCY FLOOD WARNING ⚠️ "
        "Severe flooding is occurring in your area. "
        "If you are in the Northern or River Valley District: "
        "EVACUATE IMMEDIATELY via designated routes. "
        "Do NOT attempt to cross flooded roads or bridges. "
        "Bring essential medications, documents, and 3 days of supplies. "
        "Report to Safe Zone Alpha (Sports Complex) or Safe Zone Beta (Convention Center). "
        "Emergency hotline: 1-800-RESCUE-1 | Follow official instructions only."
    ),
    "sms_broadcast_content": (
        "EMERGENCY: Severe flood warning. Evacuate N & River Valley Districts NOW. "
        "Go to Sports Complex or Convention Center. Do not cross flood waters. "
        "Call 1-800-RESCUE-1"
    ),
    "emergency_contacts": [
        {"role": "Incident Commander", "name": "Emergency Operations Center", "phone": "1-800-RESCUE-1"},
        {"role": "Police Emergency", "name": "City Police Department", "phone": "911"},
        {"role": "Fire & Rescue", "name": "Metropolitan Fire Service", "phone": "1-800-FIRE-911"},
        {"role": "Medical Emergency", "name": "Emergency Medical Services", "phone": "1-800-MED-HELP"},
        {"role": "Utility Emergency", "name": "City Power & Water Authority", "phone": "1-800-UTIL-911"},
    ],
    "media_statement": (
        "The City Emergency Management Office has declared a Level Red Emergency "
        "in response to severe flooding affecting the Northern and River Valley Districts. "
        "Emergency response operations are underway with full deployment of rescue teams, "
        "medical personnel, and evacuation resources. Residents in affected areas are urged "
        "to follow official evacuation orders immediately. A press briefing will be held at "
        "City Hall at 18:00 hours. For updates, visit the official city emergency portal."
    ),
    "alert_level": "red",
}


class CommunicationAgent:
    """
    Communication & Authority Alert Agent.

    Generates all public and authority communications for disaster response.
    """

    ANALYSIS_PROMPT = """Based on the following disaster analysis, generate emergency communications.
Return a JSON object with:
- authority_alert_message: (string) Detailed alert for emergency authorities
- public_warning_message: (string) Public-facing warning message
- sms_broadcast_content: (string) Short SMS message (max 160 chars)
- emergency_contacts: (array) List of objects with: role, name, phone
- media_statement: (string) Official media/press statement
- alert_level: (string) One of: green, yellow, orange, red

Disaster Analysis:
{disaster_analysis}

Respond ONLY with a valid JSON object. No other text."""

    def __init__(self, simulation_mode: bool = True):
        self.nova = NovaWrapper(simulation_mode=simulation_mode)
        self.simulation_mode = simulation_mode

    def generate(self, disaster_analysis: dict) -> dict:
        """
        Generate communication plan.

        Args:
            disaster_analysis: Output from DisasterAgent

        Returns:
            Communication plan dict
        """
        start_time = time.time()
        logger.info("📢 CommunicationAgent: Generating alerts (simulation=%s)", self.simulation_mode)

        if self.simulation_mode:
            time.sleep(0.35)
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info("✅ CommunicationAgent completed in %dms (simulation)", elapsed_ms)
            return dict(SIMULATION_DATA)

        import json
        prompt = self.ANALYSIS_PROMPT.format(
            disaster_analysis=json.dumps(disaster_analysis, indent=2)
        )

        try:
            result = self.nova.invoke_and_parse_json(prompt=prompt)
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info("✅ CommunicationAgent completed in %dms", elapsed_ms)
            return result
        except Exception as exc:
            logger.error("CommunicationAgent failed: %s", exc)
            return {"error": str(exc), **SIMULATION_DATA}
