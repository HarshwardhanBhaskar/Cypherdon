import os
from supabase import create_client, Client
from dotenv import load_dotenv
import logging

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

logger = logging.getLogger("api")

def get_supabase_client() -> Client:
    if not SUPABASE_URL or not SUPABASE_KEY:
        logger.warning("Supabase URL or Key is missing. Using placeholder client or expect errors.")
        return None
        
    return create_client(SUPABASE_URL, SUPABASE_KEY)

supabase = get_supabase_client()
