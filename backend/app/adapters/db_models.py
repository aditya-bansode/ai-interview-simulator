import uuid
from datetime import datetime
from sqlalchemy import String, ForeignKey, DateTime, Boolean, func, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(
        back_populates="user", 
        cascade="all, delete-orphan",
        lazy="selectin"
    )
    
    resume: Mapped["Resume"] = relationship(
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan",
        lazy="selectin"
    )

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token: Mapped[str] = mapped_column(String(512), unique=True, index=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    is_revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    user: Mapped["User"] = relationship(back_populates="refresh_tokens")

class Resume(Base):
    __tablename__ = "resumes"
    
    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    filename: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(512), nullable=False)
    raw_text: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    
    # Structured Extracted Information
    skills: Mapped[list[str]] = mapped_column(JSON, nullable=True)
    projects: Mapped[list[str]] = mapped_column(JSON, nullable=True)
    education: Mapped[list[str]] = mapped_column(JSON, nullable=True)
    experience: Mapped[list[str]] = mapped_column(JSON, nullable=True)
    technologies: Mapped[list[str]] = mapped_column(JSON, nullable=True)
    certifications: Mapped[list[str]] = mapped_column(JSON, nullable=True)
    
    user: Mapped["User"] = relationship(back_populates="resume")
