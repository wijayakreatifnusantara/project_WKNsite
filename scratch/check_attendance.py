import asyncio
import sys
import os

# Add apps/server to sys.path
sys.path.append(os.path.abspath("apps/server"))

from utils.supabase_client import supabase_client

async def main():
    attendance = await supabase_client.get_attendance()
    if attendance:
        print("KEYS:", list(attendance[0].keys()))
        print("SAMPLE:", attendance[0])
    else:
        print("NO_DATA")

if __name__ == "__main__":
    asyncio.run(main())
