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
