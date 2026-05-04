from fastapi import HTTPException
from services.supabase import supabase
from schemas.profile import UserProfileUpdateRequest

def get_profile(user_id: str) -> dict:
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    db_res = supabase.table("users").select("*").eq("id", user_id).execute()

    if not db_res.data:
        raise HTTPException(status_code=404, detail="User not found")

    return db_res.data[0]


def update_profile(user_id: str, profile_data: UserProfileUpdateRequest) -> dict:
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    update_data = profile_data.model_dump(exclude_unset=True)

    db_res = (
        supabase.table("users")
        .update(update_data)
        .eq("id", user_id)
        .execute()
    )

    if not db_res.data:
        raise HTTPException(status_code=404, detail="Failed to update. User not found.")

    return db_res.data[0]
