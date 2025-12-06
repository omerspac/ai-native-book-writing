# backend/app/api/profile_api.py
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from backend.app.api.auth_api import get_current_active_user, User
from backend.app.core.database import get_db, create_db_and_tables
from backend.app.models.user import UserProfile # Import UserProfile from user.py

router = APIRouter(prefix="/profile", tags=["Profile"])

class SoftwareExperience(BaseModel):
    languages: Optional[List[str]] = []
    frameworks: Optional[List[str]] = []
    tools: Optional[List[str]] = []

class HardwareExperience(BaseModel):
    types: Optional[List[str]] = []
    details: Optional[str] = None

class UserProfileSurvey(BaseModel):
    experience_level: Optional[str] = None # e.g., "Beginner", "Intermediate", "Expert"
    learning_goal: Optional[str] = None
    software_experience: Optional[SoftwareExperience] = SoftwareExperience()
    hardware_experience: Optional[HardwareExperience] = HardwareExperience()

@router.post("/survey", status_code=status.HTTP_200_OK)
async def submit_user_survey(
    survey_data: UserProfileSurvey,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Submits or updates the user's profile survey with software and hardware experience.
    """
    db_user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not db_user_profile:
        # Create a new profile if one doesn't exist
        db_user_profile = UserProfile(user_id=current_user.id)
        db.add(db_user_profile)
    
    db_user_profile.experience_level = survey_data.experience_level
    db_user_profile.learning_goal = survey_data.learning_goal
    db_user_profile.software_experience = survey_data.software_experience.model_dump_json() if survey_data.software_experience else {}
    db_user_profile.hardware_experience = survey_data.hardware_experience.model_dump_json() if survey_data.hardware_experience else {}

    try:
        db.commit()
        db.refresh(db_user_profile)
        return {"message": "User profile survey submitted successfully.", "profile_id": db_user_profile.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to submit survey: {e}")

@router.get("/me", response_model=UserProfileSurvey)
async def get_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Retrieves the authenticated user's profile information.
    """
    db_user_profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()

    if not db_user_profile:
        # If no profile exists, return a default empty survey
        return UserProfileSurvey()
    
    # Parse JSON strings back to Python objects for Pydantic model
    software_exp_data = db_user_profile.software_experience
    hardware_exp_data = db_user_profile.hardware_experience

    return UserProfileSurvey(
        experience_level=db_user_profile.experience_level,
        learning_goal=db_user_profile.learning_goal,
        software_experience=SoftwareExperience(**software_exp_data) if software_exp_data else SoftwareExperience(),
        hardware_experience=HardwareExperience(**hardware_exp_data) if hardware_exp_data else HardwareExperience()
    )

# Ensure tables are created when the application starts
create_db_and_tables()
