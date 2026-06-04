import os
import asyncio
import sys
from dotenv import load_dotenv
from supabase import create_client, Client

# Add parent directory to path so we can import utils
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

load_dotenv()

async def sync_employees_to_auth():
    url = os.getenv("SUPABASE_URL")
    # For Admin API, SUPABASE_KEY must be the service_role key
    key = os.getenv("SUPABASE_KEY")
    
    if not url or not key:
        print("Missing SUPABASE_URL or SUPABASE_KEY")
        return

    client: Client = create_client(url, key)
    
    print("Fetching active employees...")
    # Get all employees that have an email and are not resigned
    response = client.table("employees").select("id, email, name, status, is_resigned").not_.is_("email", "null").neq("email", "").execute()
    
    employees = response.data
    print(f"Found {len(employees)} employees with email.")
    
    success_count = 0
    fail_count = 0
    
    for emp in employees:
        email = emp.get("email").strip()
        name = emp.get("name")
        is_resigned = emp.get("is_resigned")
        status = str(emp.get("status")).upper()
        
        if is_resigned or status == "RESIGNED":
            print(f"Skipping {email} (Resigned)")
            continue
            
        print(f"Creating Auth User for: {email}...")
        
        try:
            # We use '123456' because Supabase requires minimum 6 characters for password
            client.auth.admin.create_user({
                "email": email,
                "password": "123456",
                "email_confirm": True,
                "user_metadata": {"name": name}
            })
            success_count += 1
            print(f"  [OK] Created {email}")
        except Exception as e:
            err_msg = str(e).lower()
            if "already exists" in err_msg or "already registered" in err_msg or "duplicate" in err_msg:
                print(f"  [SKIP] User {email} already exists in Auth")
            else:
                print(f"  [ERROR] Failed for {email}: {str(e)}")
                fail_count += 1
                
    print("\n--- Sync Complete ---")
    print(f"Successfully Created: {success_count}")
    print(f"Failed: {fail_count}")

if __name__ == "__main__":
    asyncio.run(sync_employees_to_auth())
