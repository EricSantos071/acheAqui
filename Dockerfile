# ── Stage 1: Base image ────────────────────────────────────────────────────────
# We use the official Python 3.12 slim image.
# "slim" means it's a minimal Linux with just Python — no unnecessary bloat.
FROM python:3.12-slim

# ── Stage 2: Set working directory ────────────────────────────────────────────
# This is where your code will live inside the container.
# Think of it as cd /app inside the container.
WORKDIR /app

# ── Stage 3: Install system dependencies ──────────────────────────────────────
# libpq-dev is required by psycopg to connect to PostgreSQL.
# gcc is required to compile some Python packages.
# We clean up apt cache after to keep the image small.
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# ── Stage 4: Install Python dependencies ──────────────────────────────────────
# We copy requirements.txt FIRST (before the rest of the code).
# Why? Docker caches each step. If your code changes but requirements don't,
# Docker skips reinstalling packages — much faster rebuilds.
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 5: Copy your application code ───────────────────────────────────────
# Now we copy everything else.
COPY . .
 
# ── Stage 6: Expose the port ───────────────────────────────────────────────────
# Tells Docker this container listens on port 8000.
# This doesn't publish the port — docker-compose does that.
EXPOSE 8000

# ── Stage 7: Run the app ───────────────────────────────────────────────────────
# This is the command that starts your FastAPI app.
# --host 0.0.0.0 means "accept connections from outside the container"
# (default 127.0.0.1 would only accept connections from inside)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# docker build -t the-name-of-the-image:version . (NEVER FORGET THE DOT AT THE END)