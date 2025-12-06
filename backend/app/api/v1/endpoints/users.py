from fastapi import APIRouter, Depends
from backend.app.dependencies import get_current_user
from backend.app.models.user import User
from backend.app.schemas.user import UserResponse
from sqlalchemy.orm import Session
from backend.app.db.session import get_db

router = APIRouter()

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)): # Add db dependency
    """
    Retrieve the current authenticated user's information, including profile.
    """
    # Ensure the profile relationship is loaded
    db.refresh(current_user)
    return current_user