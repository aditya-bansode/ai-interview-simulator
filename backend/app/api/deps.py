from typing import AsyncGenerator, Optional
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
import uuid
from app.core.database import get_db
from app.core.exceptions import CredentialsException, TokenExpiredException
from app.core.security import decode_token
from app.repositories.user_repo import UserRepository
from app.adapters.db_models import User

# OAuth2PasswordBearer extracts token from 'Authorization: Bearer <token>' header.
# We point tokenUrl to the login endpoint for Swagger UI testing.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme)
) -> User:
    """
    FastAPI dependency that extracts, decodes and validates the access token,
    returning the authenticated user.
    """
    # Import here to avoid typing import errors
    from typing import Optional
    
    if not token:
        raise CredentialsException("Authentication credentials were not provided.")
        
    try:
        payload = decode_token(token, is_refresh=False)
        user_id_str: Optional[str] = payload.get("sub")
        if user_id_str is None:
            raise CredentialsException()
        user_id = uuid.UUID(user_id_str)
    except jwt.ExpiredSignatureError:
        raise TokenExpiredException("Session token has expired.")
    except (jwt.InvalidTokenError, ValueError):
        raise CredentialsException("Invalid authentication credentials.")
        
    user_repo = UserRepository(db)
    user = await user_repo.get_by_id(user_id)
    if user is None:
        raise CredentialsException("User account not found.")
    if not user.is_active:
        raise CredentialsException("User account is disabled.")
        
    return user
