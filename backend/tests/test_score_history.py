import unittest
from datetime import datetime, timedelta
from copy import deepcopy

from fastapi.testclient import TestClient

from app.main import app
from app.supabase_client import get_supabase_client


class FakeExecuteResult:
    def __init__(self, data):
        self.data = data


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

    def eq(self, column, value):
        self.filters[column] = value
        return self

    def order(self, *_args, **_kwargs):
        return self

    def execute(self):
        if self.operation == "select":
            rows = self.client.tables[self.table_name]
            user_id = self.filters.get("user_id")
            if user_id is not None:
                rows = [row for row in rows if row.get("user_id") == user_id]
            return FakeExecuteResult(deepcopy(rows))

        return FakeExecuteResult([])


class FakeSupabaseClient:
    def __init__(self):
        self.tables = {"scores": []}

        def get_user(token):
            if token == "token-user-1":
                return {"user": {"id": "user-1", "email": "demo@example.com"}}
            if token == "token-user-2":
                return {"user": {"id": "user-2", "email": "other@example.com"}}
            raise ValueError("Invalid token")

        self.auth = type(
            "FakeAuth",
            (),
            {"get_user": staticmethod(get_user)},
        )()

    def table(self, table_name):
        if table_name not in self.tables:
            self.tables[table_name] = []
        return FakeTable(self, table_name)


class ScoreHistoryEndpointTests(unittest.TestCase):
    def setUp(self):
        self.client = FakeSupabaseClient()
        app.dependency_overrides[get_supabase_client] = lambda: self.client
        self.http = TestClient(app)

        now = datetime.utcnow()
        self.client.tables["scores"].extend(
            [
                {"user_id": "user-1", "score": 620, "created_at": (now - timedelta(days=30)).isoformat() + "Z"},
                {"user_id": "user-1", "score": 770, "created_at": now.isoformat() + "Z"},
            ]
        )

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_score_history_returns_ordered_history(self):
        response = self.http.get(
            "/score-history/user-1",
            headers={"Authorization": "Bearer token-user-1"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [
            {"date": (datetime.utcnow() - timedelta(days=30)).date().isoformat(), "score": 620},
            {"date": datetime.utcnow().date().isoformat(), "score": 770},
        ])

    def test_score_history_forbidden_for_other_user(self):
        response = self.http.get(
            "/score-history/user-2",
            headers={"Authorization": "Bearer token-user-1"},
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["detail"], "Forbidden")

    def test_score_history_returns_empty_array_when_no_scores(self):
        response = self.http.get(
            "/score-history/user-2",
            headers={"Authorization": "Bearer token-user-2"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), [])
