import unittest
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

    def insert(self, payload):
        self.operation = "insert"
        self.payload = payload
        return self

    def execute(self):
        if self.operation == "insert":
            rows = self.payload if isinstance(self.payload, list) else [self.payload]
            for row in rows:
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
        self.tables = {"documents": [], "users": []}
        self.auth = type(
            "FakeAuth",
            (),
            {
                "get_user": staticmethod(lambda token: {"user": {"id": "user-1", "email": "demo@example.com"}}),
            },
        )()

    def table(self, table_name):
        if table_name not in self.tables:
            self.tables[table_name] = []
        return FakeTable(self, table_name)


class DocumentUploadTests(unittest.TestCase):
    def setUp(self):
        self.client = FakeSupabaseClient()
        app.dependency_overrides[get_supabase_client] = lambda: self.client
        self.http = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_upload_returns_verified_stub_and_persists_document(self):
        response = self.http.post(
            "/documents/upload",
            headers={"Authorization": "Bearer token-user-1"},
            files={"file": ("income-proof.pdf", b"fake pdf bytes", "application/pdf")},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response.json(),
            {"filename": "income-proof.pdf", "status": "verified", "extracted_data": {}},
        )
        self.assertEqual(len(self.client.tables["documents"]), 1)
        self.assertEqual(self.client.tables["documents"][0]["filename"], "income-proof.pdf")


if __name__ == "__main__":
    unittest.main()
