import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
import fitz  # PyMuPDF
from app.core.database import get_db
from app.core.exceptions import APIException, NotFoundException
from app.api.deps import get_current_user
from app.adapters.db_models import User
from app.domain.schemas import ResumeResponse
from app.repositories.user_repo import UserRepository

router = APIRouter()

# Get uploads base directory relative to this file
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
UPLOADS_DIR = os.path.join(BASE_DIR, "uploads")

@router.post("/resume", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Uploads a PDF resume, extracts the text using PyMuPDF, and saves the text in PostgreSQL.
    """
    # 1. Enforce PDF format validation
    if not file.filename.lower().endswith(".pdf"):
        raise APIException("Only PDF resumes are supported.", status_code=status.HTTP_400_BAD_REQUEST)
    
    # Ensure uploads directory exists on disk
    os.makedirs(UPLOADS_DIR, exist_ok=True)
    
    # 2. Save physical file locally
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}_{file.filename}"
    file_path = os.path.join(UPLOADS_DIR, unique_filename)
    
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as err:
        raise APIException(f"Failed to write file: {str(err)}", status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    # 3. Extract text using PyMuPDF (fitz)
    try:
        doc = fitz.open(file_path)
        extracted_text = ""
        for page in doc:
            extracted_text += page.get_text()
        
        # If extraction returned empty, put a warning/placeholder
        if not extracted_text.strip():
            extracted_text = "[Warning: No extractable text found in this PDF file. Scanned images are not parsed.]"
    except Exception as err:
        # Clean up saved file if parsing failed
        if os.path.exists(file_path):
            os.remove(file_path)
        raise APIException(f"Failed to parse PDF resume: {str(err)}", status_code=status.HTTP_422_UNPROCESSABLE_ENTITY)
        
    # 4. Persist in PostgreSQL via Repository
    user_repo = UserRepository(db)
    resume = await user_repo.save_resume(
        user_id=current_user.id,
        filename=file.filename,
        file_path=file_path,
        raw_text=extracted_text
    )
    
    return resume

@router.get("/resume", response_model=ResumeResponse)
async def get_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retrieves the currently parsed resume for the authenticated user.
    """
    user_repo = UserRepository(db)
    resume = await user_repo.get_resume(current_user.id)
    if not resume:
        raise NotFoundException("No parsed resume found for this account. Please upload one first.")
    return resume
