"""
NovaRescue AI - Root application entry point.

This file exists so that the Render start command
  gunicorn -k uvicorn.workers.UvicornWorker main:app
works from the project root directory.  All application logic lives inside
the `backend/` package; we add that directory to sys.path here and then
re-export the fully-configured FastAPI `app` object.
"""

import importlib.util
import os
import sys

# Make all backend modules importable (routes, agents, models, services, utils)
_backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

# Load backend/main.py via importlib to avoid a naming collision — both this
# file and the target are called "main.py".
_spec = importlib.util.spec_from_file_location(
    "backend_main",
    os.path.join(_backend_dir, "main.py"),
)
_module = importlib.util.module_from_spec(_spec)
sys.modules["backend_main"] = _module
_spec.loader.exec_module(_module)

# Re-export `app` so gunicorn/uvicorn can discover it as `main:app`
app = _module.app
