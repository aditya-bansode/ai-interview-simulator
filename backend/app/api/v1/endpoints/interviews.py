from fastapi import APIRouter, Depends, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from app.core.database import get_db
from app.core.exceptions import APIException
from app.api.deps import get_current_user
from app.adapters.db_models import User
from app.domain.schemas import (
    InterviewGenerateRequest, 
    InterviewQuestionsResponse,
    AnswerEvaluationRequest,
    AnswerEvaluationResponse,
    AdaptiveQuestionRequest,
    AdaptiveQuestionResponse,
    ReportGenerateRequest
)
from app.repositories.user_repo import UserRepository
from app.core.question_generator import generate_questions
from app.core.report_generator import generate_pdf_report

router = APIRouter()
logger = logging.getLogger(__name__)

SUPPORTED_ROLES = ["Software Engineer", "Python Developer", "Data Scientist", "AI Engineer", "Full Stack Developer"]
SUPPORTED_LEVELS = ["Beginner", "Intermediate", "Expert", "Staff"]

@router.post("/generate", response_model=InterviewQuestionsResponse, status_code=status.HTTP_200_OK)
async def generate_interview_questions(
    payload: InterviewGenerateRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generates 10 personalized mock interview questions based on the candidate's target job role,
    experience level, and parsed database resume fields.
    """
    # 1. Input Validation
    if payload.role not in SUPPORTED_ROLES:
        raise APIException(
            f"Unsupported role '{payload.role}'. Supported roles are: {', '.join(SUPPORTED_ROLES)}",
            status_code=status.HTTP_400_BAD_REQUEST
        )
        
    if payload.experience_level not in SUPPORTED_LEVELS:
        raise APIException(
            f"Unsupported experience level '{payload.experience_level}'. Supported levels are: {', '.join(SUPPORTED_LEVELS)}",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    # 2. Fetch User Resume
    user_repo = UserRepository(db)
    resume = await user_repo.get_resume(current_user.id)
    
    resume_data = None
    if resume:
        resume_data = {
            "skills": resume.skills or [],
            "projects": resume.projects or [],
            "education": resume.education or [],
            "experience": resume.experience or [],
            "technologies": resume.technologies or [],
            "certifications": resume.certifications or []
        }
        
    # 3. Generate Questions using parser utility
    questions = generate_questions(
        role=payload.role,
        experience_level=payload.experience_level,
        resume_data=resume_data
    )
    
    return InterviewQuestionsResponse(
        role=payload.role,
        experience_level=payload.experience_level,
        questions=questions
    )

@router.post("/evaluate", response_model=AnswerEvaluationResponse, status_code=status.HTTP_200_OK)
async def evaluate_answer(
    payload: AnswerEvaluationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Evaluates the candidate's response to an interview question using Ollama (Llama 3.1).
    Extracts scores, detailed feedback, and triggers dynamic follow-up questions.
    """
    from app.core.ollama_client import evaluate_candidate_answer
    
    # Fetch user resume context if available to supply context
    user_repo = UserRepository(db)
    resume = await user_repo.get_resume(current_user.id)
    
    resume_summary = None
    if resume:
        resume_summary = (
            f"Technologies: {', '.join(resume.technologies or [])}. "
            f"Skills: {', '.join(resume.skills or [])}. "
            f"Projects: {', '.join(resume.projects or [])}."
        )
        
    # Trigger Ollama client processing
    evaluation = await evaluate_candidate_answer(
        role=payload.role,
        level=payload.experience_level,
        question=payload.question,
        answer=payload.answer,
        resume_summary=resume_summary
    )
    
    return AnswerEvaluationResponse(
        technical_score=evaluation.get("technical_score", 70),
        communication_score=evaluation.get("communication_score", 70),
        grammar_score=evaluation.get("grammar_score", 70),
        confidence_score=evaluation.get("confidence_score", 70),
        suggestions=evaluation.get("suggestions", []),
        correct_answer=evaluation.get("correct_answer", "No exemplar response available."),
        follow_up=evaluation.get("follow_up", "Let's move on to the next topic."),
        is_fallback=evaluation.get("is_fallback", False)
    )

@router.post("/next", response_model=AdaptiveQuestionResponse, status_code=status.HTTP_200_OK)
async def get_adaptive_next_question(
    payload: AdaptiveQuestionRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Dynamically scales difficulty level (Beginner, Intermediate, Expert, Staff)
    based on previous evaluation scores and returns the next appropriate question.
    """
    # 1. Calibrate difficulty level
    levels = ["Beginner", "Intermediate", "Expert", "Staff"]
    current_idx = levels.index(payload.current_level) if payload.current_level in levels else 1
    
    new_level = payload.current_level
    if payload.last_score >= 80:
        if current_idx < len(levels) - 1:
            new_level = levels[current_idx + 1]
            logger.info(f"Escalated difficulty from {payload.current_level} to {new_level}")
    elif payload.last_score <= 60:
        if current_idx > 0:
            new_level = levels[current_idx - 1]
            logger.info(f"Calibrated difficulty down from {payload.current_level} to {new_level}")
            
    # 2. Get technical questions for the role and new level
    from app.core.question_generator import TECH_QUESTION_BANK
    role_questions = TECH_QUESTION_BANK.get(payload.role, TECH_QUESTION_BANK["Software Engineer"])
    questions_at_level = role_questions.get(new_level, role_questions["Intermediate"])
    
    # 3. Pull first question text not in answered_questions list
    selected_question_text = None
    for q_text in questions_at_level:
        if q_text not in payload.answered_questions:
            selected_question_text = q_text
            break
            
    # If all were answered, fallback to any question not answered in other levels
    if not selected_question_text:
        for lvl in levels:
            for q_text in role_questions.get(lvl, []):
                if q_text not in payload.answered_questions:
                    selected_question_text = q_text
                    break
            if selected_question_text:
                break
                
    # Safeguard fallback
    if not selected_question_text:
        selected_question_text = "How do you design scalable APIs that handle concurrency and state syncing?"
        
    next_question = {
        "id": len(payload.answered_questions) + 1,
        "text": selected_question_text,
        "category": f"Core Technical ({new_level})"
    }
    
    return AdaptiveQuestionResponse(
        question=next_question,
        new_level=new_level
    )

@router.post("/report", status_code=status.HTTP_200_OK)
async def generate_interview_pdf_report(
    payload: ReportGenerateRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Compiles and streams a professional PDF report containing scores,
    webcam proctoring attention stats, QA logs, and suggestions.
    """
    try:
        data = {
            "role": payload.role,
            "experience_level": payload.experience_level,
            "resume_summary": payload.resume_summary,
            "eye_contact_rate": payload.eye_contact_rate,
            "face_presence_rate": payload.face_presence_rate,
            "head_movements": payload.head_movements,
            "dominant_emotion": payload.dominant_emotion,
            "qa_history": [
                {
                    "question": item.question,
                    "answer": item.answer,
                    "technical_score": item.technical_score,
                    "communication_score": item.communication_score,
                    "grammar_score": item.grammar_score,
                    "confidence_score": item.confidence_score,
                    "suggestions": item.suggestions,
                    "correct_answer": item.correct_answer
                }
                for item in payload.qa_history
            ]
        }
        
        pdf_buffer = generate_pdf_report(data)
        
        return StreamingResponse(
            pdf_buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=interview_report.pdf",
                "Access-Control-Expose-Headers": "Content-Disposition"
            }
        )
    except Exception as err:
        logger.error(f"Failed to generate PDF: {str(err)}")
        raise APIException(
            "An error occurred compiling the PDF report document.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
