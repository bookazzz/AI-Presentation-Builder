"""Tests for API endpoints using httpx.AsyncClient.

Database is initialized in conftest.py with session scope.
"""
import pytest
import uuid
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
async def client():
    """Create async test client."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


def auth_header(token: str) -> dict:
    return {"Authorization": "Bearer " + token}


def unique_email(prefix: str = "test") -> str:
    return f"{prefix}-{uuid.uuid4().hex[:6]}@example.com"


class TestAuth:
    async def test_health(self, client):
        resp = await client.get("/api/health")
        assert resp.status_code == 200
        assert resp.json()["status"] == "ok"

    async def test_register(self, client):
        email = unique_email()
        resp = await client.post("/api/auth/register", json={
            "email": email, "password": "Test123!@#", "name": "Test User"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == email

    async def test_register_duplicate(self, client):
        email = unique_email("dup")
        resp1 = await client.post("/api/auth/register", json={
            "email": email, "password": "Pass1234!"
        })
        assert resp1.status_code == 200
        resp2 = await client.post("/api/auth/register", json={
            "email": email, "password": "Pass1234!"
        })
        assert resp2.status_code == 400

    async def test_login(self, client):
        email = unique_email("login")
        await client.post("/api/auth/register", json={
            "email": email, "password": "Pass1234!"
        })
        resp = await client.post("/api/auth/login", json={
            "email": email, "password": "Pass1234!"
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    async def test_login_wrong_password(self, client):
        resp = await client.post("/api/auth/login", json={
            "email": unique_email(), "password": "wrong"
        })
        assert resp.status_code == 401

    async def test_me(self, client):
        email = unique_email("me")
        reg = await client.post("/api/auth/register", json={
            "email": email, "password": "Pass1234!"
        })
        token = reg.json()["access_token"]
        resp = await client.get("/api/auth/me", headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["email"] == email

    async def test_me_no_token(self, client):
        resp = await client.get("/api/auth/me")
        assert resp.status_code == 401


class TestPresentations:
    async def test_create_presentation(self, client):
        reg = await client.post("/api/auth/register", json={
            "email": unique_email("pres"), "password": "Pass1234!"
        })
        token = reg.json()["access_token"]
        resp = await client.post("/api/presentations", json={
            "title": "Test Report", "type": "report",
            "audience": "manager", "style": "business",
            "language": "ru", "source_text": "Sales grew 20% in Q1."
        }, headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["title"] == "Test Report"
        assert resp.json()["status"] == "draft"

    async def test_list_presentations(self, client):
        reg = await client.post("/api/auth/register", json={
            "email": unique_email("list"), "password": "Pass1234!"
        })
        token = reg.json()["access_token"]
        await client.post("/api/presentations", json={
            "title": "My Pres", "type": "free"
        }, headers=auth_header(token))
        resp = await client.get("/api/presentations", headers=auth_header(token))
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    async def test_get_presentation(self, client):
        reg = await client.post("/api/auth/register", json={
            "email": unique_email("get"), "password": "Pass1234!"
        })
        token = reg.json()["access_token"]
        create = await client.post("/api/presentations", json={
            "title": "Get Test", "type": "free"
        }, headers=auth_header(token))
        pid = create.json()["id"]
        resp = await client.get(f"/api/presentations/{pid}", headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["id"] == pid

    async def test_update_presentation(self, client):
        reg = await client.post("/api/auth/register", json={
            "email": unique_email("upd"), "password": "Pass1234!"
        })
        token = reg.json()["access_token"]
        create = await client.post("/api/presentations", json={
            "title": "Old Title", "type": "free"
        }, headers=auth_header(token))
        pid = create.json()["id"]
        resp = await client.patch(f"/api/presentations/{pid}", json={
            "title": "New Title"
        }, headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["title"] == "New Title"

    async def test_delete_presentation(self, client):
        import uuid
        email = f"del-{uuid.uuid4().hex[:8]}@example.com"
        reg = await client.post("/api/auth/register", json={
            "email": email, "password": "Pass1234!"
        })
        token = reg.json()["access_token"]
        create = await client.post("/api/presentations", json={
            "title": "To Delete", "type": "free"
        }, headers=auth_header(token))
        pid = create.json()["id"]
        # Delete
        resp = await client.delete(f"/api/presentations/{pid}", headers=auth_header(token))
        assert resp.status_code == 204, f"Delete failed: {resp.status_code}"
        # Verify deletion
        resp = await client.get(f"/api/presentations/{pid}", headers=auth_header(token))
        assert resp.status_code == 404, f"Get after delete: {resp.status_code}"
