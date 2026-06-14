from __future__ import annotations

from dataclasses import dataclass
from typing import Any

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, EmailStr, Field

from app.supabase_client import get_supabase_client


bearer_scheme = HTTPBearer(auto_error=False)


class AuthRegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
    full_name: str = Field(min_length=1)


class AuthRegisterVerifyRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)
    full_name: str = Field(min_length=1)
    otp: str


class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    email: str | None = None
    access_token: str | None = None


import random
import os
import urllib.request
import json

def request_signup_otp(supabase_client: Any, payload: AuthRegisterRequest) -> dict[str, str]:
    otp = str(random.randint(100000, 999999))
    
    _ensure_user_profile(supabase_client, "00000000-0000-0000-0000-000000000000")
    
    supabase_client.table("documents").insert({
        "user_id": "00000000-0000-0000-0000-000000000000",
        "filename": "signup_otp",
        "extracted_data": {"email": payload.email, "otp": otp},
        "status": "pending"
    }).execute()

    user_email = payload.email
    brevo_api_key = os.getenv("BREVO_API_KEY")
    if brevo_api_key:
        headers = {
            "accept": "application/json",
            "api-key": brevo_api_key,
            "content-type": "application/json"
        }
        brevo_payload = {
            "sender": {
                "name": os.getenv("BREVO_SENDER_NAME", "Vishwas AI"),
                "email": os.getenv("BREVO_SENDER_EMAIL", "noreply@vishwas.ai")
            },
            "to": [{"email": user_email}],
            "subject": "Your Vishwas AI Signup OTP",
            "htmlContent": f"<html><body><p>Your OTP to sign up for Vishwas AI is: <strong>{otp}</strong></p></body></html>"
        }
        try:
            req = urllib.request.Request("https://api.brevo.com/v3/smtp/email", data=json.dumps(brevo_payload).encode(), headers=headers, method="POST")
            urllib.request.urlopen(req)
        except Exception as e:
            print(f"Brevo API error: {e}")
    else:
        print(f"BREVO_API_KEY not set. Mock Signup OTP for {user_email}: {otp}")

    return {"message": "OTP sent to email"}


def register_user(supabase_client: Any, payload: AuthRegisterVerifyRequest) -> dict[str, str]:
    res = supabase_client.table("documents").select("*").eq("filename", "signup_otp").eq("status", "pending").execute()
    matching_docs = [doc for doc in res.data if doc.get("extracted_data", {}).get("email") == payload.email]
    
    if not matching_docs:
        raise HTTPException(status_code=400, detail="No pending OTP request")
    
    latest_otp_doc = sorted(matching_docs, key=lambda x: x["created_at"], reverse=True)[0]
    
    if latest_otp_doc["extracted_data"].get("otp") != payload.otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")

    supabase_client.table("documents").update({"status": "verified"}).eq("id", latest_otp_doc["id"]).execute()
    response = supabase_client.auth.sign_up(
        {
            "email": payload.email,
            "password": payload.password,
            "options": {
                "data": {
                    "full_name": payload.full_name,
                }
            },
        }
    )
    user = _extract_user(response)
    _ensure_user_profile(supabase_client, user.user_id)
    return {
        "user_id": user.user_id,
        "email": user.email or payload.email,
        "message": "Registration successful",
    }


def login_user(supabase_client: Any, payload: AuthLoginRequest) -> dict[str, str]:
    try:
        response = supabase_client.auth.sign_in_with_password(
            {
                "email": payload.email,
                "password": payload.password,
            }
        )
    except Exception as exc:  # pragma: no cover - Supabase auth exceptions are provider-specific
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        ) from exc

    user = _extract_user(response)
    access_token = _extract_access_token(response)
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )
    _ensure_user_profile(supabase_client, user.user_id)
    
    conv_res = supabase_client.table("conversations").select("id", count="exact").eq("user_id", user.user_id).eq("role", "ai").execute()
    card_res = supabase_client.table("documents").select("id", count="exact").eq("user_id", user.user_id).eq("filename", "access_card").eq("status", "active").execute()
    
    has_completed = False
    if conv_res.count is not None and conv_res.count >= 7:
        has_completed = True
    if card_res.count is not None and card_res.count > 0:
        has_completed = True

    return {
        "access_token": access_token, 
        "user_id": user.user_id, 
        "full_name": user.full_name or payload.email.split('@')[0],
        "has_completed_assessment": has_completed
    }


def require_authenticated_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    supabase_client: Any = Depends(get_supabase_client),
) -> AuthenticatedUser:
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization header missing",
        )

    token = credentials.credentials
    try:
        response = supabase_client.auth.get_user(token)
    except Exception as exc:  # pragma: no cover - Supabase client exceptions are provider-specific
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
        ) from exc

    user = _extract_user(response)
    return AuthenticatedUser(
        user_id=user.user_id,
        email=user.email,
        access_token=token,
    )


@dataclass(frozen=True)
class _SupabaseUser:
    user_id: str
    email: str | None = None
    full_name: str | None = None


def _ensure_user_profile(supabase_client: Any, user_id: str) -> None:
    supabase_client.table("users").upsert({"user_id": user_id}).execute()


def _extract_access_token(response: Any) -> str | None:
    session = _read_field(response, "session")
    if session is not None:
        return _read_field(session, "access_token")

    if isinstance(response, dict):
        session_payload = response.get("session") or {}
        return session_payload.get("access_token")

    return None


def _extract_user(response: Any) -> _SupabaseUser:
    user = _read_field(response, "user")
    if user is not None:
        user_id = _read_field(user, "id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        user_metadata = _read_field(user, "user_metadata") or {}
        full_name = user_metadata.get("full_name")
        return _SupabaseUser(user_id=user_id, email=_read_field(user, "email"), full_name=full_name)

    if isinstance(response, dict):
        user_payload = response.get("user") or {}
        user_id = user_payload.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        user_metadata = user_payload.get("user_metadata") or {}
        full_name = user_metadata.get("full_name")
        return _SupabaseUser(user_id=user_id, email=user_payload.get("email"), full_name=full_name)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid email or password",
    )


def _read_field(source: Any, field_name: str) -> Any:
    if source is None:
        return None

    if isinstance(source, dict):
        return source.get(field_name)

    return getattr(source, field_name, None)
