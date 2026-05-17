from fastapi import APIRouter, Depends
from schemas.profile import UserProfileResponse, UserProfileUpdateRequest
from services.profile import get_profile, update_profile
from services.auth_dep import get_current_user_id

router = APIRouter()

@router.get("/", response_model=UserProfileResponse, summary="Get current user profile")
def fetch_user_profile(user_id: str = Depends(get_current_user_id)):
    """Fetch the authenticated user's complete profile."""
    return get_profile(user_id)


@router.put("/", response_model=UserProfileResponse, summary="Update user profile")
def modify_user_profile(
    profile_data: UserProfileUpdateRequest,
    user_id: str = Depends(get_current_user_id)
):
    """
    Update the authenticated user's profile.
    Only fields provided in the payload will be updated (exclude_unset=True).
    """
    return update_profile(user_id, profile_data)
