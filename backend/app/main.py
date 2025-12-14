import os
from pathlib import Path # New import
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.api import api_router
from backend.app.api.v1.endpoints.chat import router as chat_router # Keep this
from backend.app.api.v1.endpoints.chat import rag_pipeline # New import for global instance
from backend.app.core.config import settings

print("RAG_RETRIEVAL_LIMIT:", settings.RAG_RETRIEVAL_LIMIT)


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
app.include_router(chat_router) # The chat_router already points to the global rag_pipeline

@app.on_event("startup")
async def startup_event():
    print("Application startup: Ingesting book chapters...")
    docs_path = Path("frontend/my-book/docs/")
    
    # Ensure the docs directory exists
    if not docs_path.is_dir():
        print(f"Warning: Docs directory not found at {docs_path}. Creating dummy chapter for testing.")
        os.makedirs(docs_path, exist_ok=True)
        # Create a dummy chapter for initial testing if no docs exist
        dummy_chapter_path = docs_path / "chapter1.md"
        with open(dummy_chapter_path, "w", encoding="utf-8") as f:
            f.write("""---
id: chapter1
title: The Test Chapter
subtitle: A chapter for testing purposes
---

This is the content of the test chapter. It talks about AI and its applications. This sentence is about robotics. And this is about machine learning.""")
        print(f"Created dummy chapter at {dummy_chapter_path}")
        chapter_files = [dummy_chapter_path]
    else:
        chapter_files = sorted(list(docs_path.glob("*.md")))
        if not chapter_files:
            print(f"No markdown files found in {docs_path}. Creating dummy chapter for testing.")
            dummy_chapter_path = docs_path / "chapter1.md"
            with open(dummy_chapter_path, "w", encoding="utf-8") as f:
                f.write("""---
id: chapter1
title: The Test Chapter
subtitle: A chapter for testing purposes
---

This is the content of the test chapter. It talks about AI and its applications. This sentence is about robotics. And this is about machine learning.""")
            print(f"Created dummy chapter at {dummy_chapter_path}")
            chapter_files = [dummy_chapter_path]


    for chapter_file in chapter_files:
        rag_pipeline.ingest_chapter(str(chapter_file))
    print("Book chapters ingested successfully.")


@app.get("/", tags=["Root"])
def read_root():
    return {"message": "Welcome to the AI-Native Book Platform API"}