# Modified according to SPEC: The user's prompt (pgvector)
import asyncio
import os
from backend.app.rag.rag_pipeline import RAGPipeline

async def main():
    """
    Ingests all Markdown documents from the frontend/my-book/docs directory
    into the RAG pipeline for embedding and storage in PostgreSQL.
    """
    print("Starting document ingestion process...")
    rag_pipeline = RAGPipeline()
    
    docs_dir = "frontend/my-book/docs"
    
    if not os.path.exists(docs_dir):
        print(f"Error: Document directory '{docs_dir}' not found.")
        return

    markdown_files = [f for f in os.listdir(docs_dir) if f.endswith(".md")]
    
    if not markdown_files:
        print(f"No Markdown files found in '{docs_dir}'.")
        return

    for filename in markdown_files:
        file_path = os.path.join(docs_dir, filename)
        print(f"Ingesting {file_path}...")
        await rag_pipeline.ingest_chapter(file_path)
    
    print("Document ingestion process completed.")

if __name__ == "__main__":
    asyncio.run(main())
