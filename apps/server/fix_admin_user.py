import asyncio
import os
from dotenv import load_dotenv
from utils.supabase_client import WKNSupabaseClient
from utils.security import get_password_hash, verify_password

async def main():
    print("Checking user adianto@wijayakn.com in profiles table...")
    client = WKNSupabaseClient()
    
    if not client.client:
        print("Failed to init client")
        return
        
    res = client.client.table("profiles").select("*").ilike("username", "adianto@wijayakn.com").execute()
    if not res.data:
        print("User not found!")
        # Create user
        hashed = get_password_hash("admin")
        print("Creating user with hashed password...")
        client.client.table("profiles").insert({
            "username": "adianto@wijayakn.com",
            "password": hashed,
            "full_name": "Adianto",
            "role": "admin",
            "status": "Active"
        }).execute()
        print("Created successfully.")
    else:
        user = res.data[0]
        print(f"User found: {user['username']}")
        if verify_password("admin", user['password']):
            print("Password matches!")
        else:
            print("Password does NOT match! Updating it...")
            hashed = get_password_hash("admin")
            client.client.table("profiles").update({"password": hashed}).eq("id", user["id"]).execute()
            print("Password updated successfully.")

if __name__ == "__main__":
    asyncio.run(main())
