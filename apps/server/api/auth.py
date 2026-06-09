from fastapi import APIRouter, HTTPException, Depends, Request
from utils.supabase_client import supabase_client
from pydantic import BaseModel
from typing import Optional
from utils.jwt_handler import create_access_token, require_admin, get_current_user
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
            role = user.get("Role")
            
            # Fetch permissions for this role (Optimized with Cache)
            permissions = []
            if role:
                try:
                    cache_key = f"role_perms_{role.lower()}"
                    # Simple in-memory cache for 1 hour to speed up login
                    if cache_key in supabase_client._cache:
                        cached_perms, timestamp = supabase_client._cache[cache_key]
                        if time.time() - timestamp < 3600:
                            permissions = cached_perms
                    
                    if not permissions:
                        res = supabase_client.client.table("role_permissions").select("permission_name").eq("role_name", role.lower()).execute()
                        if res.data:
                            permissions = [p["permission_name"] for p in res.data]
                            supabase_client._cache[cache_key] = (permissions, time.time())
                except Exception as e:
                    print(f"Error fetching permissions: {e}")

            # Generate JWT Token containing username, role, permissions, and employee details
            token = create_access_token(
                data={
                    "sub": user.get("Username"),
                    "role": role,
                    "permissions": permissions,
                    "employee_id": user.get("employee_id"),
                    "is_field_team": user.get("is_field_team", False)
                }
            )
            
            # Clean up user object (redundant protection)
            user_clean = user.copy()
            if "Password" in user_clean:
                del user_clean["Password"]
            
            user_clean["permissions"] = permissions
                
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
    """Get all admin accounts (Legacy)"""
    try:
        admins = await supabase_client.get_admins()
        return {"status": "success", "admins": admins}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching admins: {str(e)}")

# --- PROFILES MANAGEMENT (Web Admin) ---

class ProfileCreate(BaseModel):
    username: str
    full_name: str
    password: str
    role: str = "staff"
    is_active: bool = True

class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/auth/profiles")
async def get_profiles(current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table("profiles").select("*").order("created_at", desc=True).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching profiles: {str(e)}")

@router.post("/auth/profiles")
async def create_profile(profile: ProfileCreate, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table("profiles").insert([profile.dict()]).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating profile: {str(e)}")

@router.put("/auth/profiles/{profile_id}")
async def update_profile(profile_id: int, profile: ProfileUpdate, current_user: dict = Depends(require_admin)):
    try:
        update_data = {k: v for k, v in profile.dict().items() if v is not None}
        response = supabase_client.client.table("profiles").update(update_data).eq("id", profile_id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating profile: {str(e)}")

@router.delete("/auth/profiles/{profile_id}")
async def delete_profile(profile_id: int, current_user: dict = Depends(require_admin)):
    try:
        response = supabase_client.client.table("profiles").delete().eq("id", profile_id).execute()
        return {"status": "success", "data": response.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting profile: {str(e)}")


class EmployeeLoginRequest(BaseModel):
    email: str
    password: str

class EmployeePasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str

@router.post("/auth/employee/login")
async def employee_login(login_data: EmployeeLoginRequest, request: Request):
    client_ip = get_client_ip(request)
    if not check_rate_limit(client_ip):
        raise HTTPException(
            status_code=429,
            detail="Terlalu banyak percobaan login. Silakan coba lagi."
        )

    try:
        employee = await supabase_client.authenticate_employee(login_data.email, login_data.password)
        if employee:
            token = create_access_token(
                data={
                    "sub": employee.get("email"),
                    "role": "employee",
                    "employee_id": employee.get("id"),
                    "is_field_team": employee.get("is_field_team", False)
                }
            )
            return {
                "status": "success",
                "employee": employee,
                "token": token
            }
        else:
            return {"status": "error", "message": "Email atau Password salah"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/auth/employee/verify-password")
async def employee_verify_password(login_data: EmployeeLoginRequest, current_user: dict = Depends(get_current_user)):
    try:
        employee = await supabase_client.authenticate_employee(login_data.email, login_data.password)
        if employee and employee.get("id") == current_user.get("employee_id"):
            return {"status": "success"}
        else:
            return {"status": "error", "message": "Password salah"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@router.post("/auth/employee/change-password")
async def employee_change_password(data: EmployeePasswordChangeRequest, current_user: dict = Depends(get_current_user)):
    try:
        # In get_current_user, 'sub' is mapped to 'username'
        email = current_user.get("username")
        employee = await supabase_client.authenticate_employee(email, data.current_password)
        if not employee:
            return {"status": "error", "message": "Password saat ini salah"}
            
        success = await supabase_client.update_employee_password(current_user.get("employee_id"), data.new_password)
        if success:
            return {"status": "success"}
        else:
            return {"status": "error", "message": "Gagal merubah password"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")
