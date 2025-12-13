import sys
import os

# Add the project root to the sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import asyncio
from backend.app.rag.rag_pipeline import RAGPipeline
from backend.app.core.database import AsyncSessionLocal, create_db_and_tables

async def ingest_chapters_test():
    """
    Demonstrates asynchronous ingestion of dummy chapters into the RAG pipeline.
    """
    print("Starting chapter ingestion test...")
    try:
        # Ensure tables are created (idempotent operation)
        await create_db_and_tables()

        rag_pipeline = RAGPipeline()
        
        # Create a dummy chapter file for testing if it doesn't exist
        dummy_chapter_path = "frontend/my-book/docs/chapter1.md"
        if not os.path.exists(dummy_chapter_path):
            os.makedirs(os.path.dirname(dummy_chapter_path), exist_ok=True)
            with open(dummy_chapter_path, "w", encoding="utf-8") as f:
                f.write("""---
id: chapter1
title: The Test Chapter
subtitle: A chapter for testing purposes
---

This is the content of the test chapter. It talks about AI and its applications. This sentence is about robotics. And this is about machine learning.""")
            print(f"Created dummy chapter at {dummy_chapter_path}")

        async with AsyncSessionLocal() as session:
            print(f"Ingesting {dummy_chapter_path}...")
            await rag_pipeline.ingest_chapter(session, dummy_chapter_path)
            print(f"Finished ingesting {dummy_chapter_path}.")
            
            # Example of ingesting another chapter
            dummy_chapter_path_2 = "frontend/my-book/docs/chapter2.md"
            if not os.path.exists(dummy_chapter_path_2):
                os.makedirs(os.path.dirname(dummy_chapter_path_2), exist_ok=True)
                with open(dummy_chapter_path_2, "w", encoding="utf-8") as f:
                    f.write("""---
id: chapter2
title: Advanced AI Concepts
subtitle: Delving deeper into artificial intelligence
---

This chapter discusses advanced topics in AI, including neural networks, deep learning, and reinforcement learning. We explore the ethical implications of autonomous systems and the future of human-AI collaboration.""")
                print(f"Created dummy chapter at {dummy_chapter_path_2}")

            print(f"Ingesting {dummy_chapter_path_2}...")
            await rag_pipeline.ingest_chapter(session, dummy_chapter_path_2)
            print(f"Finished ingesting {dummy_chapter_path_2}.")

    except ValueError as e:
        print(f"Configuration error during ingestion: {e}")
    except Exception as e:
        print(f"An unexpected error occurred during ingestion: {e}")

if __name__ == "__main__":
    asyncio.run(ingest_chapters_test())
