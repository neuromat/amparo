# ==========================================
# Stage 1: Build frontend
# ==========================================
FROM node:20-alpine AS frontend-build

WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install 
COPY frontend/ ./ 
RUN npm run build 

# ==========================================
# Stage 2: Python runtime
# ==========================================
FROM python:3.12-slim

WORKDIR /app

# Install system dependencies for psycopg2-binary
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app.py ./app.py

# Copy built frontend into Flask's static folder
COPY --from=frontend-build /app/frontend/dist ./static

# Create flask_session directory
RUN mkdir -p /app/flask_session

# Copy entrypoint
COPY entrypoint.sh ./entrypoint.sh
RUN chmod +x ./entrypoint.sh

EXPOSE 5000

ENTRYPOINT ["./entrypoint.sh"]
