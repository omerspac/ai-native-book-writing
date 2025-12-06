from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.dependencies import get_current_user
from app.agents.personalization_agent import PersonalizationAgent
from app.services.chapter_service import get_chapter_content
from app.db.session import get_db
from app.models.user import User

router = APIRouter()

@router.get("/{chapter_id}/personalized", response_model=str) # Response is plain text (markdown)
async def get_personalized_chapter(
    chapter_id: str,
    current_user: User = Depends(get_current_user), # Protected endpoint
    db: Session = Depends(get_db)
):
    """
    Retrieves personalized chapter content based on the authenticated user's profile.
    """
    if not current_user.profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found.")

    try:
        # 1. Fetch original chapter content
        original_content = await get_chapter_content(chapter_id)

        # 2. Personalize content using the agent
        personalizer = PersonalizationAgent()
        personalized_content = await personalizer.personalize_content(
            content=original_content,
            user_profile=current_user.profile # Pass the entire profile object
        )
        return personalized_content
    except FileNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Chapter '{chapter_id}' not found.")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Personalization failed: {e}")