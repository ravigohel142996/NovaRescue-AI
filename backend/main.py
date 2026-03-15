"""
NovaRescue AI - FastAPI Application Entry Point
Production-ready emergency disaster response system
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from routes.analysis import router as analysis_router
from routes.health import router as health_router
from utils.logger import setup_logger

# Initialize logger
logger = setup_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup/shutdown."""
    logger.info("🚀 NovaRescue AI Backend starting up...")
    logger.info("🤖 Multi-Agent Emergency Response System initialized")
    yield
    logger.info("🛑 NovaRescue AI Backend shutting down...")


# Initialize FastAPI application
app = FastAPI(
    title="NovaRescue AI",
    description="Multi-Agent Emergency Disaster Response System powered by Amazon Nova",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

# CORS middleware configuration.
# Default to "*" so the Vercel-deployed frontend can reach the Render backend
# without requiring any extra environment variable configuration.
cors_origins_str = os.getenv("CORS_ORIGINS", "*")
cors_origins = [origin.strip() for origin in cors_origins_str.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    # allow_credentials must be False when using the "*" wildcard origin
    # (required by the CORS spec and enforced by Starlette).
    allow_credentials=cors_origins_str.strip() != "*",
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router, prefix="/api", tags=["Health"])
app.include_router(analysis_router, prefix="/api", tags=["Analysis"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "service": "NovaRescue AI",
        "version": "1.0.0",
        "status": "operational",
        "description": "Multi-Agent Emergency Disaster Response System",
    }


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("APP_HOST", "0.0.0.0")
    port = int(os.getenv("APP_PORT", "8000"))
    log_level = os.getenv("LOG_LEVEL", "info").lower()

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        log_level=log_level,
        reload=os.getenv("APP_ENV", "development") == "development",
    )
