from fastapi import APIRouter, HTTPException, Depends
from utils.supabase_client import supabase_client
from pydantic import BaseModel
from typing import Optional
from utils.jwt_handler import create_access_token, require_admin

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    status: str
    name: Optional[str] = None
    user: Optional[dict] = None
    token: Optional[str] = None
    message: Optional[str] = None

@router.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate user using Google Sheets admin_accounts"""
    try:
        user = await supabase_client.authenticate_user(request.username, request.password)
        
        if user:
            # Generate JWT Token containing username, role, and employee details
            token = create_access_token(
                data={
                    "sub": user.get("Username"),
                    "role": user.get("Role"),
                    "employee_id": user.get("employee_id"),
                    "is_field_team": user.get("is_field_team", False)
                }
            )
            
            # Clean up user object (redundant protection)
            user_clean = user.copy()
            if "Password" in user_clean:
                del user_clean["Password"]
                
            print(f"User {user.get('Full Name')} logged in successfully.")
            
            return LoginResponse(
                status="success",
                name=user.get("Full Name"),
                user=user_clean,
                token=token
            )
        else:
            return LoginResponse(
                status="error",
                message="Username/Password salah"
            )
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Authentication error: {str(e)}")

@router.get("/auth/admins")
async def get_admins(current_user: dict = Depends(require_admin)):
    """Get all admin accounts"""
    try:
        admins = await supabase_client.get_admins()
        return {"status": "success", "admins": admins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching admins: {str(e)}")
