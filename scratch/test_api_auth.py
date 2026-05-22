import requests

BASE_URL = "http://localhost:8000/api"

def run_tests():
    print("=== AUTOMATED API SECURITY VERIFICATION ===")
    
    # 1. Test hitting protected endpoint without token
    print("\n[TEST 1] Mengakses data karyawan tanpa token...")
    try:
        res = requests.get(f"{BASE_URL}/employees")
        print(f"Status Code: {res.status_code}")
        print(f"Response: {res.json()}")
        if res.status_code == 401:
            print("[SUCCESS] Endpoint terproteksi dengan baik! (401 Unauthorized)")
        else:
            print("[FAIL] Kerentanan terdeteksi! Endpoint dapat diakses tanpa token.")
    except Exception as e:
        print(f"[FAIL] Error menghubungkan ke server: {str(e)}")

    # 2. Test authenticating with valid credentials
    print("\n[TEST 2] Mencoba login dengan akun owner (adianto@wijayakn.com)...")
    token = None
    try:
        payload = {"username": "adianto@wijayakn.com", "password": "admin"}
        res = requests.post(f"{BASE_URL}/auth/login", json=payload)
        print(f"Status Code: {res.status_code}")
        data = res.json()
        print(f"Response Status: {data.get('status')}")
        print(f"Token Terbit: {data.get('token') is not None}")
        
        if res.status_code == 200 and data.get("status") == "success" and data.get("token"):
            token = data.get("token")
            print("[SUCCESS] Otentikasi Bcrypt & penerbitan JWT berjalan dengan sukses!")
        else:
            print("[FAIL] Gagal login dengan kredensial valid.")
    except Exception as e:
        print(f"[FAIL] Error: {str(e)}")

    # 3. Test hitting protected endpoint WITH the token
    if token:
        print("\n[TEST 3] Mengakses data karyawan MENGGUNAKAN token JWT...")
        try:
            headers = {"Authorization": f"Bearer {token}"}
            res = requests.get(f"{BASE_URL}/employees", headers=headers)
            print(f"Status Code: {res.status_code}")
            data = res.json()
            print(f"Jumlah Karyawan Ditemukan: {len(data.get('data', [])) if isinstance(data, dict) else 'N/A'}")
            
            if res.status_code == 200:
                print("[SUCCESS] Akses diijinkan menggunakan token JWT valid!")
            else:
                print(f"[FAIL] Gagal mengakses dengan token. Status: {res.status_code}")
        except Exception as e:
            print(f"[FAIL] Error: {str(e)}")
    else:
        print("\n[TEST 3] Dilewati karena Test 2 gagal menerbitkan token.")

    print("\n=== VERIFIKASI KEAMANAN SELESAI ===")

if __name__ == "__main__":
    run_tests()
