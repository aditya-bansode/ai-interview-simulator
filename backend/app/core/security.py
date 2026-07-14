from datetime import datetime, timedelta, timezone
from typing import Any, Dict
import jwt
import bcrypt
from app.core.config import settings

ALGORITHM = "HS256"

def get_password_hash(password: str) -> str:
    """
    Hashes a password string using bcrypt.
    """
    pw_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_pw = bcrypt.hashpw(pw_bytes, salt)
    return hashed_pw.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against its hashed value.
    """
    try:
        pw_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(pw_bytes, hashed_bytes)
    except Exception:
        return False

def create_access_token(subject: Any, expires_delta: timedelta = None) -> str:
    """
    Generates a secure, short-lived JWT access token.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "access"
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def create_refresh_token(subject: Any, expires_delta: timedelta = None) -> str:
    """
    Generates a secure, long-lived JWT refresh token.
    """
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "type": "refresh"
    }
    encoded_jwt = jwt.encode(to_encode, settings.JWT_REFRESH_SECRET, algorithm=ALGORITHM)
    return encoded_jwt

def decode_token(token: str, is_refresh: bool = False) -> Dict[str, Any]:
    """
    Decodes and validates a JWT token.
    Raises jwt.ExpiredSignatureError or jwt.InvalidTokenError for errors.
    """
    secret = settings.JWT_REFRESH_SECRET if is_refresh else settings.JWT_SECRET
    payload = jwt.decode(token, secret, algorithms=[ALGORITHM])
    token_type = "refresh" if is_refresh else "access"
    if payload.get("type") != token_type:
        raise jwt.InvalidTokenError("Invalid token type")
    return payload
