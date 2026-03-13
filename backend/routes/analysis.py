"""
Analysis routes for NovaRescue AI.

Handles disaster analysis requests via:
- Text descriptions
- Image uploads
- Voice audio uploads
"""

import base64
import io
import os
from typing import Optional

from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from fastapi.responses import StreamingResponse

from agents.orchestrator import AgentOrchestrator
from models.request_models import TextAnalysisRequest
from services.s3_service import S3Service
from utils.logger import setup_logger
from utils.helpers import get_utc_timestamp

logger = setup_logger(__name__)
router = APIRouter()

SIMULATION_MODE = os.getenv("SIMULATION_MODE", "true").lower() == "true"

# Allowed image MIME types
ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/gif", "image/webp"}
MAX_IMAGE_SIZE_MB = 10


@router.post("/analyze/text")
async def analyze_text(request: TextAnalysisRequest):
    """
    Analyze a disaster from text description.

    Runs all four AI agents and returns a complete response plan.
    """
    logger.info("📥 Text analysis request received (simulation=%s)", request.simulation_mode)

    try:
        orchestrator = AgentOrchestrator(simulation_mode=request.simulation_mode)
        result = await orchestrator.orchestrate(
            description=request.description,
            location=request.location or "Unknown",
            input_type="text",
        )
        return result.model_dump()

    except Exception as exc:
        logger.error("Text analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/analyze/image")
async def analyze_image(
    image: UploadFile = File(..., description="Disaster scene image"),
    description: str = Form(default="", description="Optional text description"),
    location: str = Form(default="Unknown", description="Affected location"),
    simulation_mode: bool = Form(default=True, description="Run in simulation mode"),
):
    """
    Analyze a disaster from an uploaded image (optionally with text description).
    """
    # Validate file type
    if image.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image type: {image.content_type}. Allowed: {ALLOWED_IMAGE_TYPES}",
        )

    # Read and validate file size
    image_bytes = await image.read()
    size_mb = len(image_bytes) / (1024 * 1024)
    if size_mb > MAX_IMAGE_SIZE_MB:
        raise HTTPException(
            status_code=400,
            detail=f"Image too large: {size_mb:.1f}MB. Maximum: {MAX_IMAGE_SIZE_MB}MB",
        )

    logger.info(
        "📸 Image analysis request: %s (%.2fMB, simulation=%s)",
        image.filename,
        size_mb,
        simulation_mode,
    )

    # Upload to S3 (or simulate)
    s3_service = S3Service(simulation_mode=simulation_mode)
    upload_success, s3_key = s3_service.upload_file(
        file_bytes=image_bytes,
        filename=image.filename or "upload.jpg",
        content_type=image.content_type,
        folder="disaster-images",
    )

    if not upload_success and not simulation_mode:
        logger.warning("S3 upload failed, proceeding with analysis anyway")

    # Encode image for Nova multimodal
    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    # Build description from filename if not provided
    if not description.strip():
        description = f"Disaster scene image uploaded: {image.filename or 'image'}"

    try:
        orchestrator = AgentOrchestrator(simulation_mode=simulation_mode)
        result = await orchestrator.orchestrate(
            description=description,
            location=location,
            input_type="image",
            image_base64=image_base64,
            image_media_type=image.content_type,
        )
        response = result.model_dump()
        response["s3_key"] = s3_key
        return response

    except Exception as exc:
        logger.error("Image analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/analyze/voice")
async def analyze_voice(
    audio: UploadFile = File(..., description="Voice recording of disaster report"),
    location: str = Form(default="Unknown", description="Affected location"),
    simulation_mode: bool = Form(default=True, description="Run in simulation mode"),
):
    """
    Analyze a disaster from a voice recording.

    Note: In production, this would use Amazon Transcribe to convert
    speech to text, then process with Nova. In simulation mode,
    a standard description is used.
    """
    allowed_audio_types = {
        "audio/wav", "audio/wave", "audio/mpeg", "audio/mp3",
        "audio/ogg", "audio/webm", "audio/mp4",
    }

    if audio.content_type not in allowed_audio_types:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio type: {audio.content_type}",
        )

    audio_bytes = await audio.read()
    logger.info(
        "🎤 Voice analysis request: %s (simulation=%s)",
        audio.filename,
        simulation_mode,
    )

    # In production: use Amazon Transcribe here
    # For now, use placeholder description
    description = (
        "Voice report received: Emergency situation detected from audio recording. "
        "Multiple casualties reported. Infrastructure damage visible. "
        "Immediate assistance required."
    )

    try:
        orchestrator = AgentOrchestrator(simulation_mode=simulation_mode)
        result = await orchestrator.orchestrate(
            description=description,
            location=location,
            input_type="voice",
        )
        return result.model_dump()

    except Exception as exc:
        logger.error("Voice analysis failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.post("/report/download")
async def download_report(request: dict):
    """
    Generate and download a PDF incident report.

    Accepts the full analysis result and produces a formatted PDF.
    """
    try:
        from utils.pdf_generator import generate_incident_pdf

        incident_id = request.get("incident_id", "UNKNOWN")
        pdf_bytes = generate_incident_pdf(request)

        filename = f"NovaRescue-{incident_id}-{get_utc_timestamp()[:10]}.pdf"
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'},
        )
    except Exception as exc:
        logger.error("PDF generation failed: %s", exc)
        raise HTTPException(status_code=500, detail=str(exc)) from exc
