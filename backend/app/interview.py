from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class InterviewRequest(BaseModel):
    message: str = Field(default="")
    language: str = Field(default="en")


class InterviewResponse(BaseModel):
    role: Literal["ai"]
    text: str
    done: bool


INTERVIEW_QUESTIONS = [
    "What kind of work do you do most days?",
    "How long have you been doing this work?",
    "How steady is your income across a typical month?",
    "Do you have a regular savings habit each week?",
    "How much do your expenses vary from week to week?",
    "Do you have dependents or others relying on your income?",
    "What do you usually do when income is low or expenses spike?",
]

COMPLETION_TEXT = "Thanks. I have enough information to generate your score now."


def interview_turn(supabase_client: Any, user_id: str, payload: InterviewRequest) -> dict[str, Any]:
    history = _load_conversation_history(supabase_client, user_id)
    next_question_index = sum(1 for turn in history if turn.get("role") == "ai")
    done = next_question_index >= len(INTERVIEW_QUESTIONS) - 1

    user_turn = {
        "user_id": user_id,
        "role": "user",
        "message": payload.message.strip(),
        "language": payload.language or "en",
    }
    supabase_client.table("conversations").insert(user_turn).execute()

    if next_question_index >= len(INTERVIEW_QUESTIONS):
        response = InterviewResponse(role="ai", text=COMPLETION_TEXT, done=True)
        _store_ai_turn(supabase_client, user_id, response.text, payload.language)
        return response.model_dump()

    response = InterviewResponse(
        role="ai",
        text=INTERVIEW_QUESTIONS[next_question_index],
        done=done,
    )
    _store_ai_turn(supabase_client, user_id, response.text, payload.language)
    return response.model_dump()


def _load_conversation_history(supabase_client: Any, user_id: str) -> list[dict[str, Any]]:
    result = (
        supabase_client.table("conversations")
        .select("role,message,language,created_at")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
    )
    return list(result.data or [])


def _store_ai_turn(supabase_client: Any, user_id: str, message: str, language: str) -> None:
    supabase_client.table("conversations").insert(
        {
            "user_id": user_id,
            "role": "ai",
            "message": message,
            "language": language or "en",
        }
    ).execute()
