import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

try:
    # Try fetching one user to see if the columns exist
    res = supabase.table("users").select("address, linkedin_url, preferred_role").limit(1).execute()
    print("SUCCESS: Columns exist!", res.data)
except Exception as e:
    import json
    try:
        print("ERROR:", json.dumps(e.args[0], indent=2))
    except:
        print("ERROR:", str(e))
