from typing import Optional
from pydantic import BaseModel, EmailStr
from enum import Enum
import uuid # Import uuid

class SoftwareLevel(str, Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    advanced = "Advanced"

class HardwareLevel(str, Enum):
    beginner = "Beginner"
    intermediate = "Intermediate"
    advanced = "Advanced"

class UserProfileCreate(BaseModel):
    software_level: Optional[SoftwareLevel] = None
    hardware_level: Optional[HardwareLevel] = None
    interest_field: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    profile: UserProfileCreate

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class UserProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    software_level: Optional[SoftwareLevel] = None
    hardware_level: Optional[HardwareLevel] = None
    interest_field: Optional[str] = None

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    profile: Optional[UserProfileResponse] = None # Add profile here

    class Config:
        from_attributes = True