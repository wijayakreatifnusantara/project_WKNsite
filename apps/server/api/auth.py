"""
Authentication API using MCP Google Sheets
"""

from fastapi import APIRouter, HTTPException
from utils.supabase_client import supabase_client
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    status: str
    name: Optional[str] = None
    user: Optional[dict] = None
    message: Optional[str] = None

@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate user using Google Sheets admin_accounts"""
    try:
        user = await supabase_client.authenticate_user(request.username, request.password)
        
        if user:
            # Note: add_system_log needs implementation in supabase_client
            # For now we skip or log to console
            print(f"User {user.get('full_name')} logged in successfully.")
            
            return LoginResponse(
                status="success",
                name=user.get("full_name"),
                user=user
            )
        else:
            return LoginResponse(
                status="error",
                message="Username/Password salah"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

@router.get("/auth/admins")
async def get_admins():
    """Get all admin accounts"""
    try:
        admins = await supabase_client.get_admins()
        return {"status": "success", "admins": admins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching admins: {str(e)}")
