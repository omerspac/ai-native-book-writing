#!/bin/bash

# This is a placeholder deployment script.
# Adapt it to your specific deployment environment (e.g., Render, Railway, AWS, GCP).

echo "--- Starting full project deployment process ---"

# --- Frontend Deployment (Docusaurus to GitHub Pages) ---
echo "Building Docusaurus frontend..."
cd frontend/my-book
npm install # Ensure all dependencies are installed
npm run build # Build the static site
echo "Deploying Docusaurus frontend to GitHub Pages..."
# This step requires gh-pages to be configured and authenticated
# For example: GIT_USER=your-github-username npm run deploy
# This script will NOT execute the actual gh-pages deployment automatically.
# You need to manually run `npm run deploy` inside `frontend/my-book` after configuring GIT_USER
# and ensuring your GitHub token/permissions are set up.
echo "Frontend deployment instructions: Run 'cd frontend/my-book && GIT_USER=your-github-username npm run deploy'"
cd ../.. # Go back to project root

# --- Backend Deployment (FastAPI with Docker) ---
echo "Building and deploying FastAPI backend with Docker..."

# For local testing with Docker Compose:
echo "For local Docker Compose setup, run: 'docker-compose up --build -d'"
echo "This will start FastAPI, Qdrant, and PostgreSQL locally."

# For cloud deployment (e.g., Render, Railway, any VPS):
echo "For cloud deployment, you would typically:"
echo "1. Build your Docker image: 'docker build -t your-registry/your-image-name:latest -f backend/Dockerfile .'"
echo "2. Push your Docker image to a registry (e.g., Docker Hub, GitHub Container Registry)."
echo "3. Deploy the image to your chosen cloud platform (e.g., Kubernetes, App Platform, ECS, Railway, Render)."
echo ""
echo "Make sure your .env file (or environment variables in your deployment platform) are correctly configured for:"
echo "  - NEON_DB_URL (for PostgreSQL connection)"
echo "  - QDRANT_URL, QDRANT_API_KEY (for Qdrant connection)"
echo "  - GOOGLE_API_KEY (for Gemini embeddings/LLM)"
echo "  - SECRET_KEY (for JWT token signing)"

echo "--- Deployment process overview complete ---"
echo "Remember to manually execute deployment steps as per your setup."
