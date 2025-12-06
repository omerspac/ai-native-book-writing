from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.api import api_router

app = FastAPI(title="AI-Native Book Platform API")

# Configure CORS
# For development, we allow all origins. For production, you should restrict this.
origins = ["*"]

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
