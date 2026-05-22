import urllib.request
import urllib.error
import json
import sys

URL = "http://127.0.0.1:8000/api/auth/login"
payload = {
    "username": "test_rate_limit_user@wijayakn.com",
    "password": "wrong_password"
}
data = json.dumps(payload).encode("utf-8")

print("Starting login rate limit verification...")

for i in range(1, 8):
    req = urllib.request.Request(
        URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST"
    )
    try:
        with urllib.request.urlopen(req) as response:
            res_body = response.read().decode("utf-8")
            print(f"Request {i}: HTTP {response.status} - Response: {res_body}")
    except urllib.error.HTTPError as e:
        err_body = e.read().decode("utf-8")
        print(f"Request {i}: HTTP {e.code} - Error Response: {err_body}")
    except Exception as e:
        print(f"Request {i}: Failed with connection error: {e}")
        sys.exit(1)
