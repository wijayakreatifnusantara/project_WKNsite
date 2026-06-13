import os
from datetime import datetime, timezone, timedelta
from typing import Optional
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv

# Memuat environment variables dari file .env
load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "default_secure_secret_key_wkn_2026")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))

# CRITICAL SAFETY CHECK: Assert strong secret in production
ENVIRONMENT = os.getenv("ENVIRONMENT", "development").lower()
if ENVIRONMENT == "production" and SECRET_KEY == "default_secure_secret_key_wkn_2026":
    import logging
    logging.warning(
        "CRITICAL SECURITY WARNING: Running in production with the default fallback JWT_SECRET! "
        "Please configure a strong, unique JWT_SECRET in your environment immediately."
    )

# Lokasi endpoint untuk login guna otorisasi Swagger UI
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/auth/login", auto_error=False)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Membuat token JWT dengan data payload dan waktu kedaluwarsa"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: Optional[str] = Depends(oauth2_scheme)) -> dict:
    """
    Dependency untuk memverifikasi token JWT pada endpoint API.
    Mengembalikan data payload user jika token valid.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Sesi Anda tidak valid atau telah berakhir. Silakan login kembali.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        raise credentials_exception

    try:
        # 1. Coba decode sebagai token admin internal
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        role: str = payload.get("role")
        permissions: list = payload.get("permissions", [])
        employee_id: str = payload.get("employee_id")
        is_field_team: bool = payload.get("is_field_team", False)
        
        if username is None:
            raise credentials_exception
            
        return {
            "username": username,
            "role": role,
            "permissions": permissions,
            "employee_id": employee_id,
            "is_field_team": is_field_team
        }
    except JWTError:
        # 2. Jika gagal, coba periksa apakah ini adalah token dari Supabase (Mobile App)
        try:
            unverified_claims = jwt.get_unverified_claims(token)
            if unverified_claims.get("aud") == "authenticated" or "supabase" in str(unverified_claims.get("iss", "")):
                from utils.supabase_client import supabase_client
                user_res = supabase_client.client.auth.get_user(token)
                if user_res and user_res.user:
                    email = user_res.user.email
                    # Ambil data employee dari database
                    emp_res = supabase_client.client.table("employees").select("*").eq("email", email).execute()
                    if emp_res.data:
                        employee = emp_res.data[0]
                        return {
                            "username": email,
                            "role": "employee",
                            "permissions": [],
                            "employee_id": employee["id"],
                            "is_field_team": employee.get("is_field_team", False)
                        }
        except Exception as e:
            pass
            
        raise credentials_exception

def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency untuk membatasi akses endpoint hanya untuk Admin / Owner.
    """
    role = current_user.get("role", "").lower()
    if role not in ["admin", "owner"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Akses ditolak. Anda memerlukan hak akses Administrator."
        )
    return current_user
