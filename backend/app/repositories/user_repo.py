import uuid
from datetime import datetime
from typing import Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.adapters.db_models import User, RefreshToken, Resume
from app.domain.schemas import UserCreate, UserUpdate
from app.core.security import get_password_hash
from app.core.resume_parser import analyze_resume_text

class UserRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """
        Retrieves a user by their UUID.
        """
        stmt = select(User).where(User.id == user_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Retrieves a user by their email address (case-insensitive).
        """
        stmt = select(User).where(User.email == email.lower().strip())
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def create(self, user_in: UserCreate) -> User:
        """
        Creates a new user in the database.
        """
        db_user = User(
            email=user_in.email.lower().strip(),
            hashed_password=get_password_hash(user_in.password),
            full_name=user_in.full_name
        )
        self.db.add(db_user)
        await self.db.flush()
        return db_user

    async def update(self, db_user: User, user_in: UserUpdate) -> User:
        """
        Updates an existing user's information.
        """
        if user_in.full_name is not None:
            db_user.full_name = user_in.full_name
        if user_in.new_password is not None:
            db_user.hashed_password = get_password_hash(user_in.new_password)
        
        self.db.add(db_user)
        await self.db.flush()
        return db_user

    async def create_refresh_token(self, user_id: uuid.UUID, token: str, expires_at: datetime) -> RefreshToken:
        """
        Records a new refresh token for a user.
        """
        db_token = RefreshToken(
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        self.db.add(db_token)
        await self.db.flush()
        return db_token

    async def get_refresh_token(self, token: str) -> Optional[RefreshToken]:
        """
        Retrieves a refresh token record.
        """
        stmt = select(RefreshToken).where(RefreshToken.token == token)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def revoke_refresh_token(self, token_str: str) -> None:
        """
        Revokes a single refresh token by marking it as revoked.
        """
        stmt = select(RefreshToken).where(RefreshToken.token == token_str)
        result = await self.db.execute(stmt)
        token = result.scalars().first()
        if token:
            token.is_revoked = True
            self.db.add(token)
            await self.db.flush()

    async def revoke_all_user_tokens(self, user_id: uuid.UUID) -> None:
        """
        Revokes all refresh tokens belonging to a user (e.g., on password change).
        """
        stmt = select(RefreshToken).where(
            RefreshToken.user_id == user_id, 
            RefreshToken.is_revoked == False
        )
        result = await self.db.execute(stmt)
        tokens = result.scalars().all()
        for token in tokens:
            token.is_revoked = True
            self.db.add(token)
        await self.db.flush()

    async def get_resume(self, user_id: uuid.UUID) -> Optional[Resume]:
        """
        Retrieves a user's resume record.
        """
        stmt = select(Resume).where(Resume.user_id == user_id)
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def save_resume(self, user_id: uuid.UUID, filename: str, file_path: str, raw_text: str) -> Resume:
        """
        Saves or updates a user's resume record (1-to-1 mapping), extracting structured content.
        """
        # Run text parsing utility
        parsed = analyze_resume_text(raw_text)
        
        db_resume = await self.get_resume(user_id)
        if db_resume:
            db_resume.filename = filename
            db_resume.file_path = file_path
            db_resume.raw_text = raw_text
        else:
            db_resume = Resume(
                user_id=user_id,
                filename=filename,
                file_path=file_path,
                raw_text=raw_text
            )
            self.db.add(db_resume)
            
        # Update structured JSONB columns
        db_resume.skills = parsed.get("skills", [])
        db_resume.projects = parsed.get("projects", [])
        db_resume.education = parsed.get("education", [])
        db_resume.experience = parsed.get("experience", [])
        db_resume.technologies = parsed.get("technologies", [])
        db_resume.certifications = parsed.get("certifications", [])
        
        self.db.add(db_resume)
        await self.db.flush()
        return db_resume
