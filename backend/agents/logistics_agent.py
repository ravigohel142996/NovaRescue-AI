"""
Logistics & Evacuation Agent.

Plans evacuation routes, rescue priorities, and supply distribution
based on disaster analysis.
"""

import time

from services.nova_wrapper import NovaWrapper
from utils.logger import setup_logger

logger = setup_logger(__name__)

SIMULATION_DATA = {
    "evacuation_zones": [
        {
            "zone_id": "EV-001",
            "name": "North Residential District",
            "priority": "immediate",
            "population": 3500,
            "route": "Via Highway 7 North to Safe Zone Alpha",
            "status": "evacuating",
        },
        {
            "zone_id": "EV-002",
            "name": "River Valley Neighborhood",
            "priority": "critical",
            "population": 2800,
            "route": "Via Bridge 3 (if passable) or boat transport",
            "status": "in_progress",
        },
        {
            "zone_id": "EV-003",
            "name": "Industrial Zone",
            "priority": "high",
            "population": 1200,
            "route": "Via Eastern Ring Road to Safe Zone Beta",
            "status": "standby",
        },
        {
            "zone_id": "EV-004",
            "name": "Central Business District",
            "priority": "medium",
            "population": 5000,
            "route": "Shelter-in-place until water recedes",
            "status": "monitoring",
        },
    ],
    "rescue_priority_map": [
        {"priority": 1, "location": "23 River Street Apartment Complex", "reason": "Trapped residents - 6th floor", "team_assigned": "Rescue Team Alpha"},
        {"priority": 2, "location": "Riverside Senior Care Home", "reason": "120 elderly residents, limited mobility", "team_assigned": "Rescue Team Beta"},
        {"priority": 3, "location": "Valley Elementary School", "reason": "Building structurally compromised", "team_assigned": "Rescue Team Gamma"},
        {"priority": 4, "location": "Water Treatment Plant", "reason": "Critical infrastructure protection", "team_assigned": "Rescue Team Delta"},
    ],
    "supply_distribution_plan": [
        {"item": "Drinking Water", "quantity": "50,000 liters", "distribution_point": "Sports Complex", "priority": "critical"},
        {"item": "Food Rations", "quantity": "15,000 packages", "distribution_point": "Community Center", "priority": "high"},
        {"item": "Medical Supplies", "quantity": "500 kits", "distribution_point": "Central Hospital Annex", "priority": "critical"},
        {"item": "Rescue Boats", "quantity": "35 units", "distribution_point": "Marina Dock", "priority": "immediate"},
        {"item": "Temporary Shelters", "quantity": "800 units", "distribution_point": "City Park", "priority": "high"},
    ],
    "required_vehicles": 145,
    "required_personnel": 620,
    "estimated_evacuation_time_hours": 18.5,
    "safe_zones": [
        "Safe Zone Alpha - University Sports Complex (capacity: 5,000)",
        "Safe Zone Beta - National Convention Center (capacity: 8,000)",
        "Safe Zone Gamma - Hill Top School (capacity: 2,500)",
    ],
}


class LogisticsAgent:
    """
    Logistics & Evacuation Planning Agent.

    Plans evacuation routes, rescue operations, and supply distribution.
    """

    ANALYSIS_PROMPT = """Based on the following disaster analysis, create a comprehensive logistics and evacuation plan.
Return a JSON object with:
- evacuation_zones: (array) List of objects with: zone_id, name, priority, population, route, status
- rescue_priority_map: (array) List of objects with: priority, location, reason, team_assigned
- supply_distribution_plan: (array) List of objects with: item, quantity, distribution_point, priority
- required_vehicles: (int) Total vehicles needed
- required_personnel: (int) Total rescue personnel needed
- estimated_evacuation_time_hours: (float) Hours to complete evacuation
- safe_zones: (array) List of safe zone descriptions with capacity

Disaster Analysis:
{disaster_analysis}

Respond ONLY with a valid JSON object. No other text."""

    def __init__(self, simulation_mode: bool = True):
        self.nova = NovaWrapper(simulation_mode=simulation_mode)
        self.simulation_mode = simulation_mode

    def plan(self, disaster_analysis: dict) -> dict:
        """
        Generate logistics and evacuation plan.

        Args:
            disaster_analysis: Output from DisasterAgent

        Returns:
            Logistics plan dict
        """
        start_time = time.time()
        logger.info("🚛 LogisticsAgent: Planning logistics (simulation=%s)", self.simulation_mode)

        if self.simulation_mode:
            time.sleep(0.5)
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info("✅ LogisticsAgent completed in %dms (simulation)", elapsed_ms)
            return dict(SIMULATION_DATA)

        import json
        prompt = self.ANALYSIS_PROMPT.format(
            disaster_analysis=json.dumps(disaster_analysis, indent=2)
        )

        try:
            result = self.nova.invoke_and_parse_json(prompt=prompt)
            elapsed_ms = int((time.time() - start_time) * 1000)
            logger.info("✅ LogisticsAgent completed in %dms", elapsed_ms)
            return result
        except Exception as exc:
            logger.error("LogisticsAgent failed: %s", exc)
            return {"error": str(exc), **SIMULATION_DATA}
