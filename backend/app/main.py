from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # Import CORSMiddleware
from app.api import rag_api, auth_api, profile_api # Import profile_api

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

app.include_router(rag_api.router, prefix="/api")
app.include_router(auth_api.router, prefix="/api") # Include auth_api router
app.include_router(profile_api.router, prefix="/api") # Include profile_api router

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Native Book Platform API"}
