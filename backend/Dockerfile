# backend/Dockerfile
# Use a slim Python image for a smaller footprint
FROM python:3.11-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements file first to leverage Docker cache
# This means if requirements.txt doesn't change, this layer is reused
COPY backend/requirements.txt .

# Install Python dependencies
# Use --no-cache-dir to prevent pip from caching packages, further reducing image size
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code
# The source path is relative to the Docker build context (which will be the project root)
# The destination path is relative to the WORKDIR (/app)
COPY backend/app/ ./app/
COPY backend/.env.example ./.env.example # Copy .env.example for reference
# If you have a .env file you want to include in the image (e.g., for non-sensitive defaults)
# COPY backend/.env ./.env

# Expose the port FastAPI will run on
EXPOSE 8000

# Command to run the FastAPI application
# uvicorn main:app refers to main.py inside the /app directory, and the FastAPI app instance named 'app'
# --host 0.0.0.0 makes the server accessible from outside the container
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
