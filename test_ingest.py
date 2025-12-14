import asyncio
from backend.app.rag.rag_pipeline import RAGPipeline

async def main():
    rag_pipeline = RAGPipeline()
    await rag_pipeline.ingest_chapter("frontend/my-book/docs/chapter1.md")

asyncio.run(main())