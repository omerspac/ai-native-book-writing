from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.orm import Session
from backend.app.core.config import settings
from backend.app.core.security import ALGORITHM
from backend.app.db.session import get_db
from backend.app.repositories.user_repository import UserRepository
import uuid

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login") # tokenUrl should point to your login endpoint

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.BETTER_AUTH_SECRET, algorithms=[ALGORITHM])
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = uuid.UUID(user_id_str)
    except (JWTError, ValueError): # ValueError for invalid UUID string
        raise credentials_exception
    
    user_repo = UserRepository(db)
    user = user_repo.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user
