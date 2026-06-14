import unittest
from copy import deepcopy

from fastapi.testclient import TestClient

from app.interview import INTERVIEW_QUESTIONS
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
        self.tables = {"conversations": [], "users": []}
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


class InterviewEndpointTests(unittest.TestCase):
    def setUp(self):
        self.client = FakeSupabaseClient()
        app.dependency_overrides[get_supabase_client] = lambda: self.client
        self.http = TestClient(app)

    def tearDown(self):
        app.dependency_overrides.clear()

    def test_first_turn_returns_first_question_and_persists_both_turns(self):
        response = self.http.post(
            "/interview",
            json={"message": "I run a small shop", "language": "en"},
            headers={"Authorization": "Bearer token-user-1"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"role": "ai", "text": INTERVIEW_QUESTIONS[0], "done": False})
        self.assertEqual(len(self.client.tables["conversations"]), 2)
        self.assertEqual(self.client.tables["conversations"][0]["role"], "user")
        self.assertEqual(self.client.tables["conversations"][1]["role"], "ai")

    def test_final_turn_sets_done_true(self):
        for index, question in enumerate(INTERVIEW_QUESTIONS[:-1]):
            response = self.http.post(
                "/interview",
                json={"message": f"answer {index}", "language": "en"},
                headers={"Authorization": "Bearer token-user-1"},
            )
            self.assertEqual(response.json(), {"role": "ai", "text": question, "done": False})

        final_response = self.http.post(
            "/interview",
            json={"message": "final answer", "language": "en"},
            headers={"Authorization": "Bearer token-user-1"},
        )

        self.assertEqual(
            final_response.json(),
            {"role": "ai", "text": INTERVIEW_QUESTIONS[-1], "done": True},
        )

        completion_response = self.http.post(
            "/interview",
            json={"message": "one more", "language": "en"},
            headers={"Authorization": "Bearer token-user-1"},
        )
        self.assertEqual(
            completion_response.json(),
            {"role": "ai", "text": "Thanks. I have enough information to generate your score now.", "done": True},
        )


if __name__ == "__main__":
    unittest.main()
