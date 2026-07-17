import os
from dotenv import load_dotenv
from supabase import create_client

load_dotenv()

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

user_id = "07c49610-ca88-4895-a1f1-69ae66ad77ee"

try:
    print("Testing standard update...")
    res = supabase.table("users").update({"full_name": "Harshwardhan Bhaskar"}).eq("id", user_id).execute()
    print("res.data:", res.data)
    
    print("\nTesting update with select()...")
    res_select = supabase.table("users").update({"full_name": "Harshwardhan Bhaskar"}).eq("id", user_id).select("*").execute()
    print("res_select.data:", res_select.data)
    
except Exception as e:
    print("ERROR:", str(e))
