# Modified according to SPEC: The user's prompt (pgvector)
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession # Import AsyncSession

from backend.app.rag.rag_pipeline import RAGPipeline
from backend.app.core.config import settings # Assuming settings are here
from backend.app.core.database import get_db # Import get_db

router = APIRouter()

# Initialize RAGPipeline
rag_pipeline = RAGPipeline()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    source_chunks: List[Dict] = []

@router.post("/", response_model=ChatResponse)
async def chat_with_book(request: ChatRequest, session: AsyncSession = Depends(get_db)):
    """
    Interacts with the RAG chatbot to answer questions based on book content.
    """
    try:
        # Retrieve relevant documents first to include in the response
        relevant_chunks = await rag_pipeline.retrieve_relevant_chunks(session, request.question, limit=settings.RAG_RETRIEVAL_LIMIT)

        # The RAGPipeline's answer_question method handles retrieval, augmentation, and generation
        answer = await rag_pipeline.answer_question(request.question, session)
        
        return ChatResponse(answer=answer, source_chunks=relevant_chunks)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during chat interaction: {e}"
        )
