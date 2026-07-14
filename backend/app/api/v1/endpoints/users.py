from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.exceptions import APIException
from app.core.security import verify_password
from app.domain.schemas import UserResponse, UserUpdate
from app.api.deps import get_current_user
from app.adapters.db_models import User
from app.repositories.user_repo import UserRepository

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_profile(current_user: User = Depends(get_current_user)):
    """
    Retrieves the current authenticated user's profile.
    """
    return current_user

@router.put("/me", response_model=UserResponse)
async def update_profile(
    user_in: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the authenticated user's profile info (e.g. full name or password).
    """
    user_repo = UserRepository(db)
    
    # If the user is trying to change password
    if user_in.new_password:
        if not user_in.current_password:
            raise APIException(
                "Current password is required to set a new password.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
        if not verify_password(user_in.current_password, current_user.hashed_password):
            raise APIException(
                "Verification of current password failed.",
                status_code=status.HTTP_400_BAD_REQUEST
            )
            
    updated_user = await user_repo.update(db_user=current_user, user_in=user_in)
    return updated_user
