"""Compatibility entrypoint for platform deploys (Render/Gunicorn).

This module exposes `app` at repo root so commands such as:
`gunicorn -k uvicorn.workers.UvicornWorker main:app`
continue to work, while running the full backend implementation from
`backend/main.py`.
"""

from __future__ import annotations

import os
import sys

# Ensure backend package-local imports like `from routes...` resolve when
# this root module is imported by process managers.
BACKEND_DIR = os.path.join(os.path.dirname(__file__), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from backend.main import app  # noqa: E402


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
