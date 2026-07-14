import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional
from fastapi import APIRouter, Depends, Response, Request, status
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import APIException, UserAlreadyExistsException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    verify_password
)
from app.domain.schemas import (
    UserCreate,
    UserResponse,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest
)
from app.repositories.user_repo import UserRepository

router = APIRouter()

def set_refresh_cookie(response: Response, token: str) -> None:
    """
    Helper to set refresh token in an HTTP-only cookie.
    """
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,
        secure=settings.ENVIRONMENT == "production",
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth"
    )

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_in: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Registers a new user.
    """
    user_repo = UserRepository(db)
    db_user = await user_repo.get_by_email(user_in.email)
    if db_user:
        raise UserAlreadyExistsException()
    
    new_user = await user_repo.create(user_in)
    return new_user

@router.post("/login", response_model=TokenResponse)
async def login(
    response: Response,
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Logs in user, returning access and refresh tokens, setting HTTP-only cookie.
    """
    user_repo = UserRepository(db)
    user = await user_repo.get_by_email(credentials.email)
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise APIException("Invalid email or password.", status_code=status.HTTP_401_UNAUTHORIZED)
    if not user.is_active:
        raise APIException("This user account is deactivated.", status_code=status.HTTP_400_BAD_REQUEST)
        
    access_token = create_access_token(subject=user.id)
    refresh_token = create_refresh_token(subject=user.id)
    
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await user_repo.create_refresh_token(user_id=user.id, token=refresh_token, expires_at=expires_at)
    
    set_refresh_cookie(response, refresh_token)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token
    )

@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Refreshes access token and rotates refresh token using Cookie or body.
    """
    token = request.cookies.get("refresh_token")
    if not token and body:
        token = body.refresh_token
        
    if not token:
        raise APIException("Refresh token is missing.", status_code=status.HTTP_401_UNAUTHORIZED)
        
    user_repo = UserRepository(db)
    db_token = await user_repo.get_refresh_token(token)
    if not db_token or db_token.is_revoked:
        raise APIException("Invalid refresh token.", status_code=status.HTTP_401_UNAUTHORIZED)
        
    # Standardize tzinfo for comparison
    expires_at = db_token.expires_at.replace(tzinfo=timezone.utc) if db_token.expires_at.tzinfo is None else db_token.expires_at
    if expires_at < datetime.now(timezone.utc):
        raise APIException("Expired refresh token.", status_code=status.HTTP_401_UNAUTHORIZED)
        
    try:
        payload = decode_token(token, is_refresh=True)
        user_id_str = payload.get("sub")
        if not user_id_str:
            raise jwt.InvalidTokenError()
        user_id = uuid.UUID(user_id_str)
    except (jwt.InvalidTokenError, ValueError):
        raise APIException("Invalid refresh token claim.", status_code=status.HTTP_401_UNAUTHORIZED)
        
    # Rotate refresh token: revoke current, issue new
    db_token.is_revoked = True
    db.add(db_token)
    
    new_access_token = create_access_token(subject=user_id)
    new_refresh_token = create_refresh_token(subject=user_id)
    new_expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    await user_repo.create_refresh_token(user_id=user_id, token=new_refresh_token, expires_at=new_expires_at)
    
    set_refresh_cookie(response, new_refresh_token)
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token
    )

@router.post("/logout", status_code=status.HTTP_200_OK)
async def logout(
    request: Request,
    response: Response,
    body: Optional[RefreshTokenRequest] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Logs out the user by revoking the refresh token and clearing cookie.
    """
    token = request.cookies.get("refresh_token")
    if not token and body:
        token = body.refresh_token
        
    if token:
        user_repo = UserRepository(db)
        await user_repo.revoke_refresh_token(token)
        
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")
    return {"detail": "Successfully logged out."}
