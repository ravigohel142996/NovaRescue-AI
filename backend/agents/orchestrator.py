"""
Agent Orchestrator.

Coordinates the execution of all disaster response agents,
manages async execution, and aggregates results.
"""

import asyncio
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Optional

from agents.disaster_agent import DisasterAgent
from agents.medical_agent import MedicalAgent
from agents.logistics_agent import LogisticsAgent
from agents.communication_agent import CommunicationAgent
from models.response_models import AgentResult, FullAnalysisResponse
from utils.logger import setup_logger
from utils.helpers import generate_incident_id, get_utc_timestamp

logger = setup_logger(__name__)

# Thread pool for running synchronous agent calls in async context
_executor = ThreadPoolExecutor(max_workers=4)


def _build_voice_summary(
    disaster: dict,
    medical: dict,
    logistics: dict,
    communication: dict,
) -> str:
    """
    Build a voice-ready summary of the emergency response plan.

    Args:
        disaster: Disaster analysis output
        medical: Medical plan output
        logistics: Logistics plan output
        communication: Communication plan output

    Returns:
        Plain text summary for voice synthesis
    """
    disaster_type = disaster.get("disaster_type", "Unknown")
    severity = disaster.get("severity_level", "unknown").upper()
    risk_score = disaster.get("risk_score", 0)
    affected_pop = disaster.get("estimated_affected_population", 0)
    ambulances = medical.get("required_ambulances", 0)
    doctors = medical.get("required_doctors", 0)
    evac_time = logistics.get("estimated_evacuation_time_hours", 0)
    alert_level = communication.get("alert_level", "unknown").upper()

    summary = (
        f"NovaRescue AI Emergency Response Summary. "
        f"Incident Type: {disaster_type}. "
        f"Severity Level: {severity}. "
        f"Risk Score: {risk_score:.0f} out of 100. "
        f"Estimated affected population: {affected_pop:,} people. "
        f"Alert Level: {alert_level}. "
        f"Medical resources required: {ambulances} ambulances and {doctors} doctors. "
        f"Estimated evacuation time: {evac_time:.1f} hours. "
        f"All emergency teams are being deployed immediately. "
        f"Follow official evacuation routes and report to designated safe zones. "
        f"This is an automated emergency response broadcast from NovaRescue AI."
    )
    return summary


