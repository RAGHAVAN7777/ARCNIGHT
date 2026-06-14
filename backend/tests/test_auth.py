import unittest
from copy import deepcopy
from types import SimpleNamespace

from fastapi.testclient import TestClient

from app.main import app
from app.supabase_client import get_supabase_client


class FakeExecuteResult:
    def __init__(self, data):
        self.data = data


class FakeAuth:
    def __init__(self):
        self.users = {}
        self.sessions = {}
        self.passwords = {}

    def sign_up(self, payload):
        email = payload["email"]
        password = payload["password"]
        user_id = f"user-{len(self.users) + 1}"
        user = {"id": user_id, "email": email}
        self.users[email] = user
        self.sessions[email] = {"access_token": f"token-{user_id}"}
        self.passwords[email] = password
        return {"user": user, "session": self.sessions[email]}

    def sign_in_with_password(self, payload):
        email = payload["email"]
        password = payload["password"]
        if email not in self.users or self.passwords.get(email) != password:
            return SimpleNamespace(user=None, session=None, error={"message": "Invalid login credentials"})
        user = self.users[email]
        session = self.sessions[email]
        return {"user": user, "session": session}

    def get_user(self, token):
        for email, session in self.sessions.items():
            if session["access_token"] == token:
                return {"user": self.users[email]}
        raise ValueError("Invalid token")


class FakeTable:
    def __init__(self, client, table_name):
        self.client = client
        self.table_name = table_name
        self.operation = None
        self.payload = None
        self.filters = {}

    def select(self, *_args, **_kwargs):
        self.operation = "select"
        return self

    def upsert(self, payload):
        self.operation = "upsert"
        self.payload = payload
        return self

    def eq(self, column, value):
        self.filters[column] = value
        return self

    def order(self, *_args, **_kwargs):
        return self

    def insert(self, payload):
        self.operation = "insert"
        self.payload = payload
        return self

    def execute(self):
        if self.operation in {"insert", "upsert"}:
            rows = self.payload if isinstance(self.payload, list) else [self.payload]
            for row in rows:
                existing = next((item for item in self.client.tables[self.table_name] if item.get("user_id") == row.get("user_id")), None)
                if existing is not None and self.operation == "upsert":
                    existing.update(deepcopy(row))
                else:
                    self.client.tables[self.table_name].append(deepcopy(row))
            return FakeExecuteResult(rows)

        if self.operation == "select":
            rows = self.client.tables[self.table_name]
            user_id = self.filters.get("user_id")
            if user_id is not None:
                rows = [row for row in rows if row.get("user_id") == user_id]
            return FakeExecuteResult(deepcopy(rows))

        return FakeExecuteResult([])


class FakeSupabaseClient:
    def __init__(self):
        self.tables = {"users": []}
        self.auth = FakeAuth()

    def table(self, table_name):
        if table_name not in self.tables:
            self.tables[table_name] = []
        return FakeTable(self, table_name)


class AuthTests(unittest.TestCase):
    def setUp(self):
        self.client = FakeSupabaseClient()
        app.dependency_overrides[get_supabase_client] = lambda: self.client
        self.http = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_register_returns_expected_shape_and_creates_user_profile(self):
        response = self.http.post(
            "/auth/register",
            json={"email": "demo@example.com", "password": "secret123", "full_name": "Demo User"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"user_id": "user-1", "email": "demo@example.com", "message": "Registration successful"},
        )
        self.assertEqual(len(self.client.tables["users"]), 1)
        self.assertEqual(self.client.tables["users"][0]["user_id"], "user-1")

    def test_login_returns_access_token_and_user_id(self):
        self.http.post(
            "/auth/register",
            json={"email": "demo@example.com", "password": "secret123", "full_name": "Demo User"},
        )

        response = self.http.post(
            "/auth/login",
            json={"email": "demo@example.com", "password": "secret123"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"access_token": "token-user-1", "user_id": "user-1"})

    def test_login_returns_401_for_nonexistent_email_and_wrong_password(self):
        missing_user_response = self.http.post(
            "/auth/login",
            json={"email": "missing@example.com", "password": "secret123"},
        )
        self.assertEqual(missing_user_response.status_code, 401)
        self.assertEqual(missing_user_response.json()["detail"], "Invalid email or password")

        self.http.post(
            "/auth/register",
            json={"email": "demo@example.com", "password": "secret123", "full_name": "Demo User"},
        )
        wrong_password_response = self.http.post(
            "/auth/login",
            json={"email": "demo@example.com", "password": "wrong-password"},
        )
        self.assertEqual(wrong_password_response.status_code, 401)
        self.assertEqual(wrong_password_response.json()["detail"], "Invalid email or password")

    def test_login_returns_401_when_supabase_returns_empty_auth_response(self):
        self.client.auth.sign_in_with_password = lambda payload: SimpleNamespace(
            user=None,
            session=None,
            error={"message": "Invalid login credentials"},
        )

        response = self.http.post(
            "/auth/login",
            json={"email": "missing@example.com", "password": "secret123"},
        )

        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["detail"], "Invalid email or password")


if __name__ == "__main__":
    unittest.main()
