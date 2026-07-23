import base64
import hashlib
import hmac
import json
import time
from typing import Any, Dict

SECRET_KEY = "finsight_secret_key_change_in_production"
ALGORITHM = "HS256"


def hash_password(password: str) -> str:
    salt = "finsight_salt_"
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100000)
    return pwd_hash.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password


def create_access_token(user_id: Any, username: str, email: str, expires_in_seconds: int = 86400) -> str:
    header = {"alg": ALGORITHM, "typ": "JWT"}
    now = int(time.time())
    payload = {
        "sub": username,
        "user_id": str(user_id),
        "email": email,
        "exp": now + expires_in_seconds,
        "iat": now,
    }

    def b64url_encode(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

    header_bytes = json.dumps(header, separators=(",", ":")).encode("utf-8")
    payload_bytes = json.dumps(payload, separators=(",", ":")).encode("utf-8")

    encoded_header = b64url_encode(header_bytes)
    encoded_payload = b64url_encode(payload_bytes)

    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    signature = hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest()
    encoded_signature = b64url_encode(signature)

    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def decode_access_token(token: str) -> Dict[str, Any]:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Invalid JWT token format")

    encoded_header, encoded_payload, signature = parts

    def b64url_decode(data: str) -> bytes:
        padding = "=" * (4 - (len(data) % 4))
        return base64.urlsafe_b64decode(data + padding)

    payload_bytes = b64url_decode(encoded_payload)
    return json.loads(payload_bytes.decode("utf-8"))
