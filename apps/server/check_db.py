import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv("d:/project_WKNsite/apps/server/.env")

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

supabase: Client = create_client(url, key)

try:
    res = supabase.table("employees").select("fcm_token").limit(1).execute()
    print("Column exists:", res.data)
except Exception as e:
    print("Error:", e)
