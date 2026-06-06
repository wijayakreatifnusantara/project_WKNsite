import requests

url = "http://localhost:8000/api/auth/login"
payload = {
    "username": "adianto@wijayakn.com",
    "password": "admin"
}
try:
    response = requests.post(url, json=payload)
    print("Status Code:", response.status_code)
    print("Response JSON:", response.json())
except Exception as e:
    print("Error:", str(e))
