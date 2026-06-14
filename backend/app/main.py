from fastapi import Depends, FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.auth import AuthLoginRequest, AuthRegisterRequest, login_user, register_user, require_authenticated_user
from app.interview import InterviewRequest, interview_turn
from app.documents import document_upload
from app.supabase_client import get_supabase_client


app = FastAPI(title="Vishwas AI Backend", version="0.1.0")

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
