from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.api import api_router # Import the new API router

app = FastAPI(title="AI-Native Book Platform API")

# Configure CORS
origins = [
    "http://localhost:3000",  # Allow your Docusaurus development server
    "http://localhost:8000",  # Allow your backend itself (if served from same origin in some cases)
    "https://OmerGov.github.io", # Your GitHub Pages domain
    # Add your deployed frontend URL here when available
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1") # Include the new API router

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Native Book Platform API"}
