import asyncio
import os
import sys

# Add apps/server to path
sys.path.append(os.path.join(os.getcwd(), "apps", "server"))

from utils.supabase_client import supabase_client

async def check():
    employees = await supabase_client.get_employees()
    if employees:
        print(f"Sample employee keys: {list(employees[0].keys())}")
        # Get raw data from table
        res = supabase_client.client.table("employees").select("*").limit(1).execute()
        if res.data:
            print(f"Raw DB columns: {list(res.data[0].keys())}")
            print(f"Sample raw data: {res.data[0]}")
    else:
        print("No employees found")

if __name__ == "__main__":
    asyncio.run(check())
