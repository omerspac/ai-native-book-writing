from sqlalchemy.orm import Session
from backend.app.models.user import User, UserProfile
from typing import Optional, Dict, Any
import uuid

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def create_user(self, email: str, hashed_password: str, profile_data: Dict[str, Any]) -> User:
        """
        Creates a new user and their associated profile.
        """
        db_user = User(email=email, hashed_password=hashed_password)
        self.db.add(db_user)
        self.db.flush()  # Flush to get the user ID for the profile

        db_profile = UserProfile(
            user_id=db_user.id,
            software_level=profile_data.get("software_level"),
            hardware_level=profile_data.get("hardware_level"),
            interest_field=profile_data.get("interest_field")
        )
        self.db.add(db_profile)
        self.db.commit()
        self.db.refresh(db_user)
        return db_user

    def get_user_by_email(self, email: str) -> Optional[User]:
        """
        Retrieves a user by their email address.
        """
        return self.db.query(User).filter(User.email == email).first()

    def get_user_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """
        Retrieves a user by their ID.
        """
        return self.db.query(User).filter(User.id == user_id).first()
