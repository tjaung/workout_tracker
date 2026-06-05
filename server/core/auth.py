import base64
import hashlib
import hmac
import json
import secrets
import time
from typing import Any

from core.config import get_settings


PBKDF2_ITERATIONS = 600_000


def hash_password(password: str) -> str:
    salt = secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        PBKDF2_ITERATIONS,
    ).hex()
    return f"pbkdf2_sha256${PBKDF2_ITERATIONS}${salt}${digest}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        algorithm, iterations, salt, expected_digest = password_hash.split("$", 3)
    except ValueError:
        return False

    if algorithm != "pbkdf2_sha256":
        return False

    digest = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        bytes.fromhex(salt),
        int(iterations),
    ).hex()
    return hmac.compare_digest(digest, expected_digest)


def create_session_token(user_id: int) -> str:
    settings = get_settings()
    payload = {
        "user_id": user_id,
        "iat": int(time.time()),
        "exp": int(time.time()) + settings.session_cookie_max_age_seconds,
    }
    payload_part = _encode_json(payload)
    signature = _sign(payload_part, settings.session_secret_key)
    return f"{payload_part}.{signature}"


def create_csrf_token() -> str:
    settings = get_settings()
    nonce = secrets.token_urlsafe(32)
    issued_at = int(time.time())
    value = f"{nonce}.{issued_at}"
    signature = _sign(value, settings.session_secret_key)
    return f"{value}.{signature}"


def verify_csrf_token(token: str) -> bool:
    settings = get_settings()

    try:
        nonce, issued_at, signature = token.rsplit(".", 2)
    except ValueError:
        return False

    if not nonce:
        return False

    value = f"{nonce}.{issued_at}"
    if not hmac.compare_digest(signature, _sign(value, settings.session_secret_key)):
        return False

    try:
        issued_at_timestamp = int(issued_at)
    except ValueError:
        return False

    return issued_at_timestamp + settings.csrf_cookie_max_age_seconds >= int(time.time())


def decode_session_token(token: str) -> dict[str, Any]:
    settings = get_settings()

    try:
        payload_part, signature = token.rsplit(".", 1)
    except ValueError as exc:
        raise ValueError("Invalid session token") from exc

    expected_signature = _sign(payload_part, settings.session_secret_key)
    if not hmac.compare_digest(signature, expected_signature):
        raise ValueError("Invalid session signature")

    payload = _decode_json(payload_part)
    expires_at = payload.get("exp")
    if not isinstance(expires_at, int) or expires_at < int(time.time()):
        raise ValueError("Session token has expired")

    return payload


def _sign(value: str, secret_key: str) -> str:
    digest = hmac.new(
        secret_key.encode("utf-8"),
        value.encode("utf-8"),
        hashlib.sha256,
    ).digest()
    return _base64_urlsafe_encode(digest)


def _encode_json(value: dict[str, Any]) -> str:
    return _base64_urlsafe_encode(json.dumps(value, separators=(",", ":")).encode("utf-8"))


def _decode_json(value: str) -> dict[str, Any]:
    decoded = base64.urlsafe_b64decode(_pad_base64(value)).decode("utf-8")
    payload = json.loads(decoded)
    if not isinstance(payload, dict):
        raise ValueError("Invalid session payload")
    return payload


def _base64_urlsafe_encode(value: bytes) -> str:
    return base64.urlsafe_b64encode(value).decode("utf-8").rstrip("=")


def _pad_base64(value: str) -> bytes:
    return f"{value}{'=' * (-len(value) % 4)}".encode("utf-8")
