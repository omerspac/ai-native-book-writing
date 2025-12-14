# scripts/test_ingest.py
import asyncio
import os
import sys

# Add the project root to the Python path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app.rag.rag_pipeline import RAGPipeline

async def main():
    rag_pipeline = RAGPipeline()

    # Define a dummy chapter path
    dummy_chapter_path = "frontend/my-book/docs/chapter1.md"

    # Create a dummy file if it doesn't exist for testing
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

    # Ingest the chapter
    print("Starting chapter ingestion test...")
    rag_pipeline.ingest_chapter(dummy_chapter_path)
    print("Finished chapter ingestion test.")

    # Test answering a question
    print("\nStarting question answering test...")
    question = "What is AI?"
    answer = rag_pipeline.answer_question(question)
    print(f"\nQuestion: {question}")
    print(f"Answer: {answer}")

    question = "Tell me about robotics."
    answer = rag_pipeline.answer_question(question)
    print(f"\nQuestion: {question}")
    print(f"Answer: {answer}")

    # Clean up dummy file (optional)
    # os.remove(dummy_chapter_path)

if __name__ == "__main__":
    asyncio.run(main())