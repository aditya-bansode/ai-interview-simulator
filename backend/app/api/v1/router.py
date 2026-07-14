from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, resumes, interviews, transcribe, video, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(resumes.router, prefix="/users", tags=["resumes"])
api_router.include_router(interviews.router, prefix="/interviews", tags=["interviews"])
api_router.include_router(transcribe.router, prefix="/interviews", tags=["transcribe"])
api_router.include_router(video.router, prefix="/interviews", tags=["video"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
