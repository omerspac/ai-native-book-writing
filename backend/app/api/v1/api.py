from fastapi import APIRouter
from backend.app.api.v1.endpoints import auth, users, translate, chapters

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(translate.router, prefix="/translate", tags=["Translation"])
api_router.include_router(chapters.router, prefix="/chapters", tags=["Chapters"])
