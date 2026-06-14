from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import uuid
import os
import random
import datetime
import urllib.request
import json
from typing import Any
from app.supabase_client import get_supabase_client
from app.auth import require_authenticated_user

router = APIRouter(prefix="/cards", tags=["cards"])

class GenerateCardRequest(BaseModel):
    user_name: str
    score: int
    level: str
    pin: str

class VerifyCardRequest(BaseModel):
    card_id: str
    pin: str

class VerifyOtpRequest(BaseModel):
    otp: str

@router.post("/generate")
def generate_card(
    payload: GenerateCardRequest,
    current_user=Depends(require_authenticated_user),
    supabase_client: Any = Depends(get_supabase_client),
):
    # Check if active card already exists
    res = supabase_client.table("documents").select("id").eq("user_id", current_user.user_id).eq("filename", "access_card").eq("status", "active").execute()
    if res.data:
        raise HTTPException(status_code=409, detail="Active access card already exists")

    card_id = str(uuid.uuid4())
    data = {
        "id": card_id,
        "user_id": current_user.user_id,
        "filename": "access_card",
        "status": "active",
        "extracted_data": {
            "user_name": payload.user_name,
            "score": payload.score,
            "level": payload.level,
            "pin": payload.pin
        }
    }
    supabase_client.table("documents").insert(data).execute()
    return {"card_id": card_id}

@router.post("/verify")
def verify_card(
    payload: VerifyCardRequest,
    supabase_client: Any = Depends(get_supabase_client),
):
    response = supabase_client.table("documents").select("*").eq("id", payload.card_id).eq("filename", "access_card").execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Card is not valid")
    
    card_data = response.data[0]["extracted_data"]
    if card_data.get("pin") != payload.pin:
        raise HTTPException(status_code=401, detail="Invalid PIN")
    
    return {
        "user_name": card_data.get("user_name"),
        "score": card_data.get("score"),
        "level": card_data.get("level"),
    }

@router.get("/status")
def get_card_status(
    current_user=Depends(require_authenticated_user),
    supabase_client: Any = Depends(get_supabase_client),
):
    res = supabase_client.table("documents").select("id").eq("user_id", current_user.user_id).eq("filename", "access_card").eq("status", "active").execute()
    return {"has_card": len(res.data) > 0}

@router.post("/request-otp")
def request_otp(
    current_user=Depends(require_authenticated_user),
    supabase_client: Any = Depends(get_supabase_client),
):
    user_email = current_user.email
    if not user_email:
        raise HTTPException(status_code=400, detail="User email not available")

    print(f"Triggering Brevo OTP email for user: {user_email}")
    otp = str(random.randint(100000, 999999))
    
    supabase_client.table("documents").insert({
        "user_id": current_user.user_id,
        "filename": "otp_request",
        "status": "pending",
        "extracted_data": {
            "otp": otp,
            "expires_at": (datetime.datetime.utcnow() + datetime.timedelta(minutes=10)).isoformat()
        }
    }).execute()

    brevo_api_key = os.getenv("BREVO_API_KEY")
    if brevo_api_key:
        headers = {
            "accept": "application/json",
            "api-key": brevo_api_key,
            "content-type": "application/json"
        }
        payload = {
            "sender": {
                "name": os.getenv("BREVO_SENDER_NAME", "Vishwas AI"),
                "email": os.getenv("BREVO_SENDER_EMAIL", "noreply@vishwas.ai")
            },
            "to": [{"email": user_email}],
            "subject": "Your Access Card Regeneration OTP",
            "htmlContent": f"<html><body><p>Your OTP to regenerate the access card is: <strong>{otp}</strong></p><p>It is valid for 10 minutes.</p></body></html>"
        }
        try:
            req = urllib.request.Request("https://api.brevo.com/v3/smtp/email", data=json.dumps(payload).encode(), headers=headers, method="POST")
            urllib.request.urlopen(req)
        except Exception as e:
            print(f"Brevo API error: {e}")
    else:
        print(f"BREVO_API_KEY not set. Mock OTP for {user_email}: {otp}")

    return {"message": "OTP sent"}

@router.post("/verify-otp")
def verify_otp(
    payload: VerifyOtpRequest,
    current_user=Depends(require_authenticated_user),
    supabase_client: Any = Depends(get_supabase_client),
):
    res = supabase_client.table("documents").select("*").eq("user_id", current_user.user_id).eq("filename", "otp_request").eq("status", "pending").execute()
    if not res.data:
        raise HTTPException(status_code=400, detail="No pending OTP request")
    
    latest_otp_doc = sorted(res.data, key=lambda x: x["created_at"], reverse=True)[0]
    
    if latest_otp_doc["extracted_data"].get("otp") != payload.otp:
        raise HTTPException(status_code=401, detail="Invalid OTP")
        
    # Revoke old access cards
    supabase_client.table("documents").update({"status": "revoked"}).eq("user_id", current_user.user_id).eq("filename", "access_card").execute()
    
    # Mark OTP as used
    supabase_client.table("documents").update({"status": "used"}).eq("id", latest_otp_doc["id"]).execute()

    return {"message": "OTP verified, you can now generate a new card"}
