import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv("d:/project_WKNsite/apps/server/.env")
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

tables = [
    "profiles", "role_permissions", "employee_schedules"
]

supabase: Client = create_client(url, key)

for t in tables:
    try:
        res = supabase.table(t).select("*").limit(1).execute()
        print(f"Table '{t}' exists.")
    except Exception as e:
        print(f"Table '{t}' missing or error: {e}")
