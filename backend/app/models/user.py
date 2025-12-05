import uuid
from sqlalchemy import Column, String, DateTime, Enum as SQLAlchemyEnum, ForeignKey, JSON
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    experience_level = Column(
        SQLAlchemyEnum("Beginner", "Intermediate", "Expert", name="experience_level_enum"), 
        nullable=True
    )
    learning_goal = Column(String, nullable=True)
    software_experience = Column(JSON, default={}) # e.g., {"languages": ["Python", "JS"], "frameworks": ["FastAPI", "React"]}
    hardware_experience = Column(JSON, default={}) # e.g., {"types": ["PC", "GPU"], "details": "NVIDIA RTX 4090"}
    
    user = relationship("User", back_populates="profile")
