from fastapi import APIRouter, Depends, HTTPException
from schemas.profile import UserProfileResponse, UserProfileUpdateRequest
from services.profile import get_profile, update_profile, get_profile_by_email
from services.auth_dep import get_current_user_id
from routers.upload import verify_service_token

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


@router.get("/public/{user_id}", response_model=UserProfileResponse, summary="Get public user profile (Premium only)")
def fetch_public_user_profile(user_id: str):
    """Fetch profile of user_id anonymously. Only allowed if user is premium."""
    profile = get_profile(user_id)
    if profile.get("tier") != "premium":
        raise HTTPException(
            status_code=403,
            detail="Portfolio sharing requires a premium subscription."
        )
    return profile


@router.get("/internal/by-email/{email}", response_model=UserProfileResponse, summary="Get user profile by email (Internal Service)")
def fetch_internal_profile_by_email(email: str, dependencies: str = Depends(verify_service_token)):
    """Fetch profile details internally by email, secured by service token."""
    return get_profile_by_email(email)
