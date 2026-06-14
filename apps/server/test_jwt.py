import os
from jose import jwt, JWTError

secret = "mysecret"
# create token with aud
payload = {"sub": "123", "aud": "authenticated"}
token = jwt.encode(payload, secret, algorithm="HS256")

print("Token created:", token)
try:
    decoded = jwt.decode(token, secret, algorithms=["HS256"])
    print("Decoded without aud:", decoded)
except JWTError as e:
    print("Error decoding without aud:", str(e))

try:
    decoded2 = jwt.decode(token, secret, algorithms=["HS256"], audience="authenticated")
    print("Decoded with aud:", decoded2)
except JWTError as e:
    print("Error decoding with aud:", str(e))

try:
    decoded3 = jwt.decode(token, secret, algorithms=["HS256"], options={"verify_aud": False})
    print("Decoded with verify_aud=False:", decoded3)
except JWTError as e:
    print("Error decoding with verify_aud=False:", str(e))
