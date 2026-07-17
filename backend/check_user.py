import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

user_id = "07c49610-ca88-4895-a1f1-69ae66ad77ee"

print("Checking user:", user_id)
try:
    # 1. Check if user exists
    res = supabase.table("users").select("*").eq("id", user_id).execute()
    print("User Data:", res.data)
    
    # 2. Check all users in table to see what's there
    all_users = supabase.table("users").select("id, full_name, email").limit(5).execute()
    print("Top 5 Users in table:", all_users.data)
    
except Exception as e:
    print("ERROR:", str(e))
