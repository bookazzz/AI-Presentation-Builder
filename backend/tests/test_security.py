"""Tests for security utilities (password hashing, JWT tokens)."""
import pytest
from app.core.security import hash_password, verify_password, create_access_token, decode_access_token


class TestPasswordHashing:
    def test_hash_and_verify(self):
        """Hash and verify should work with correct password."""
        pw = "MyStr0ng!Pass"
        hashed = hash_password(pw)
        assert hashed.startswith("$2b$")
        assert verify_password(pw, hashed) is True

    def test_wrong_password(self):
        """Verify should return False for wrong password."""
        hashed = hash_password("correct")
        assert verify_password("wrong", hashed) is False

    def test_empty_password(self):
        """Empty password should be hashable and verifiable."""
        hashed = hash_password("")
        assert verify_password("", hashed) is True

    def test_very_long_password(self):
        """Long password (72+ chars) should work (bcrypt truncates)."""
        pw = "a" * 100
        hashed = hash_password(pw)
        assert verify_password(pw, hashed) is True

    def test_invalid_hash_format(self):
        """Verify with invalid hash format should return False."""
        assert verify_password("test", "not-a-hash") is False
        assert verify_password("test", "") is False
        assert verify_password("test", None) is False

    def test_unique_hashes(self):
        """Each hash should be unique (different salt)."""
        pw = "SamePassword"
        h1 = hash_password(pw)
        h2 = hash_password(pw)
        assert h1 != h2

    def test_special_characters(self):
        """Passwords with special chars should work."""
        pw = "P@$$w0rd! #日本語 ♪"
        hashed = hash_password(pw)
        assert verify_password(pw, hashed) is True


class TestJWTTokens:
    def test_create_and_decode(self):
        """Create token and decode should return the same data."""
        data = {"sub": "user123", "role": "admin"}
        token = create_access_token(data)
        decoded = decode_access_token(token)
        assert decoded is not None
        assert decoded["sub"] == "user123"
        assert decoded["role"] == "admin"

    def test_expiry(self):
        """Token should have expiry claim."""
        data = {"sub": "test"}
        token = create_access_token(data)
        decoded = decode_access_token(token)
        assert decoded is not None
        assert "exp" in decoded

    def test_invalid_token(self):
        """Decode with invalid token should return None."""
        assert decode_access_token("invalid-token") is None
        assert decode_access_token("") is None
        assert decode_access_token("eyJ.eyJ9.A") is None
