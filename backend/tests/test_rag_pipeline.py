# Modified according to SPEC: The user's prompt (pgvector)
import pytest
import asyncio
import os
import numpy as np
from unittest.mock import AsyncMock, patch

from backend.app.rag.rag_pipeline import RAGPipeline
from backend.app.db.postgres_client import PostgresClient
from backend.app.api.v1.endpoints.chat import chat_with_book, ChatRequest
from backend.app.core.config import settings

# Fixtures for testing
@pytest.fixture(scope="module")
def anyio_backend():
    return "asyncio"

@pytest.fixture(scope="module")
async def rag_pipeline_instance():
    # Patch the PostgresClient and GoogleGenerativeAIEmbeddings to avoid actual DB/API calls
    with patch('backend.app.db.postgres_client.PostgresClient') as MockPostgresClient, \
         patch('backend.app.rag.rag_pipeline.GoogleGenerativeAIEmbeddings') as MockEmbeddings:
        
        mock_pg_client = MockPostgresClient.return_value
        # Mocking upsert_embedding
        mock_pg_client.upsert_embedding.return_value = True
        # Mocking search_embeddings to return a consistent result
        mock_pg_client.search_embeddings.return_value = [
            {"text": "This is a test chunk about AI.", "score": 0.95},
            {"text": "Another relevant chunk discussing machine learning.", "score": 0.92}
        ]

        mock_embeddings_instance = MockEmbeddings.return_value
        # Mocking aembed_documents to return a fixed-dimension embedding
        mock_embeddings_instance.aembed_documents = AsyncMock(return_value=[np.zeros(768).tolist()])

        pipeline = RAGPipeline()
        yield pipeline

@pytest.fixture(scope="module")
async def chat_endpoint_deps():
    with patch('backend.app.rag.rag_pipeline.RAGPipeline') as MockRAGPipeline, \
         patch('backend.app.agents.book_writer.BookWriterAgent') as MockBookWriterAgent:
        
        mock_rag_pipeline = MockRAGPipeline.return_value
        mock_rag_pipeline.retrieve_relevant_chunks = AsyncMock(return_value=[
            {"text": "The document states that AI is a field of computer science.", "score": 0.98}
        ])

        mock_book_writer_agent = MockBookWriterAgent.return_value
        mock_book_writer_agent.generate_chapter_content = AsyncMock(return_value="AI is a field of computer science according to the documents.")
        
        yield # No explicit return, dependencies are yielded through mocks

# Tests for RAGPipeline
@pytest.mark.anyio
async def test_generate_embeddings_dimension(rag_pipeline_instance):
    """Test that embeddings are produced to the expected dimension."""
    test_text = ["hello world"]
    embeddings = await rag_pipeline_instance._generate_embeddings(test_text)
    assert len(embeddings) == 1
    assert len(embeddings[0]) == 768 # Expected embedding dimension

@pytest.mark.anyio
async def test_ingest_chapter_calls_upsert(rag_pipeline_instance):
    """Test that ingest_chapter calls upsert_embedding with correct arguments."""
    # Create a dummy file for testing
    dummy_chapter_path = "frontend/my-book/docs/test_chapter_for_ingest.md"
    os.makedirs(os.path.dirname(dummy_chapter_path), exist_ok=True)
    with open(dummy_chapter_path, "w", encoding="utf-8") as f:
        f.write("---\nid: test_chapter\ntitle: Test Chapter\n---\n\nThis is a test chapter content.")

    await rag_pipeline_instance.ingest_chapter(dummy_chapter_path)
    
    rag_pipeline_instance.postgres_client.upsert_embedding.assert_called()
    call_args, _ = rag_pipeline_instance.postgres_client.upsert_embedding.call_args
    assert "test chapter content" in call_args[0] # check chunk_text
    assert isinstance(call_args[1], np.ndarray) # check embedding is numpy array

    os.remove(dummy_chapter_path) # Clean up dummy file

@pytest.mark.anyio
async def test_retrieve_relevant_chunks(rag_pipeline_instance):
    """Test that retrieve_relevant_chunks returns expected format."""
    query = "What is AI?"
    results = await rag_pipeline_instance.retrieve_relevant_chunks(query)
    
    assert isinstance(results, list)
    assert len(results) > 0
    assert "text" in results[0]
    assert "score" in results[0]
    assert results[0]["score"] == 0.95 # From mocked search_embeddings

# Tests for chat endpoint
@pytest.mark.anyio
async def test_chat_integrates_retrieval_and_generator(chat_endpoint_deps):
    """Test that the chat endpoint integrates retrieval and generation."""
    request = ChatRequest(question="What is AI?")
    response = await chat_with_book(request)
    
    assert response.answer == "AI is a field of computer science according to the documents."
    assert len(response.source_chunks) == 1
    assert "The document states that AI is a field of computer science." in response.source_chunks[0]["text"]

@pytest.mark.anyio
async def test_chat_respects_answer_only_from_documents_rule(chat_endpoint_deps):
    """Test that the chat endpoint respects the "answer only from documents" rule."""
    with patch('backend.app.rag.rag_pipeline.RAGPipeline') as MockRAGPipeline:
        mock_rag_pipeline = MockRAGPipeline.return_value
        mock_rag_pipeline.retrieve_relevant_chunks = AsyncMock(return_value=[]) # No relevant docs
        
        # We also need to patch the RAGPipeline instance used by the chat_with_book function
        # to ensure it uses our mocked version. This is a bit tricky with FastAPI dependencies.
        # For simplicity, we'll ensure chat_with_book uses a RAGPipeline that yields no docs.
        # In a real app, this would involve dependency override.
        with patch('backend.app.api.v1.endpoints.chat.rag_pipeline', new=mock_rag_pipeline):
            request = ChatRequest(question="Tell me about something not in the book.")
            response = await chat_with_book(request)
            assert response.answer == "I don't know from the provided documents."
            assert not response.source_chunks
