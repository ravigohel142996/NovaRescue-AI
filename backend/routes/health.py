"""
Health check routes.
"""

from fastapi import APIRouter
from utils.helpers import get_utc_timestamp

router = APIRouter()


@router.get("/health")
async def health_check():
    """Basic health check endpoint."""
    return {
        "status": "healthy",
        "service": "NovaRescue AI",
        "timestamp": get_utc_timestamp(),
    }


@router.get("/health/detailed")
async def detailed_health():
    """Detailed health check with component status."""
    import os

    simulation_mode = os.getenv("SIMULATION_MODE", "true").lower() == "true"

    components = {
        "api": "healthy",
        "nova_bedrock": "simulation" if simulation_mode else "connected",
        "s3": "simulation" if simulation_mode else "connected",
        "agents": {
            "disaster_agent": "ready",
            "medical_agent": "ready",
            "logistics_agent": "ready",
            "communication_agent": "ready",
        },
    }

    return {
        "status": "healthy",
        "simulation_mode": simulation_mode,
        "components": components,
        "timestamp": get_utc_timestamp(),
    }
