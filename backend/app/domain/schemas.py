from pydantic import BaseModel, EmailStr, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = Field(default=None, max_length=255)

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128, description="Password must be at least 8 characters long.")

class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=255)
    current_password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    new_password: Optional[str] = Field(default=None, min_length=8, max_length=128)

class UserResponse(BaseModel):
    id: UUID
    email: EmailStr
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    refresh_token: Optional[str] = None

class RefreshTokenRequest(BaseModel):
    refresh_token: str

class ResumeResponse(BaseModel):
    id: UUID
    user_id: UUID
    filename: str
    raw_text: str
    created_at: datetime
    
    # Structured fields
    skills: Optional[list[str]] = None
    projects: Optional[list[str]] = None
    education: Optional[list[str]] = None
    experience: Optional[list[str]] = None
    technologies: Optional[list[str]] = None
    certifications: Optional[list[str]] = None

    class Config:
        from_attributes = True

class InterviewGenerateRequest(BaseModel):
    role: str = Field(..., description="Target role: Software Engineer, Python Developer, Data Scientist, AI Engineer, or Full Stack Developer")
    experience_level: str = Field(..., description="Target experience level: Beginner, Intermediate, Expert, or Staff")

class QuestionItem(BaseModel):
    id: int
    text: str
    category: str

class InterviewQuestionsResponse(BaseModel):
    role: str
    experience_level: str
    questions: list[QuestionItem]

class AnswerEvaluationRequest(BaseModel):
    role: str
    experience_level: str
    question: str
    answer: str

class AnswerEvaluationResponse(BaseModel):
    technical_score: int
    communication_score: int
    grammar_score: int
    confidence_score: int
    suggestions: list[str]
    correct_answer: str
    follow_up: str
    is_fallback: bool

class AdaptiveQuestionRequest(BaseModel):
    role: str
    current_level: str
    last_score: int
    answered_questions: list[str] = []

class AdaptiveQuestionResponse(BaseModel):
    question: QuestionItem
    new_level: str

class FrameAnalysisRequest(BaseModel):
    image_base64: str
    last_x: Optional[int] = None
    last_y: Optional[int] = None

class FrameAnalysisResponse(BaseModel):
    face_detected: bool
    eye_contact: bool
    looking_away: bool
    head_movement_detected: bool
    current_x: int
    current_y: int
    dominant_emotion: str
    emotion_happy: float
    emotion_neutral: float
    emotion_sad: float
    emotion_angry: float
    emotion_fear: float

class ReportQAItem(BaseModel):
    question: str
    answer: str
    technical_score: int
    communication_score: int
    grammar_score: int
    confidence_score: int
    suggestions: list[str]
    correct_answer: str

class ReportGenerateRequest(BaseModel):
    role: str
    experience_level: str
    resume_summary: str
    eye_contact_rate: int
    face_presence_rate: int
    head_movements: int
    dominant_emotion: str
    qa_history: list[ReportQAItem]

class AdminUserResponse(BaseModel):
    id: uuid.UUID
    email: str
    full_name: Optional[str]
    is_active: bool
    is_admin: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ActiveSessionResponse(BaseModel):
    user_email: str
    role: str
    experience_level: str
    started_at: str

class AdminDashboardResponse(BaseModel):
    total_users: int
    total_interviews: int
    average_score: float
    active_sessions: list[ActiveSessionResponse]
    recent_reports: list[dict]
