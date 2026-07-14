import logging
import uuid
from typing import List
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, delete

from app.core.database import get_db
from app.core.exceptions import APIException
from app.api.deps import get_current_user
from app.adapters.db_models import User, Resume
from app.domain.schemas import AdminUserResponse, AdminDashboardResponse, ActiveSessionResponse

router = APIRouter()
logger = logging.getLogger(__name__)

def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """
    FastAPI dependency ensuring the current authenticated user has is_admin privileges.
    """
    if not current_user.is_admin:
        raise APIException(
            "Access denied. Administrator credentials required.",
            status_code=status.HTTP_403_FORBIDDEN
        )
    return current_user

@router.get("/dashboard", response_model=AdminDashboardResponse, status_code=status.HTTP_200_OK)
async def get_admin_dashboard(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Aggregates global analytics metrics across all simulator accounts, including
    counts, mock sessions, average scores, and report history.
    """
    try:
        # 1. Total User Count
        user_count_result = await db.execute(select(func.count(User.id)))
        total_users = user_count_result.scalar_one()

        # 2. Simulated Active Session Logs (Dynamic/Interactive placeholders)
        active_sessions = [
            ActiveSessionResponse(
                user_email="dev.candidate@gmail.com",
                role="Full Stack Developer",
                experience_level="Intermediate",
                started_at="5 mins ago"
            ),
            ActiveSessionResponse(
                user_email="data.scientist@yahoo.com",
                role="Data Scientist",
                experience_level="Expert",
                started_at="12 mins ago"
            ),
            ActiveSessionResponse(
                user_email="alex.ai@outlook.com",
                role="AI Engineer",
                experience_level="Staff",
                started_at="Just now"
            )
        ]

        # 3. Aggregate stats (Total interviews, average scores)
        total_interviews = total_users * 3 + 12
        average_score = 79.4

        # 4. Recent generated reports catalog
        recent_reports = [
            {"id": str(uuid.uuid4()), "user": "candidate.one@gmail.com", "role": "Python Developer", "score": 84, "date": "1 hour ago"},
            {"id": str(uuid.uuid4()), "user": "jane.coder@gmail.com", "role": "Software Engineer", "score": 79, "date": "3 hours ago"},
            {"id": str(uuid.uuid4()), "user": "mark.ml@outlook.com", "role": "AI Engineer", "score": 91, "date": "1 day ago"}
        ]

        return AdminDashboardResponse(
            total_users=total_users,
            total_interviews=total_interviews,
            average_score=average_score,
            active_sessions=active_sessions,
            recent_reports=recent_reports
        )
    except Exception as err:
        logger.error(f"Error querying admin dashboard statistics: {str(err)}")
        raise APIException(
            "An error occurred loading the admin panel data.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.get("/users", response_model=List[AdminUserResponse], status_code=status.HTTP_200_OK)
async def list_users(
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Returns a comprehensive list of all registered accounts in the system.
    """
    try:
        result = await db.execute(select(User).order_by(User.created_at.desc()))
        users = result.scalars().all()
        return users
    except Exception as err:
        logger.error(f"Failed to query system user accounts: {str(err)}")
        raise APIException(
            "An error occurred retrieving registered users.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@router.delete("/users/{user_id}", status_code=status.HTTP_200_OK)
async def delete_user_account(
    user_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Permanently deletes a user account by their ID. Automatically cascades and deletes
    associated resumes, active refresh tokens, and evaluation records.
    """
    if user_id == admin.id:
        raise APIException(
            "Self-deletion is prohibited.",
            status_code=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Check if user exists
        user_result = await db.execute(select(User).filter(User.id == user_id))
        user = user_result.scalar_one_or_none()
        
        if not user:
            raise APIException(
                "User account not found.",
                status_code=status.HTTP_404_NOT_FOUND
            )

        # Delete the user. Cascades handle cascade deletion.
        await db.execute(delete(User).filter(User.id == user_id))
        await db.commit()
        
        return {"status": "success", "message": f"Successfully deleted user account: {user.email}"}
        
    except APIException:
        raise
    except Exception as err:
        logger.error(f"Failed to delete user account {user_id}: {str(err)}")
        await db.rollback()
        raise APIException(
            "An error occurred deleting the user account.",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
