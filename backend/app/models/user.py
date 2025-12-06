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
    
    software_level = Column(
        SQLAlchemyEnum("Beginner", "Intermediate", "Advanced", name="software_level_enum"), 
        nullable=True
    )
    hardware_level = Column(
        SQLAlchemyEnum("Beginner", "Intermediate", "Advanced", name="hardware_level_enum"), 
        nullable=True
    )
    interest_field = Column(String, nullable=True)
    
    user = relationship("User", back_populates="profile")
