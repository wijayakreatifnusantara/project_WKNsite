FROM python:3.11-slim

WORKDIR /app

# Install system dependencies needed for compiling C-extensions (like bcrypt)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency configuration files from the root
COPY pyproject.toml uv.lock ./

# Install uv for fast package installation and resolve dependencies system-wide
RUN pip install --no-cache-dir uv && \
    uv pip install --system --no-cache -r pyproject.toml

# Copy backend source code
COPY apps/server/ ./apps/server/

# Set working directory to apps/server where main.py and local imports reside
WORKDIR /app/apps/server

EXPOSE 8000

# Start Uvicorn server
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
