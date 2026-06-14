from __future__ import annotations

import json
import logging
import os
from typing import Any

import google.generativeai as genai
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)

RUBRIC = """
## Question → Factor Mapping

| Interview Question | Primary Factor | Secondary |
|---|---|---|
| What kind of work do you do most days? | Business Consistency | Trust Signals |
| How long have you been doing this work? | Business Consistency | Trust Signals |
| How steady is your income across a typical month? | Income Stability | — |
| Do you have a regular savings habit each week? | Savings Discipline | — |
| How much do your expenses vary from week to week? | Expense Discipline | — |
| Do you have dependents or others relying on your income? | Trust Signals | Recovery Ability |
| What do you usually do when income is low or expenses spike? | Recovery Ability | Expense Discipline |

## Rubric (0-100 per factor)

**Income Stability** (Q3): 80-100 steady/consistent · 50-79 some variation but recognizable pattern · 20-49 highly irregular, no pattern · 0-19 stopped/extremely sparse

**Savings Discipline** (Q4): 80-100 regular saving even small amounts · 50-79 occasional/inconsistent · 20-49 rarely saves but aware · 0-19 no savings at all

**Expense Discipline** (Q5, context Q7): 80-100 stable/predictable, low variance · 50-79 moderate variance, manageable · 20-49 high variance, expenses often exceed income · 0-19 wildly unpredictable, frequent shortfalls

**Recovery Ability** (Q7, context Q6): 80-100 clear coping strategy (buffer, repays borrowed money, adjusts spending) · 50-79 reactive/stressful response (skips meals, delays payments) · 20-49 no real strategy, "manages somehow" · 0-19 crisis every time (debt traps, desperation)

**Business Consistency** (Q1, Q2): 80-100 2+ years, clear consistent work · 50-79 6mo-2yr or slightly variable · 20-49 under 6mo or frequently changing · 0-19 very new, no track record

**Trust Signals** (Q1, Q2, Q6 — overall plausibility/coherence): 80-100 detailed, specific, internally consistent · 50-79 reasonable but vague · 20-49 inconsistent/contradictory · 0-19 evasive/contradictory/nonsensical
"""

FACTOR_WEIGHTS = {
    "Income Stability": 25,
    "Savings Discipline": 20,
    "Expense Discipline": 15,
    "Recovery Ability": 15,
    "Business Consistency": 15,
    "Trust Signals": 10,
}


class FactorScore(BaseModel):
    label: str
    score: int = Field(ge=0, le=100)
    reasoning: str = ""


class RubricResponse(BaseModel):
    factors: list[FactorScore]


def _load_conversation_history(supabase_client: Any, user_id: str) -> list[dict[str, Any]]:
    result = (
        supabase_client.table("conversations")
        .select("role,message,language,created_at")
        .eq("user_id", user_id)
        .order("created_at")
        .execute()
    )
    return list(result.data or [])


def _call_gemini_for_factors(transcript: str) -> list[FactorScore]:
    api_key = os.getenv("GEMINI_API_KEY", "")
    logger.info(f"Gemini API key present: {bool(api_key)}, length: {len(api_key) if api_key else 0}")
    
    if not api_key:
        logger.error("GEMINI_API_KEY not found in environment variables")
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    
    genai.configure(api_key=api_key)

    prompt = f"""You are a financial assessment expert. Using the provided rubric and conversation transcript, score the user across 6 factors.

{RUBRIC}

## Conversation Transcript
{transcript}

## Task
Analyze the transcript and return a JSON object with exactly 6 factors in this order:
1. Income Stability
2. Savings Discipline
3. Expense Discipline
4. Recovery Ability
5. Business Consistency
6. Trust Signals

Each factor should have:
- label: exact name from the list above
- score: 0-100 integer
- reasoning: 1-2 sentence explanation

Return ONLY valid JSON, no markdown or extra text.
"""

    logger.info(f"Calling Gemini with transcript length: {len(transcript)} chars")
    
    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        text = response.text.strip()
        
        logger.info(f"Raw Gemini response (first 500 chars): {text[:500]}")
        logger.info(f"Full response length: {len(text)} chars")
    except Exception as e:
        logger.error(f"Gemini API call failed: {type(e).__name__}: {str(e)}")
        raise

    if text.startswith("```"):
        logger.info("Response has markdown wrapper, stripping...")
        text = text.split("```")[1]
        if text.startswith("json"):
            text = text[4:]
        text = text.strip()
        logger.info(f"After stripping markdown: {text[:300]}")

    try:
        parsed = json.loads(text)
        logger.info(f"Successfully parsed JSON, got {len(parsed.get('factors', []))} factors")
    except json.JSONDecodeError as e:
        logger.error(f"JSON parsing failed: {str(e)}")
        logger.error(f"Raw text that failed to parse: {text[:500]}")
        raise
    
    return [FactorScore(**f) for f in parsed.get("factors", [])]


