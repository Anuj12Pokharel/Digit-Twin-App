#!/bin/bash
# Run database migrations automatically
python -m alembic upgrade head

# Start the FastAPI application
uvicorn main:app --host 0.0.0.0 --port 8003
