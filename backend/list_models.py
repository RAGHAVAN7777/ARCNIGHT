#!/usr/bin/env python
"""List available Gemini models."""
import os
from dotenv import load_dotenv

load_dotenv()

import google.generativeai as genai

api_key = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=api_key)

print("\nAvailable Gemini models:\n")
for model in genai.list_models():
    if "generateContent" in model.supported_generation_methods:
        print(f"✓ {model.name}")

print()
