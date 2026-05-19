import sys
import os
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient

# Add parent directory to path so imports work correctly
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app
from services.auth_dep import get_current_user_id

client = TestClient(app)

# Dummy profiles for testing
MOCK_FREE_PROFILE = {
    "id": "free_user_id_123",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "tier": "free",
    "skills": ["React", "CSS"],
    "experience_level": "entry"
}

MOCK_PREMIUM_PROFILE = {
    "id": "premium_user_id_456",
    "full_name": "Harshwardhan Bhaskar",
    "email": "premium@example.com",
    "tier": "premium",
    "skills": ["React", "Python", "FastAPI", "Spring Boot"],
    "experience_level": "senior"
}

def test_health_check():
    """Verify backend health endpoint is online and functioning."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

@patch("services.auth_dep.supabase")
def test_unauthorized_profile_access(mock_supabase):
    """Test that requesting a profile without bearer token results in 403."""
    response = client.get("/api/profile/")
    assert response.status_code == 403

@patch("routers.profile.get_profile")
def test_authorized_profile_access(mock_get_profile):
    """Test that an authorized user can retrieve their own profile."""
    # Setup mock return value
    mock_get_profile.return_value = MOCK_PREMIUM_PROFILE
    
    # Bypass auth dependency with mock override
    app.dependency_overrides[get_current_user_id] = lambda: "premium_user_id_456"
    
    response = client.get("/api/profile/", headers={"Authorization": "Bearer fake_token"})
    assert response.status_code == 200
    assert response.json()["email"] == "premium@example.com"
    assert response.json()["tier"] == "premium"
    
    # Reset override
    app.dependency_overrides.clear()

@patch("routers.profile.get_profile")
def test_public_profile_free_user(mock_get_profile):
    """Test that a free user profile is gated and portfolio is locked with 403."""
    mock_get_profile.return_value = MOCK_FREE_PROFILE
    
    response = client.get("/api/profile/public/free_user_id_123")
    assert response.status_code == 403
    assert "premium subscription" in response.json()["detail"].lower()

@patch("routers.profile.get_profile")
def test_public_profile_premium_user(mock_get_profile):
    """Test that a premium user portfolio can be accessed publicly with 200."""
    mock_get_profile.return_value = MOCK_PREMIUM_PROFILE
    
    response = client.get("/api/profile/public/premium_user_id_456")
    assert response.status_code == 200
    assert response.json()["full_name"] == "Harshwardhan Bhaskar"
    assert response.json()["tier"] == "premium"