def _compute_score(factors: list[FactorScore]) -> int:
    weighted_sum = sum(f.score * FACTOR_WEIGHTS.get(f.label, 0) for f in factors)
    weighted_avg = weighted_sum / 100
    final_score = int(300 + (weighted_avg / 100) * 600)
    return max(300, min(900, final_score))


def _map_to_tier(score: int) -> tuple[str, str]:
    if score >= 750:
        return "Established · Low Risk", "Top 15%"
    elif score >= 600:
        return "Building · Moderate Risk", "Top 40%"
    elif score >= 450:
        return "Developing · Higher Risk", "Top 70%"
    else:
        return "Starting · Needs Foundation", "Top 95%"


def _compute_loan_eligible_amount(score: int) -> int:
    return round((score - 300) / 600 * 50000)


def _generate_breakdown(factors: list[FactorScore]) -> list[dict[str, Any]]:
    return [
        {"name": f.label, "value": f.score, "positive": f.score >= 50}
        for f in factors
    ]


def _generate_insights(factors: list[FactorScore]) -> list[dict[str, Any]]:
    sorted_factors = sorted(factors, key=lambda f: f.score)
    lowest_2_or_3 = sorted_factors[:3] if len(sorted_factors) >= 3 else sorted_factors

    insights = []
    for factor in lowest_2_or_3:
        title = f"Strengthen {factor.label}"
        if factor.score >= 70:
            desc = f"{factor.label} is solid at {factor.score}. Continue this momentum."
            insight_type = "positive"
        elif factor.score >= 50:
            desc = f"{factor.label} is moderate at {factor.score}. There's room to improve here."
            insight_type = "neutral"
        else:
            desc = f"{factor.label} is low at {factor.score}. This is a key area to focus on."
            insight_type = "negative"

        insights.append({"title": title, "desc": desc, "type": insight_type})

    return insights[:3]


def score_user(supabase_client: Any, user_id: str) -> dict[str, Any]:
    logger.info(f"Starting score_user for user_id: {user_id}")
    
    history = _load_conversation_history(supabase_client, user_id)
    logger.info(f"Loaded {len(history)} conversation turns")

    if not history:
        logger.error(f"No conversation history found for user {user_id}")
        raise ValueError("No conversation history found for user")

    transcript = "\n".join(
        [f"{turn.get('role', 'unknown').upper()}: {turn.get('message', '')}" for turn in history]
    )
    logger.info(f"Built transcript, length: {len(transcript)} chars")

    logger.info("Calling Gemini to score factors...")
    factors = _call_gemini_for_factors(transcript)
    logger.info(f"Got {len(factors)} factors from Gemini: {[f.label for f in factors]}")

    final_score = _compute_score(factors)
    tier, percentile = _map_to_tier(final_score)
    loan_eligible_amount = _compute_loan_eligible_amount(final_score)
    breakdown = _generate_breakdown(factors)
    insights = _generate_insights(factors)

    response = {
        "score": final_score,
        "tier": tier,
        "percentile": percentile,
        "loan_eligible_amount": loan_eligible_amount,
        "factors": [
            {"label": f.label, "score": f.score, "weight": FACTOR_WEIGHTS.get(f.label, 0)}
            for f in factors
        ],
        "breakdown": breakdown,
        "insights": insights,
    }

    supabase_client.table("scores").insert(
        {
            "user_id": user_id,
            "score": final_score,
            "tier": tier,
            "percentile": percentile,
            "loan_eligible_amount": loan_eligible_amount,
            "factors": [f.__dict__ for f in factors],
            "breakdown": breakdown,
            "insights": insights,
        }
    ).execute()

    return response
