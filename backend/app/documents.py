from __future__ import annotations

from typing import Any

from fastapi import UploadFile


def document_upload(supabase_client: Any, user_id: str, file: UploadFile) -> dict[str, Any]:
    filename = file.filename or "uploaded-file"
    payload = {
        "user_id": user_id,
        "filename": filename,
        "status": "verified",
        "extracted_data": {},
    }
    supabase_client.table("documents").insert(payload).execute()
    return {
        "filename": filename,
        "status": "verified",
        "extracted_data": {},
    }

