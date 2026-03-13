"""
Pydantic models for API requests.
"""

from typing import Optional
from pydantic import BaseModel, Field


class TextAnalysisRequest(BaseModel):
    """Request model for text-based disaster analysis."""

    description: str = Field(
        ...,
        min_length=10,
        max_length=5000,
        description="Emergency situation description",
    )
    location: Optional[str] = Field(
        default=None,
        description="Affected location or area",
    )
    reporter_name: Optional[str] = Field(
        default=None,
        description="Name of the person reporting",
    )
    simulation_mode: bool = Field(
        default=True,
        description="Run in simulation mode without AWS credentials",
    )


class VoiceAnalysisRequest(BaseModel):
    """Request model for voice-based analysis (base64 audio)."""

    audio_base64: str = Field(..., description="Base64-encoded audio data")
    audio_format: str = Field(default="wav", description="Audio format (wav, mp3)")
    simulation_mode: bool = Field(default=True)


class IncidentReportRequest(BaseModel):
    """Request model for generating an incident report."""

    incident_id: str = Field(..., description="Incident ID to generate report for")
    analysis_result: dict = Field(..., description="Full analysis result payload")
