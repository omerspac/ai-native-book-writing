import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.api import api_router
from backend.app.api.v1.endpoints.chat import router as chat_router

app = FastAPI(
    title="AI-Native Book Platform API",
    description="API for the AI-Native Book Platform.",
    version="1.0.0",
)

# --- Production-Ready CORS Configuration ---
# In production, set the FRONTEND_URL environment variable 
# (e.g., your GitHub Pages URL like https://<user>.github.io).
origins = [
    "http://localhost:3000", # Default for local Docusaurus dev
]
prod_origin = os.environ.get("FRONTEND_URL")
if prod_origin:
    origins.append(prod_origin)

# For development flexibility, you might add a wildcard,
# but it's more secure to be specific.
if os.environ.get("ENV") == "development":
    origins.append("*") # Or specific dev URLs

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")
app.include_router(chat_router)

@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the AI-Native Book Platform API"}