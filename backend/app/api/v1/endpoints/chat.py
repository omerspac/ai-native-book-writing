# Modified according to SPEC: The user's prompt (pgvector)
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from backend.app.rag.rag_pipeline import RAGPipeline
from backend.app.core.config import settings 

router = APIRouter()

# Initialize RAGPipeline globally.
# Chapters will be ingested during application startup in main.py.
rag_pipeline = RAGPipeline()

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str

@router.post("/", response_model=ChatResponse)
async def chat_with_book(request: ChatRequest):
    """
    Interacts with the RAG chatbot to answer questions based on book content.
    """
    try:
        answer = rag_pipeline.answer_question(request.question)
        
        return ChatResponse(answer=answer)

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred during chat interaction: {e}"
        )
