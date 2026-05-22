import os
import sys
from dotenv import load_dotenv

# Menambahkan apps/server ke python path agar bisa mengimpor modul
sys.path.append(os.path.join(os.path.dirname(__file__), "apps", "server"))

from utils.supabase_client import supabase_client
from utils.security import get_password_hash

# Memuat variabel lingkungan
load_dotenv(dotenv_path=os.path.join("apps", "server", ".env"))

def migrate_passwords(dry_run=True):
    print("=== SKRIP MIGRASI ENKRIPSI PASSWORD WKNsite ===")
    if dry_run:
        print("[MODE] SIMULASI (Dry Run) - Tidak ada data yang diubah di database.")
    else:
        print("[MODE] EKSEKUSI NYATA - Perubahan akan langsung disimpan ke database.")

    if not supabase_client.client:
        print("[ERROR] Koneksi Supabase gagal diinisialisasi. Cek konfigurasi .env!")
        return

    try:
        # Fetch all user profiles from Supabase
        print("\n[1/3] Mengambil data user dari tabel 'profiles'...")
        response = supabase_client.client.table("profiles").select("*").execute()
        
        if not response.data:
            print("[INFO] Tidak ada profil user yang ditemukan.")
            return

        users = response.data
        print(f"[SUCCESS] Berhasil mengambil {len(users)} user.")

        print("\n[2/3] Menganalisis password...")
        to_update = []
        for user in users:
            username = user.get("username")
            password = user.get("password")
            role = user.get("role")
            
            # Ciri bcrypt hash adalah panjangnya 60 karakter dan dimulai dengan $2b$ atau $2y$ atau $2a$
            is_hashed = (
                isinstance(password, str) and 
                len(password) == 60 and 
                (password.startswith("$2b$") or password.startswith("$2a$") or password.startswith("$2y$"))
            )
            
            if is_hashed:
                print(f" - [{role}] {username}: Password SUDAH terenkripsi (Aman).")
            else:
                hashed = get_password_hash(password)
                to_update.append((username, password, hashed))
                print(f" - [{role}] {username}: Password MASIH plain-text (Memerlukan Migrasi).")

        if not to_update:
            print("\n[INFO] Semua user sudah terenkripsi. Tidak ada tindakan diperlukan.")
            return

        print(f"\n[3/3] Memproses enkripsi untuk {len(to_update)} user...")
        for username, plain, hashed in to_update:
            if dry_run:
                print(f" [SIMULASI] Mengenkripsi {username}...")
            else:
                print(f" [MIGRASI] Mengenkripsi {username} di database...")
                res = supabase_client.client.table("profiles") \
                    .update({"password": hashed}) \
                    .eq("username", username) \
                    .execute()
                if res.data:
                    print(f" [SUCCESS] User {username} berhasil dimigrasi ke hash Bcrypt.")
                else:
                    print(f" [FAILED] Gagal memperbarui user {username}.")

        print("\n=== PROSES MIGRASI SELESAI ===")
        if dry_run:
            print("[INFO] Silakan jalankan skrip ini dengan argumen '--execute' untuk menerapkan perubahan nyata.")

    except Exception as e:
        print(f"\n[CRITICAL ERROR] Terjadi kesalahan fatal: {str(e)}")

if __name__ == "__main__":
    execute_mode = "--execute" in sys.argv
    migrate_passwords(dry_run=not execute_mode)
