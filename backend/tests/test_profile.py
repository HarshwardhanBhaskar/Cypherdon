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


from services.profile import autofix_link

def test_autofix_link_github():
    """Verify GitHub profile link repairs (handles, typos, protocols)."""
    # Simple handle
    assert autofix_link("octocat", "github") == "https://github.com/octocat"
    # Missing protocol
    assert autofix_link("github.com/octocat", "github") == "https://github.com/octocat"
    # HTTP protocol to HTTPS
    assert autofix_link("http://github.com/octocat", "github") == "https://github.com/octocat"
    # Typos in domain name
    assert autofix_link("git-hub.com/octocat", "github") == "https://github.com/octocat"
    assert autofix_link("githb.com/octocat", "github") == "https://github.com/octocat"
    assert autofix_link("githup.com/octocat", "github") == "https://github.com/octocat"
    assert autofix_link("github.co/octocat", "github") == "https://github.com/octocat"
    assert autofix_link("github.con/octocat", "github") == "https://github.com/octocat"
    # Backslashes
    assert autofix_link("github.com\\octocat", "github") == "https://github.com/octocat"

def test_autofix_link_linkedin():
    """Verify LinkedIn profile link repairs (handles, typos, missing /in/, and exclusions)."""
    # Simple handle
    assert autofix_link("john-doe", "linkedin") == "https://linkedin.com/in/john-doe"
    # Missing protocol and missing /in/ path
    assert autofix_link("linkedin.com/john-doe", "linkedin") == "https://linkedin.com/in/john-doe"
    # Correct URL left intact (with protocol)
    assert autofix_link("https://www.linkedin.com/in/john-doe", "linkedin") == "https://www.linkedin.com/in/john-doe"
    # Typo and missing /in/
    assert autofix_link("linkdin.com/john-doe", "linkedin") == "https://linkedin.com/in/john-doe"
    assert autofix_link("linked-in.com/john-doe", "linkedin") == "https://linkedin.com/in/john-doe"
    # Exempt pages not having /in/ injected
    assert autofix_link("https://linkedin.com/company/tesla", "linkedin") == "https://linkedin.com/company/tesla"
    assert autofix_link("https://www.linkedin.com/jobs/view/12345", "linkedin") == "https://www.linkedin.com/jobs/view/12345"

def test_autofix_link_portfolio():
    """Verify general portfolio/other link repairs."""
    # General URL prepends protocol
    assert autofix_link("myportfolio.com", "portfolio") == "https://myportfolio.com"
    # HTTP upgraded to HTTPS
    assert autofix_link("http://myportfolio.co.uk/home", "portfolio") == "https://myportfolio.co.uk/home"
    # Empty/None
    assert autofix_link("", "portfolio") == ""
    assert autofix_link(None, "portfolio") is None

