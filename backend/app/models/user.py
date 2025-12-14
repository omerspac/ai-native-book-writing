from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey
from sqlalchemy.orm import relationship
from backend.app.db.session import Base
from backend.app.schemas.user import SoftwareLevel, HardwareLevel

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    profile = relationship("UserProfile", back_populates="owner", uselist=False)

class UserProfile(Base):
    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    software_level = Column(Enum(SoftwareLevel))
    hardware_level = Column(Enum(HardwareLevel))
    interest_field = Column(String)

    owner = relationship("User", back_populates="profile")
