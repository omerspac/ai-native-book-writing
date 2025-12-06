from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.services.chapter_service import get_chapter_content
from backend.app.db.session import get_db

router = APIRouter()

@router.get("/{chapter_id}/personalized", response_model=str) # Response is plain text (markdown)
async def get_personalized_chapter(
    chapter_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves chapter content. Personalization based on user profile is removed.
    """
    try:
        # 1. Fetch original chapter content
        original_content = await get_chapter_content(chapter_id)
        return original_content
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{chapter_id}' not found.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to retrieve chapter: {e}")