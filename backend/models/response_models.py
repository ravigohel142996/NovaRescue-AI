"""
Pydantic models for API responses and agent outputs.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Agent output models
# ---------------------------------------------------------------------------


class DisasterAnalysis(BaseModel):
    """Output from the Disaster Analysis Agent."""

    disaster_type: str
    severity_level: str  # low | medium | high | critical
    confidence_score: float  # 0-100
    risk_score: float  # 0-100
    affected_area_km2: Optional[float] = None
    estimated_affected_population: Optional[int] = None
    geo_risk_assessment: str
    infrastructure_damage_estimate: str
    casualty_probability: str


class MedicalResourcePlan(BaseModel):
    """Output from the Medical Resource Planning Agent."""

    required_ambulances: int
    required_doctors: int
    required_nurses: int
    emergency_units: int
    blood_units_needed: int
    hospital_distribution: List[Dict[str, Any]]
    triage_zones: List[str]
    medical_priority: str


class LogisticsPlan(BaseModel):
    """Output from the Logistics & Evacuation Agent."""

    evacuation_zones: List[Dict[str, Any]]
    rescue_priority_map: List[Dict[str, Any]]
    supply_distribution_plan: List[Dict[str, Any]]
    required_vehicles: int
    required_personnel: int
    estimated_evacuation_time_hours: float
    safe_zones: List[str]


class CommunicationPlan(BaseModel):
    """Output from the Communication & Authority Alert Agent."""

    authority_alert_message: str
    public_warning_message: str
    sms_broadcast_content: str
    emergency_contacts: List[Dict[str, str]]
    media_statement: str
    alert_level: str  # green | yellow | orange | red


# ---------------------------------------------------------------------------
# Orchestration response
# ---------------------------------------------------------------------------


class AgentResult(BaseModel):
    """Result wrapper for a single agent execution."""

    agent_name: str
    status: str  # running | completed | failed
    execution_time_ms: int
    output: Optional[Dict[str, Any]] = None
    error: Optional[str] = None


class FullAnalysisResponse(BaseModel):
    """Complete response from the multi-agent orchestration."""

    incident_id: str
    timestamp: str
    input_type: str  # text | image | voice
    simulation_mode: bool

    # Agent results
    disaster_analysis: Optional[Dict[str, Any]] = None
    medical_plan: Optional[Dict[str, Any]] = None
    logistics_plan: Optional[Dict[str, Any]] = None
    communication_plan: Optional[Dict[str, Any]] = None

    # Agent execution metadata
    agent_results: List[AgentResult] = Field(default_factory=list)

    # Summary
    voice_summary: Optional[str] = None
    total_execution_time_ms: int = 0
    status: str = "completed"
