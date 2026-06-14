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


class AuthLoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1)


@dataclass(frozen=True)
class AuthenticatedUser:
    user_id: str
    email: str | None = None
    access_token: str | None = None


def register_user(supabase_client: Any, payload: AuthRegisterRequest) -> dict[str, str]:
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
    return {"access_token": access_token, "user_id": user.user_id}


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
        return _SupabaseUser(user_id=user_id, email=_read_field(user, "email"))

    if isinstance(response, dict):
        user_payload = response.get("user") or {}
        user_id = user_payload.get("id")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )
        return _SupabaseUser(user_id=user_id, email=user_payload.get("email"))

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
