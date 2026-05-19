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


def get_profile_by_email(email: str) -> dict:
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    db_res = supabase.table("users").select("*").eq("email", email).execute()

    if not db_res.data:
        raise HTTPException(status_code=404, detail="User not found")

    return db_res.data[0]


def update_profile(user_id: str, profile_data: UserProfileUpdateRequest) -> dict:
    if not supabase:
        raise HTTPException(status_code=500, detail="Supabase not configured")

    update_data = profile_data.model_dump(exclude_unset=True)

    # Autofix links if they are present in update_data
    if "github_url" in update_data and update_data["github_url"]:
        update_data["github_url"] = autofix_link(update_data["github_url"], "github")
    if "linkedin_url" in update_data and update_data["linkedin_url"]:
        update_data["linkedin_url"] = autofix_link(update_data["linkedin_url"], "linkedin")
    if "portfolio_url" in update_data and update_data["portfolio_url"]:
        update_data["portfolio_url"] = autofix_link(update_data["portfolio_url"], "portfolio")

    # Execute update. In this supabase-py version, standard update returns empty data array.
    supabase.table("users").update(update_data).eq("id", user_id).execute()

    # Fetch and return the updated user record directly to bypass empty PostgREST representation returns
    return get_profile(user_id)

import re
from urllib.parse import urlparse, urlunparse
import httpx
import logging

logger = logging.getLogger(__name__)

def autofix_link(url: str, platform: str) -> str:
    """
    Cleans, normalizes and repairs common typos/missing parts of profile URLs.
    Supports 'github', 'linkedin', and general 'portfolio' links.
    """
    if not url:
        return url
        
    url = url.strip()
    platform = platform.lower()
    
    # If it is a simple handle/username (no dots, no slashes)
    if "." not in url and "/" not in url and "\\" not in url:
        if platform == "github":
            return f"https://github.com/{url}"
        elif platform == "linkedin":
            return f"https://linkedin.com/in/{url}"
        # For portfolio/other, a simple username can't be resolved, but keep it
        return url

    # Replace backslashes with standard forward slashes
    url = url.replace("\\", "/")

    # Standardize protocol domain-level typos first
    if platform == "github":
        url = re.sub(r'(?i)git-hub', 'github', url)
        url = re.sub(r'(?i)githb', 'github', url)
        url = re.sub(r'(?i)githup', 'github', url)
        url = re.sub(r'(?i)github\.co(?![\w\.])', 'github.com', url)
        url = re.sub(r'(?i)github\.con', 'github.com', url)
    elif platform == "linkedin":
        url = re.sub(r'(?i)linkdin', 'linkedin', url)
        url = re.sub(r'(?i)linked-in', 'linkedin', url)
        url = re.sub(r'(?i)linkedin\.co(?![\w\.])', 'linkedin.com', url)
        url = re.sub(r'(?i)linkedin\.con', 'linkedin.com', url)

    # Force HTTPS protocol
    if not (url.lower().startswith("http://") or url.lower().startswith("https://")):
        url = "https://" + url
    elif url.lower().startswith("http://"):
        url = "https://" + url[7:]

    # Enforce path structures
    if platform == "linkedin":
        try:
            parsed = urlparse(url)
            netloc = parsed.netloc.lower()
            path = parsed.path
            
            if "linkedin.com" in netloc:
                # Split path by slashes and filter out empty strings
                segments = [s for s in path.split("/") if s]
                
                exempt_paths = {"in", "pub", "profile", "company", "school", "posts", "feed", "jobs"}
                
                # Inject "in" segment if missing from a personal URL
                if segments and segments[0].lower() not in exempt_paths:
                    new_path = "/in/" + "/".join(segments)
                    parsed = parsed._replace(path=new_path)
                    url = urlunparse(parsed)
        except Exception as e:
            logger.warning(f"Error parsing linkedin url for path injection: {e}")

    return url


def verify_link_active(url: str) -> str:
    """
    Validates a URL link. Returns:
    - 'valid': Link returns a 200/3xx code or is a secure platform blocking headless requests.
    - 'broken': Link returns a definitive 404 Not Found error.
    - 'invalid_format': Link does not match a valid URL syntax.
    - 'empty': URL is empty or None.
    """
    if not url:
        return 'empty'
    
    url = url.strip()
    if not (url.startswith("http://") or url.startswith("https://")):
        return 'invalid_format'
        
    try:
        # Standard User-Agent to prevent naive bot-blocking
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        }
        with httpx.Client(timeout=3.0, follow_redirects=True, headers=headers) as client:
            # HEAD request check
            try:
                res = client.head(url)
                if res.status_code in [200, 301, 302, 307, 308]:
                    return 'valid'
            except Exception:
                pass
            
            # GET request fallback
            res_get = client.get(url)
            if res_get.status_code == 404:
                return 'broken'
            
            # Any non-404 code (like 403, 401, 999 for cloud security challenges) is assumed 'valid' 
            # to avoid false-positives caused by cloud firewalls blocking headless scripts.
            return 'valid'
    except Exception as e:
        logger.warning(f"Link check failed for {url}: {e}")
        # Network errors are not counted as broken to prevent lockouts on offline links
        return 'valid'


def check_profile_links(profile: dict) -> dict:
    """Verifies github_url, linkedin_url, and portfolio_url in a profile."""
    return {
        "github": verify_link_active(profile.get("github_url")),
        "linkedin": verify_link_active(profile.get("linkedin_url")),
        "portfolio": verify_link_active(profile.get("portfolio_url"))
    }

