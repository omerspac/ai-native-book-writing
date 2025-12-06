from fastapi import APIRouter, Depends, Form, HTTPException, status
from pydantic import EmailStr
from sqlalchemy.orm import Session
from backend.app.db.session import get_db
from backend.app.repositories.user_repository import UserRepository
from backend.app.schemas.user import UserCreate, Token
from backend.app.core.security import get_password_hash, verify_password, create_access_token
from datetime import timedelta
from backend.app.core.config import settings

router = APIRouter()

@router.post("/signup", response_model=Token, status_code=status.HTTP_201_CREATED)
def signup_user(user_data: UserCreate, db: Session = Depends(get_db)):
    user_repo = UserRepository(db)
    db_user = user_repo.get_user_by_email(user_data.email)
    if db_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    
    # Extract profile data from user_data
    profile_data = user_data.profile.model_dump() if user_data.profile else {}

    user = user_repo.create_user(
        email=user_data.email,
        hashed_password=hashed_password,
        profile_data=profile_data
    )

    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires # Use user.id as sub
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/login", response_model=Token)
def login_for_access_token(
    email: EmailStr = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user_repo = UserRepository(db)
    # --- TEMPORARY: Hardcoded login for testing purposes ---
    if email == "omer@gmail.com" and password == "omer123":
        user = user_repo.get_user_by_email(email)
        if not user:
            # If user does not exist, create a dummy user. Password will be hashed but not used for verification here.
            hashed_password = get_password_hash(password) # Hash for consistency
            user = user_repo.create_user(
                email=email,
                hashed_password=hashed_password,
                profile_data={} # No specific profile data for a dummy user
            )
        # Proceed to token generation as if authenticated
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={"sub": str(user.id)}, expires_delta=access_token_expires
        )
        return {"access_token": access_token, "token_type": "bearer"}
    # --- END TEMPORARY BLOCK ---

    user = user_repo.get_user_by_email(email)
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, expires_delta=access_token_expires # Use user.id as sub
    )
    return {"access_token": access_token, "token_type": "bearer"}