class AgentOrchestrator:
    """
    Orchestrates all disaster response agents.

    Runs agents concurrently when possible and aggregates
    results into a unified response plan.
    """

    def __init__(self, simulation_mode: bool = True):
        self.simulation_mode = simulation_mode
        self.disaster_agent = DisasterAgent(simulation_mode=simulation_mode)
        self.medical_agent = MedicalAgent(simulation_mode=simulation_mode)
        self.logistics_agent = LogisticsAgent(simulation_mode=simulation_mode)
        self.communication_agent = CommunicationAgent(simulation_mode=simulation_mode)

    def _run_disaster_agent(
        self,
        description: str,
        location: str,
        image_base64: Optional[str],
        image_media_type: str,
    ) -> tuple[dict, AgentResult]:
        """Execute disaster agent and return result + metadata."""
        start = time.time()
        try:
            output = self.disaster_agent.analyze(
                description=description,
                location=location,
                image_base64=image_base64,
                image_media_type=image_media_type,
            )
            return output, AgentResult(
                agent_name="Disaster Analysis Agent",
                status="completed",
                execution_time_ms=int((time.time() - start) * 1000),
                output=output,
            )
        except Exception as exc:
            return {}, AgentResult(
                agent_name="Disaster Analysis Agent",
                status="failed",
                execution_time_ms=int((time.time() - start) * 1000),
                error=str(exc),
            )

    def _run_medical_agent(self, disaster_analysis: dict) -> tuple[dict, AgentResult]:
        """Execute medical agent and return result + metadata."""
        start = time.time()
        try:
            output = self.medical_agent.plan(disaster_analysis)
            return output, AgentResult(
                agent_name="Medical Resource Planning Agent",
                status="completed",
                execution_time_ms=int((time.time() - start) * 1000),
                output=output,
            )
        except Exception as exc:
            return {}, AgentResult(
                agent_name="Medical Resource Planning Agent",
                status="failed",
                execution_time_ms=int((time.time() - start) * 1000),
                error=str(exc),
            )

    def _run_logistics_agent(self, disaster_analysis: dict) -> tuple[dict, AgentResult]:
        """Execute logistics agent and return result + metadata."""
        start = time.time()
        try:
            output = self.logistics_agent.plan(disaster_analysis)
            return output, AgentResult(
                agent_name="Logistics & Evacuation Agent",
                status="completed",
                execution_time_ms=int((time.time() - start) * 1000),
                output=output,
            )
        except Exception as exc:
            return {}, AgentResult(
                agent_name="Logistics & Evacuation Agent",
                status="failed",
                execution_time_ms=int((time.time() - start) * 1000),
                error=str(exc),
            )

    def _run_communication_agent(self, disaster_analysis: dict) -> tuple[dict, AgentResult]:
        """Execute communication agent and return result + metadata."""
        start = time.time()
        try:
            output = self.communication_agent.generate(disaster_analysis)
            return output, AgentResult(
                agent_name="Communication & Alert Agent",
                status="completed",
                execution_time_ms=int((time.time() - start) * 1000),
                output=output,
            )
        except Exception as exc:
            return {}, AgentResult(
                agent_name="Communication & Alert Agent",
                status="failed",
                execution_time_ms=int((time.time() - start) * 1000),
                error=str(exc),
            )

    async def orchestrate(
        self,
        description: str,
        location: str = "Unknown",
        input_type: str = "text",
        image_base64: Optional[str] = None,
        image_media_type: str = "image/jpeg",
    ) -> FullAnalysisResponse:
        """
        Orchestrate all agents asynchronously.

        Flow:
        1. Run DisasterAgent first (all other agents depend on it)
        2. Run Medical, Logistics, Communication agents concurrently

        Args:
            description: Disaster description text
            location: Affected location
            input_type: Input modality (text/image/voice)
            image_base64: Optional base64 image
            image_media_type: Image MIME type

        Returns:
            Complete FullAnalysisResponse
        """
        total_start = time.time()
        incident_id = generate_incident_id()
        timestamp = get_utc_timestamp()

        logger.info(
            "🚨 Orchestrating response for incident %s (simulation=%s)",
            incident_id,
            self.simulation_mode,
        )

        loop = asyncio.get_event_loop()

        # Step 1: Run disaster analysis (required by all other agents)
        disaster_output, disaster_result = await loop.run_in_executor(
            _executor,
            lambda: self._run_disaster_agent(
                description, location, image_base64, image_media_type
            ),
        )

        # Step 2: Run remaining agents concurrently
        (medical_output, medical_result), (logistics_output, logistics_result), (comm_output, comm_result) = (
            await asyncio.gather(
                loop.run_in_executor(
                    _executor, lambda: self._run_medical_agent(disaster_output)
                ),
                loop.run_in_executor(
                    _executor, lambda: self._run_logistics_agent(disaster_output)
                ),
                loop.run_in_executor(
                    _executor, lambda: self._run_communication_agent(disaster_output)
                ),
            )
        )

        # Build voice summary
        voice_summary = _build_voice_summary(
            disaster_output, medical_output, logistics_output, comm_output
        )

        total_ms = int((time.time() - total_start) * 1000)
        logger.info("🏁 Orchestration complete for %s in %dms", incident_id, total_ms)

        return FullAnalysisResponse(
            incident_id=incident_id,
            timestamp=timestamp,
            input_type=input_type,
            simulation_mode=self.simulation_mode,
            disaster_analysis=disaster_output,
            medical_plan=medical_output,
            logistics_plan=logistics_output,
            communication_plan=comm_output,
            agent_results=[
                disaster_result,
                medical_result,
                logistics_result,
                comm_result,
            ],
            voice_summary=voice_summary,
            total_execution_time_ms=total_ms,
            status="completed",
        )
