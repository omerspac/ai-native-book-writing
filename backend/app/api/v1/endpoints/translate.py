from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from backend.app.agents.translator_agent import TranslatorAgent

router = APIRouter()

class TranslateRequest(BaseModel):
    content: str

class TranslateResponse(BaseModel):
    translated_content: str

@router.post("/translate", response_model=TranslateResponse)
async def translate_chapter(
    request: TranslateRequest
):
    """
    Translates English content to Urdu using the Translator Agent.
    No authentication required.
    """
    try:
        translator = TranslatorAgent()
        translated_text = await translator.translate_to_urdu(request.content)
        return TranslateResponse(translated_content=translated_text)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Translation failed: {e}")