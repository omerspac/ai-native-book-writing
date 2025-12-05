from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Dict, Any

# Assuming rag_pipeline is imported correctly from its path
from app.rag.rag_pipeline import RAGPipeline

router = APIRouter()

# Initialize RAGPipeline outside of the endpoint to reuse the client connections
rag_pipeline = RAGPipeline()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: list[Dict[str, Any]]

@router.post("/query", response_model=QueryResponse)
async def query_rag(request: QueryRequest):
    """
    Accepts a natural language question, retrieves relevant information using RAG,
    and returns an AI-generated answer with sources.
    """
    try:
        # 1. Retrieve top-k relevant vectors (chunks) from Qdrant
        relevant_chunks = await rag_pipeline.retrieve_relevant_chunks(request.question, limit=5)

        if not relevant_chunks:
            raise HTTPException(status_code=404, detail="No relevant information found for the query.")

        # 2. Prepare context for the AI agent
        # Concatenate text from relevant chunks to form the context
        context_texts = [chunk["text"] for chunk in relevant_chunks]
        context = "\n\n".join(context_texts)

        # 3. Send context + question to an AI agent for generating an answer
        # This part would typically involve calling an LLM (e.g., Gemini, OpenAI)
        # For demonstration, we'll use a mocked response.
        # In a real scenario, you'd use a model like this:
        # from langchain_google_genai import ChatGoogleGenerativeAI
        # llm = ChatGoogleGenerativeAI(model="gemini-pro")
        # response = llm.invoke(f"Context: {context}\nQuestion: {request.question}\nAnswer:")

        # MOCK AI AGENT RESPONSE for now
        mock_ai_answer = (
            f"Based on the provided context, the answer to '{request.question}' is: "
            f"This is a mocked AI response, synthesizing information from {len(relevant_chunks)} sources. "
            f"The context includes details such as: {context_texts[0][:100]}... "
            "For a real implementation, a large language model would generate a coherent answer."
        )

        # Extract sources information from relevant_chunks for the response
        sources_info = [
            {"chapter_id": chunk.get("chapter_id"), "chunk_id": chunk.get("chunk_id"), "score": chunk.get("score")}
            for chunk in relevant_chunks
        ]

        return QueryResponse(answer=mock_ai_answer, sources=sources_info)

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Internal server error during RAG query: {e}")
        raise HTTPException(status_code=500, detail="Internal server error while processing query.")

@router.get("/rag-test")
def get_rag_test():
    return {"message": "RAG endpoint test successful."}
