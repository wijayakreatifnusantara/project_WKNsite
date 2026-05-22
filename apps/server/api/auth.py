from fastapi import APIRouter, HTTPException, Depends, Request
from utils.supabase_client import supabase_client
from pydantic import BaseModel
from typing import Optional
from utils.jwt_handler import create_access_token, require_admin
import time
from collections import defaultdict

router = APIRouter()

# In-memory rate limiting configuration: max 5 requests per 60 seconds
login_attempts = defaultdict(list)
RATE_LIMIT_WINDOW = 60  # seconds
MAX_LOGIN_ATTEMPTS = 5

def get_client_ip(request: Request) -> str:
    """Extracts client IP address, supporting standard proxy headers"""
    x_forwarded_for = request.headers.get("X-Forwarded-For")
    if x_forwarded_for:
        return x_forwarded_for.split(",")[0].strip()
    x_real_ip = request.headers.get("X-Real-IP")
    if x_real_ip:
        return x_real_ip
    return request.client.host if request.client else "127.0.0.1"

def check_rate_limit(ip: str) -> bool:
    """Checks if the IP exceeds the allowed login attempts within the window"""
    now = time.time()
    # Filter attempts within the current window
    login_attempts[ip] = [t for t in login_attempts[ip] if now - t < RATE_LIMIT_WINDOW]
    
    if len(login_attempts[ip]) >= MAX_LOGIN_ATTEMPTS:
        return False
    
    login_attempts[ip].append(now)
    return True

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
async def login(login_data: LoginRequest, request: Request):
    """Authenticate user using Google Sheets admin_accounts (with Rate Limiting)"""
    client_ip = get_client_ip(request)
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Terlalu banyak percobaan login. Silakan coba lagi dalam 1 menit."
        )

    try:
        user = await supabase_client.authenticate_user(login_data.username, login_data.password)
        
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
