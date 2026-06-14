import logging
from datetime import datetime
from fastapi import Depends, FastAPI, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.auth import AuthLoginRequest, AuthRegisterRequest, login_user, register_user, require_authenticated_user
from app.interview import InterviewRequest, interview_turn
from app.documents import document_upload
from app.scoring import score_user
from app.supabase_client import get_supabase_client
from app.schemes import match_schemes_for_user

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


app = FastAPI(title="Vishwas AI Backend", version="0.1.0")

@app.on_event("startup")
async def startup_event():
    import os
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    logger.info(f"✓ FastAPI app started")
    logger.info(f"✓ GEMINI_API_KEY present: {bool(gemini_key)}")
    if not gemini_key:
        logger.warning("⚠ GEMINI_API_KEY is not set - /score endpoint will fail")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/register")
def auth_register(
    payload: AuthRegisterRequest,
    supabase_client=Depends(get_supabase_client),
):
    return register_user(supabase_client, payload)


@app.post("/auth/login")
def auth_login(
    payload: AuthLoginRequest,
    supabase_client=Depends(get_supabase_client),
):
    return login_user(supabase_client, payload)


@app.post("/interview")
def create_interview_turn(
    payload: InterviewRequest,
    current_user=Depends(require_authenticated_user),
    supabase_client=Depends(get_supabase_client),
):
    return interview_turn(supabase_client, current_user.user_id, payload)


@app.post("/documents/upload")
def upload_document(
    file: UploadFile,
    current_user=Depends(require_authenticated_user),
    supabase_client=Depends(get_supabase_client),
):
    return document_upload(supabase_client, user_id=current_user.user_id, file=file)


@app.post("/score")
def create_score(
    current_user=Depends(require_authenticated_user),
    supabase_client=Depends(get_supabase_client),
):
    return score_user(supabase_client, current_user.user_id)


@app.get("/score-history/{user_id}")
def get_score_history(
    user_id: str,
    current_user=Depends(require_authenticated_user),
    supabase_client=Depends(get_supabase_client),
):
    if current_user.user_id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    resp = (
        supabase_client.table("scores")
        .select("score, created_at")
        .eq("user_id", user_id)
        .order("created_at", desc=False)
        .execute()
    )

    rows = list(resp.data or [])
    history = []
    for row in rows:
        created_at = row.get("created_at")
        if isinstance(created_at, str):
            try:
                created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
            except ValueError:
                created_at = None
        if isinstance(created_at, datetime):
            date_text = created_at.date().isoformat()
        else:
            date_text = str(created_at)

        history.append({"date": date_text, "score": row.get("score")})

    return history


@app.post("/schemes")
def create_schemes_matches(
    current_user=Depends(require_authenticated_user),
    supabase_client=Depends(get_supabase_client),
):
    # fetch latest score for user
    resp = (
        supabase_client.table("scores")
        .select("id, score, factors")
        .eq("user_id", current_user.user_id)
        .order("created_at", desc=True)
        .limit(1)
        .execute()
    )
    rows = list(resp.data or [])
    if not rows:
        return {"error": "no score found"}

    score_record = rows[0]
    result = match_schemes_for_user(current_user.user_id, score_record, top_n=5)

    # persist matches
    inserts = []
    for s in result["schemes"]:
        inserts.append(
            {
                "user_id": current_user.user_id,
                "score_id": score_record.get("id"),
                "scheme_id": s["id"],
                "scheme_name": s["name"],
                "match_score": s["match_score"],
                "eligible": s["eligible"],
                "details": s.get("details", {}),
            }
        )

    if inserts:
        supabase_client.table("schemes_matches").insert(inserts).execute()

    return result
