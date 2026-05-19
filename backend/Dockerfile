# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Set the working directory
WORKDIR /app

# Install system dependencies
# (gcc and python3-dev might be needed for building certain packages like chromadb/hnswlib)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    python3-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend codebase
COPY . .

# Expose the port the app runs on
EXPOSE 8003

# Make the start script executable
RUN chmod +x /app/start.sh

# Command to run the application (migrations + server)
CMD ["./start.sh"]
