from fastapi import Depends, FastAPI

from app.interview import InterviewRequest, interview_turn
from app.supabase_client import get_supabase_client


app = FastAPI(title="Vishwas AI Backend", version="0.1.0")


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/interview")
def create_interview_turn(
    payload: InterviewRequest,
    supabase_client=Depends(get_supabase_client),
):
    return interview_turn(supabase_client, payload)
