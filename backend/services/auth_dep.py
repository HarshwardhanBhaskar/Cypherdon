from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from services.supabase import supabase

security = HTTPBearer()

def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """
    Extracts the JWT token from the Authorization header,
    verifies it with Supabase, and returns the authenticated user's ID.
    """
    token = credentials.credentials
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    try:
        # Verify the token with Supabase Auth
        res = supabase.auth.get_user(token)
        if not res.user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return res.user.id
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Authentication failed: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
