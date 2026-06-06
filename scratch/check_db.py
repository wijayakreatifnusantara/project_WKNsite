import asyncio
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), '../apps/server'))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__), '../apps/server/.env'))

from utils.supabase_client import WKNSupabaseClient

async def main():
    try:
        client = WKNSupabaseClient()
        if not client.client:
            print("Failed to initialize Supabase client")
            return
            
        tables_to_check = ["employees", "profiles", "organizations", "departments", "attendance"]
        for table in tables_to_check:
            print(f"Fetching {table}...")
            res = client.client.table(table).select("id", count="exact").execute()
            print(f"Count for {table}: {res.count}")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(main())
