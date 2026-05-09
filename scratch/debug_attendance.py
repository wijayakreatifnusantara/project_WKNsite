import asyncio
import sys
import os

# Add apps/server to sys.path
sys.path.append(os.path.abspath("apps/server"))

from utils.supabase_client import supabase_client

async def main():
    try:
        # Fetching one row to see columns
        res = supabase_client.client.table("attendance").select("*").limit(1).execute()
        if res.data:
            print("COLUMNS:", list(res.data[0].keys()))
        else:
            # Table might be empty, try to get column names via RPC or just assume it's empty
            print("TABLE_EMPTY_OR_NOT_FOUND")
    except Exception as e:
        print("ERROR:", str(e))

if __name__ == "__main__":
    asyncio.run(main())
