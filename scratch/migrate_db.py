import asyncio
import os
import sys

# Add apps/server to path
sys.path.append(os.path.join(os.getcwd(), "apps", "server"))

from utils.supabase_client import supabase_client

async def migrate():
    print("Attempting to add columns to 'employees' table...")
    try:
        # We can't run raw SQL directly via the client in standard Supabase
        # But we can try to use a common RPC if it exists, or just explain that it's not possible this way.
        
        # Let's try to just update a row with a new column and see if it fails.
        # This is a test.
        res = supabase_client.client.table("employees").update({"resign_date": "2026-05-01"}).eq("id", "WKN-001").execute()
        print("Update successful! Column might already exist or was auto-added (unlikely).")
    except Exception as e:
        print(f"Update failed (as expected if column missing): {str(e)}")
        print("\n--- SQL TO RUN IN SUPABASE DASHBOARD ---")
        print("ALTER TABLE employees ADD COLUMN IF NOT EXISTS resign_date TEXT;")
        print("ALTER TABLE employees ADD COLUMN IF NOT EXISTS is_resigned BOOLEAN DEFAULT FALSE;")
        print("---------------------------------------")

if __name__ == "__main__":
    asyncio.run(migrate())
