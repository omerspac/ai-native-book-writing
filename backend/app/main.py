from fastapi import FastAPI
from app.api import rag_api, auth_api, profile_api # Import profile_api

app = FastAPI(title="AI-Native Book Platform API")

app.include_router(rag_api.router, prefix="/api")
app.include_router(auth_api.router, prefix="/api") # Include auth_api router
app.include_router(profile_api.router, prefix="/api") # Include profile_api router

@app.get("/")
def read_root():
    return {"message": "Welcome to the AI-Native Book Platform API"}
