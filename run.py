"""
Entry point for running the Digit Twin backend.

Usage (from the project root  c:\\Users\\hp\\Desktop\\anuj):
    uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
"""
import os
from dotenv import load_dotenv

# Load .env from the backend directory before anything else
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))

# Re-export the FastAPI app so uvicorn can find it via  backend.main:app
from backend.main import app  # noqa: F401
