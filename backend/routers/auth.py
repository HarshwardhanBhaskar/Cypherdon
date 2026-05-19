from fastapi import APIRouter, HTTPException
from schemas.users import UserRegisterRequest, UserLoginRequest
from services.supabase import supabase

router = APIRouter()


@router.post("/register", summary="Register a new user (minimal)")
def register_user(user: UserRegisterRequest):
    """Minimal signup: name + email + password only.
    Profile details are collected later at /complete-profile."""
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        # Register via Supabase Auth (sends verification email if enabled)
        res = supabase.auth.sign_up(
            {"email": user.email, "password": user.password}
        )
        if not res.user:
            raise HTTPException(status_code=400, detail="Registration failed")

        user_id = res.user.id

        # Store only the basics in the users table
        insert_data = {
            "id": user_id,
            "email": user.email,
            "full_name": user.full_name,
        }
        db_res = supabase.table("users").insert(insert_data).execute()
        return {"message": "User registered. Check email to verify.", "data": db_res.data}
    except Exception as e:
        error_msg = str(e)
        if "rate limit" in error_msg.lower():
            raise HTTPException(status_code=429, detail="Supabase rate limit exceeded. Please log in with your existing account or try again later.")
        raise HTTPException(status_code=400, detail=error_msg)


@router.post("/login", summary="Login user")
def login_user(user: UserLoginRequest):
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    res = supabase.auth.sign_in_with_password(
        {"email": user.email, "password": user.password}
    )
    if not res.session:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Return token + user_id so frontend can call /profile later
    return {
        "message": "Login successful",
        "access_token": res.session.access_token,
        "user_id": res.user.id,
    }


