import bcrypt

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Memverifikasi kecocokan antara password plain-text dan hash Bcrypt secara langsung"""
    try:
        # bcrypt membutuhkan input bytes
        return bcrypt.checkpw(
            plain_password.encode('utf-8'),
            hashed_password.encode('utf-8')
        )
    except Exception as e:
        print(f"[SECURITY ERROR] Gagal melakukan verifikasi password: {str(e)}")
        return False

def get_password_hash(password: str) -> str:
    """Menghasilkan hash Bcrypt standar dari password plain-text secara langsung"""
    # bcrypt membutuhkan bytes
    pwd_bytes = password.encode('utf-8')
    # Generate salt dan hash
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode('utf-8')
