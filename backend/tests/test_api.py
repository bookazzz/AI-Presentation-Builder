"""Tests for API endpoints using TestClient (httpx).

Note: Database is initialized at module level to avoid event loop issues.
"""
import pytest
from httpx import AsyncClient, ASGITransport
import asyncio

from app.main import app
from app.core.database import init_db
from app.core.config import settings

# Initialize in-memory DB once
settings.database_url = "sqlite+aiosqlite://"
loop = asyncio.new_event_loop()
asyncio.set_event_loop(loop)
loop.run_until_complete(init_db())
loop.close()


@pytest.fixture
def client():
    """Create async test client using sync transport."""
    import httpx
    transport = ASGITransport(app=app)
    with httpx.Client(transport=transport, base_url="http://test") as c:
        yield c


def auth_header(token: str) -> dict:
    return {"Authorization": "Bearer " + token}


class TestAuth:
    def test_health(self, client):
        resp = client.get("/api/health")
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "ok"

    def test_register(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "test@example.com",
            "password": "Test123!@#",
            "name": "Test User"
        })
        assert resp.status_code == 200
        data = resp.json()
        assert "access_token" in data
        assert data["user"]["email"] == "test@example.com"

    def test_register_duplicate(self, client):
        client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "Pass1234!"
        })
        resp = client.post("/api/auth/register", json={
            "email": "dup@example.com",
            "password": "Pass1234!"
        })
        assert resp.status_code == 400

    def test_login(self, client):
        client.post("/api/auth/register", json={
            "email": "login@example.com",
            "password": "Pass1234!"
        })
        resp = client.post("/api/auth/login", json={
            "email": "login@example.com",
            "password": "Pass1234!"
        })
        assert resp.status_code == 200
        assert "access_token" in resp.json()

    def test_login_wrong_password(self, client):
        resp = client.post("/api/auth/login", json={
            "email": "test@example.com",
            "password": "wrong"
        })
        assert resp.status_code == 401

    def test_me(self, client):
        resp = client.post("/api/auth/register", json={
            "email": "me@example.com",
            "password": "Pass1234!"
        })
        token = resp.json()["access_token"]
        resp = client.get("/api/auth/me", headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["email"] == "me@example.com"

    def test_me_no_token(self, client):
        resp = client.get("/api/auth/me")
        assert resp.status_code == 401


class TestPresentations:
    def _register(self, client) -> str:
        resp = client.post("/api/auth/register", json={
            "email": "pres@example.com",
            "password": "Pass1234!"
        })
        return resp.json()["access_token"]

    def test_create_presentation(self, client):
        token = self._register(client)
        resp = client.post("/api/presentations", json={
            "title": "Test Report",
            "type": "report",
            "audience": "manager",
            "style": "business",
            "language": "ru",
            "source_text": "Sales grew 20% in Q1 2026."
        }, headers=auth_header(token))
        assert resp.status_code == 200
        data = resp.json()
        assert data["title"] == "Test Report"
        assert data["status"] == "draft"
        assert data["slides_count"] == 10

    def test_list_presentations(self, client):
        token = self._register(client)
        client.post("/api/presentations", json={
            "title": "My Pres", "type": "free"
        }, headers=auth_header(token))
        resp = client.get("/api/presentations", headers=auth_header(token))
        assert resp.status_code == 200
        assert len(resp.json()) >= 1

    def test_get_presentation(self, client):
        token = self._register(client)
        create = client.post("/api/presentations", json={
            "title": "Get Test", "type": "free"
        }, headers=auth_header(token))
        pid = create.json()["id"]
        resp = client.get(f"/api/presentations/{pid}", headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["id"] == pid

    def test_update_presentation(self, client):
        token = self._register(client)
        create = client.post("/api/presentations", json={
            "title": "Old Title", "type": "free"
        }, headers=auth_header(token))
        pid = create.json()["id"]
        resp = client.patch(f"/api/presentations/{pid}", json={
            "title": "New Title"
        }, headers=auth_header(token))
        assert resp.status_code == 200
        assert resp.json()["title"] == "New Title"

    def test_delete_presentation(self, client):
        token = self._register(client)
        create = client.post("/api/presentations", json={
            "title": "To Delete", "type": "free"
        }, headers=auth_header(token))
        pid = create.json()["id"]
        resp = client.delete(f"/api/presentations/{pid}", headers=auth_header(token))
        assert resp.status_code == 204
        resp = client.get(f"/api/presentations/{pid}", headers=auth_header(token))
        assert resp.status_code == 404
