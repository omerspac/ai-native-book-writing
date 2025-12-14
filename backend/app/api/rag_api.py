from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any, List
import os # Added for file reading
from sqlalchemy.orm import Session # Added for database session

# Assuming rag_pipeline is imported correctly from its path
from backend.app.rag.rag_pipeline import RAGPipeline
from backend.app.api.auth_api import get_current_active_user, User # Import for user authentication
from backend.app.core.database import get_db # Import for database session
from backend.app.models.user import UserProfile # Import UserProfile model

router = APIRouter()

# Initialize RAGPipeline outside of the endpoint to reuse the client connections
rag_pipeline = RAGPipeline()

class QueryRequest(BaseModel):
    question: str

class QueryResponse(BaseModel):
    answer: str
    sources: list[Dict[str, Any]]

class PersonalizedChapterResponse(BaseModel):
    chapter_id: str
    title: str
    subtitle: str
    personalized_content: str
    original_content: str
    personalization_applied: str

class TranslatedChapterResponse(BaseModel):
    chapter_id: str
    title: str
    subtitle: str
    translated_content: str
    original_content: str
    language: str

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
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Internal server error while processing query.")

@router.get("/rag-test")
def get_rag_test():
    return {"message": "RAG endpoint test successful."}


@router.get("/personalize_chapter/{chapter_id}", response_model=PersonalizedChapterResponse)
async def personalize_chapter(
    chapter_id: str,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves and personalizes chapter content based on the authenticated user's profile.
    """
    db_user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    experience_level = db_user_profile.experience_level if db_user_profile else "Beginner"

    # Retrieve chapter metadata and content
    chapter_metadata = rag_pipeline.postgres_client.get_chapter_metadata(chapter_id)
    if not chapter_metadata:
        raise HTTPException(status_code=404, detail=f"Chapter '{chapter_id}' not found.")
    
    file_path = chapter_metadata["file_path"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Chapter file '{file_path}' not found on server.")

    with open(file_path, 'r', encoding='utf-8') as f:
        original_content = f.read()

    personalized_content = original_content
    personalization_applied = f"No specific personalization applied for '{experience_level}' level."

    # Simple personalization logic (can be expanded with LLMs for dynamic content generation)
    if experience_level == "Expert":
        # Add a note about advanced topics
        personalized_content = (
            f"**Personalized for Experts:** This section will delve deeper into the mathematical underpinnings "
            f"and cutting-edge research in {chapter_metadata['title']}. For more, explore inverse kinematics "
            f"optimization or advanced control theories. "
        ) + personalized_content
        personalization_applied = "Advanced content added."
    elif experience_level == "Beginner":
        # Add a simplified introduction
        personalized_content = (
            f"**Personalized for Beginners:** Let's break down {chapter_metadata['title']} into simpler terms. "
            f"Think of this as your first step into understanding this complex topic. "
        ) + personalized_content
        personalization_applied = "Simplified introduction added."
    elif experience_level == "Intermediate":
         personalized_content = (
            f"**Personalized for Intermediate Users:** This chapter builds upon foundational knowledge. "
            f"Focus on practical applications and key design principles discussed. "
        ) + personalized_content
         personalization_applied = "Practical focus highlighted."

    return PersonalizedChapterResponse(
        chapter_id=chapter_id,
        title=chapter_metadata["title"],
        subtitle=chapter_metadata["subtitle"],
        personalized_content=personalized_content,
        original_content=original_content,
        personalization_applied=personalization_applied
    )


@router.get("/translate_chapter/{chapter_id}", response_model=TranslatedChapterResponse)
async def translate_chapter_to_urdu(
    chapter_id: str
):
    """
    Retrieves chapter content and returns a mocked Urdu translation.
    """
    chapter_metadata = rag_pipeline.postgres_client.get_chapter_metadata(chapter_id)
    if not chapter_metadata:
        raise HTTPException(status_code=404, detail=f"Chapter '{chapter_id}' not found.")
    
    file_path = chapter_metadata["file_path"]
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail=f"Chapter file '{file_path}' not found on server.")

    with open(file_path, 'r', encoding='utf-8') as f:
        original_content = f.read()

    # --- MOCKED URDU TRANSLATION ---
    # In a real scenario, this would involve calling a translation LLM or service.
    # For demonstration, we'll prefix each line with "اردو ترجمہ:" and add a placeholder.
    translated_lines = []
    for line in original_content.splitlines():
        if line.strip(): # Only translate non-empty lines
            translated_lines.append(f"اردو ترجمہ: {line}")
        else:
            translated_lines.append(line) # Keep empty lines as is
    
    mock_urdu_content = (
        "**یہ باب اردو میں ترجمہ شدہ ہے (یہ ایک فرضی ترجمہ ہے)**\n\n" +
        "\n".join(translated_lines) +
        "\n\n_یہ ترجمہ مصنوعی ذہانت کے ذریعے تیار کیا گیا ہے۔ حقیقی ترجمے کے لیے ایک جدید ترجمہ ماڈل استعمال کیا جائے گا۔_"
    )
    # --- END MOCKED URDU TRANSLATION ---

    return TranslatedChapterResponse(
        chapter_id=chapter_id,
        title=chapter_metadata["title"],
        subtitle=chapter_metadata["subtitle"],
        translated_content=mock_urdu_content,
        original_content=original_content,
        language="Urdu"
    )
