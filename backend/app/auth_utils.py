import base64
import hashlib
import hmac
import json
import os
import time
from typing import Any, Dict
from dotenv import load_dotenv

load_dotenv()

# Load cryptographically secure 256-bit SHA-256 secret key and salt from environment
SECRET_KEY = os.getenv("SECRET_KEY", "8998e2ae7a2ee313d65cff92222b61dbc68d21a63b9de7afd4b273ae85730ade")
SALT_SECRET = os.getenv("SALT_SECRET", "b0d5d18ae0bb1c0cdc62b160865eb359")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
DEFAULT_EXPIRE_SECONDS = int(os.getenv("ACCESS_TOKEN_EXPIRE_SECONDS", "86400"))


def hash_password(password: str) -> str:
    pwd_hash = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), SALT_SECRET.encode("utf-8"), 100000)
    return pwd_hash.hex()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return hash_password(plain_password) == hashed_password


def create_access_token(user_id: Any, username: str, email: str, expires_in_seconds: int = DEFAULT_EXPIRE_SECONDS) -> str:

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

    def b64url_encode(data: bytes) -> str:
        return base64.urlsafe_b64encode(data).decode("utf-8").rstrip("=")

    def b64url_decode(data: str) -> bytes:
        padding = "=" * (4 - (len(data) % 4))
        return base64.urlsafe_b64decode(data + padding)

    # Verify HMAC-SHA256 signature
    signing_input = f"{encoded_header}.{encoded_payload}".encode("utf-8")
    expected_sig = b64url_encode(hmac.new(SECRET_KEY.encode("utf-8"), signing_input, hashlib.sha256).digest())
    if not hmac.compare_digest(expected_sig, signature):
        raise ValueError("Invalid token signature")

    payload_bytes = b64url_decode(encoded_payload)
    payload = json.loads(payload_bytes.decode("utf-8"))

    # Check expiration
    exp = payload.get("exp")
    if exp is not None and int(exp) < int(time.time()):
        raise ValueError("Token has expired")

    return payload

