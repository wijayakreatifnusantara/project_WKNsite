import asyncio
import os
import sys

# Add apps/server to path
sys.path.append(os.path.join(os.getcwd(), "apps", "server"))

from utils.supabase_client import supabase_client

async def check():
    employees_res = await supabase_client.get_employees()
    if employees_res and employees_res.get("data"):
        employees = employees_res["data"]
        print(f"Successfully retrieved employees. Total count in result: {len(employees)}")
        print(f"Sample employee keys: {list(employees[0].keys())}")
        
        # Get raw data from table
        res = supabase_client.client.table("employees").select("*").limit(1).execute()
        if res.data:
            print(f"Raw DB columns in employees: {list(res.data[0].keys())}")
        else:
            print("No raw employee rows to check columns.")
    else:
        print("No employees found in client.get_employees()")
        # Try raw select anyway
        try:
            res = supabase_client.client.table("employees").select("*").limit(1).execute()
            if res.data:
                print(f"Raw DB columns in employees: {list(res.data[0].keys())}")
        except Exception as e:
            print(f"Error querying employees table: {str(e)}")

    # Check system_configs table
    print("\nChecking 'system_configs' table...")
    try:
        res = supabase_client.client.table("system_configs").select("*").execute()
        print(f"system_configs exists! Rows count: {len(res.data)}")
        if res.data:
            print(f"Row data: {res.data}")
    except Exception as e:
        print(f"Failed to query system_configs table (might not exist): {str(e)}")

    # Check attendance table columns
    print("\nChecking 'attendance' table...")
    try:
        res = supabase_client.client.table("attendance").select("*").limit(1).execute()
        if res.data:
            print(f"Raw DB columns in attendance: {list(res.data[0].keys())}")
        else:
            print("attendance table exists but is empty.")
    except Exception as e:
        print(f"Failed to query attendance table: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check())
