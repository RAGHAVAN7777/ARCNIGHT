#!/usr/bin/env python
"""Quick script to verify environment variables are loaded correctly."""
import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

print("\n=== Environment Check ===\n")

# Check .env file exists
env_path = ".env"
if os.path.exists(env_path):
    print(f"[OK] .env file found at {env_path}")
    with open(env_path, "r") as f:
        lines = f.readlines()
        print(f"[OK] .env contains {len(lines)} lines")
else:
    print(f"[FAIL] .env file NOT found at {env_path}")
    print(f"  Current directory: {os.getcwd()}")

print()

# Check each required var
vars_to_check = ["SUPABASE_URL", "SUPABASE_SERVICE_KEY", "GEMINI_API_KEY"]
for var in vars_to_check:
    value = os.getenv(var, "")
    if value:
        # Show first 10 chars and last 4 for security
        display = f"{value[:10]}...{value[-4:]}" if len(value) > 14 else "***"
        print(f"[OK] {var}: {display} (length: {len(value)})")
    else:
        print(f"[FAIL] {var}: NOT SET")

print("\n=== Test Gemini API ===\n")

try:
    import google.generativeai as genai
    
    api_key = os.getenv("GEMINI_API_KEY")
    if api_key:
        genai.configure(api_key=api_key)
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content("Say 'Hello' in JSON format with key 'message'.")
        print(f"[OK] Gemini API call successful!")
        print(f"  Response: {response.text[:200]}")
    else:
        print("[FAIL] GEMINI_API_KEY not set, cannot test API")
except Exception as e:
    print(f"[FAIL] Gemini API call failed: {type(e).__name__}: {str(e)}")

print()

