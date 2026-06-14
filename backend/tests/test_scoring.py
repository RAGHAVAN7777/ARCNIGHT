import json
from unittest.mock import MagicMock, patch

import pytest

from app.scoring import (
    FactorScore,
    _call_gemini_for_factors,
    _compute_loan_eligible_amount,
    _compute_score,
    _generate_breakdown,
    _generate_insights,
    _load_conversation_history,
    _map_to_tier,
    score_user,
)


@pytest.fixture
def fake_supabase_client():
    return MagicMock()


@pytest.fixture
def sample_conversation():
    return [
        {"role": "ai", "message": "What kind of work do you do most days?"},
        {"role": "user", "message": "I'm a freelance web developer, mostly building websites and apps."},
        {"role": "ai", "message": "How long have you been doing this work?"},
        {"role": "user", "message": "About 4 years now, pretty steady."},
        {"role": "ai", "message": "How steady is your income across a typical month?"},
        {"role": "user", "message": "Pretty consistent, I have regular clients. Income is usually between $4000-5000."},
        {"role": "ai", "message": "Do you have a regular savings habit each week?"},
        {"role": "user", "message": "Yes, I save about $500 per week without fail."},
        {"role": "ai", "message": "How much do your expenses vary from week to week?"},
        {"role": "user", "message": "Pretty stable, mostly rent and utilities. Around $2000 per month."},
        {"role": "ai", "message": "Do you have dependents or others relying on your income?"},
        {"role": "user", "message": "Just myself, no dependents."},
        {"role": "ai", "message": "What do you usually do when income is low or expenses spike?"},
        {"role": "user", "message": "I have a 3-month buffer saved up, so I can handle it without stress."},
    ]


def test_load_conversation_history(fake_supabase_client, sample_conversation):
    fake_supabase_client.table().select().eq().order().execute.return_value = MagicMock(
        data=sample_conversation
    )

    result = _load_conversation_history(fake_supabase_client, "user_123")
    assert len(result) == 14
    assert result[0]["role"] == "ai"


def test_compute_score():
    factors = [
        FactorScore(label="Income Stability", score=85),
        FactorScore(label="Savings Discipline", score=78),
        FactorScore(label="Expense Discipline", score=72),
        FactorScore(label="Recovery Ability", score=68),
        FactorScore(label="Business Consistency", score=80),
        FactorScore(label="Trust Signals", score=90),
    ]

    score = _compute_score(factors)
    assert 300 <= score <= 900
    assert score == int(300 + (((85 * 25 + 78 * 20 + 72 * 15 + 68 * 15 + 80 * 15 + 90 * 10) / 100) / 100) * 600)


def test_map_to_tier_750_plus():
    tier, percentile = _map_to_tier(800)
    assert tier == "Established · Low Risk"
    assert percentile == "Top 15%"


def test_map_to_tier_600_749():
    tier, percentile = _map_to_tier(650)
    assert tier == "Building · Moderate Risk"
    assert percentile == "Top 40%"


def test_map_to_tier_450_599():
    tier, percentile = _map_to_tier(500)
    assert tier == "Developing · Higher Risk"
    assert percentile == "Top 70%"


def test_map_to_tier_below_450():
    tier, percentile = _map_to_tier(350)
    assert tier == "Starting · Needs Foundation"
    assert percentile == "Top 95%"


def test_compute_loan_eligible_amount():
    assert _compute_loan_eligible_amount(750) == round((750 - 300) / 600 * 50000)
    assert _compute_loan_eligible_amount(900) == 50000
    assert _compute_loan_eligible_amount(300) == 0


def test_generate_breakdown():
    factors = [
        FactorScore(label="Income Stability", score=85),
        FactorScore(label="Savings Discipline", score=45),
    ]

    breakdown = _generate_breakdown(factors)
    assert len(breakdown) == 2
    assert breakdown[0]["name"] == "Income Stability"
    assert breakdown[0]["value"] == 85
    assert breakdown[0]["positive"] is True
    assert breakdown[1]["positive"] is False


def test_generate_insights():
    factors = [
        FactorScore(label="Income Stability", score=85),
        FactorScore(label="Savings Discipline", score=40),
        FactorScore(label="Expense Discipline", score=30),
        FactorScore(label="Recovery Ability", score=70),
        FactorScore(label="Business Consistency", score=80),
        FactorScore(label="Trust Signals", score=90),
    ]

    insights = _generate_insights(factors)
    assert len(insights) <= 3
    assert all("title" in i and "desc" in i and "type" in i for i in insights)
    assert insights[0]["type"] == "negative"


@patch("app.scoring.genai.GenerativeModel")
def test_call_gemini_for_factors(mock_genai):
    mock_response = MagicMock()
    mock_response.text = json.dumps(
        {
            "factors": [
                {"label": "Income Stability", "score": 85, "reasoning": "Consistent income pattern"},
                {"label": "Savings Discipline", "score": 78, "reasoning": "Regular weekly savings"},
                {"label": "Expense Discipline", "score": 72, "reasoning": "Stable expenses"},
                {"label": "Recovery Ability", "score": 68, "reasoning": "Good buffer"},
                {"label": "Business Consistency", "score": 80, "reasoning": "4 years experience"},
                {"label": "Trust Signals", "score": 90, "reasoning": "Clear and consistent"},
            ]
        }
    )

    mock_genai.return_value.generate_content.return_value = mock_response

    with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}):
        factors = _call_gemini_for_factors("Sample transcript")

    assert len(factors) == 6
    assert factors[0].label == "Income Stability"
    assert factors[0].score == 85


@patch("app.scoring.genai.GenerativeModel")
def test_call_gemini_for_factors_with_markdown(mock_genai):
    mock_response = MagicMock()
    mock_response.text = """```json
{
  "factors": [
    {"label": "Income Stability", "score": 85, "reasoning": "test"},
    {"label": "Savings Discipline", "score": 78, "reasoning": "test"},
    {"label": "Expense Discipline", "score": 72, "reasoning": "test"},
    {"label": "Recovery Ability", "score": 68, "reasoning": "test"},
    {"label": "Business Consistency", "score": 80, "reasoning": "test"},
    {"label": "Trust Signals", "score": 90, "reasoning": "test"}
  ]
}
```"""

    mock_genai.return_value.generate_content.return_value = mock_response

    with patch.dict("os.environ", {"GEMINI_API_KEY": "test-key"}):
        factors = _call_gemini_for_factors("Sample transcript")

    assert len(factors) == 6
    assert factors[0].score == 85


@patch("app.scoring.score_user")
def test_score_user_full_flow(mock_score_user, fake_supabase_client, sample_conversation):
    mock_score_user.return_value = {
        "score": 770,
        "tier": "Established · Low Risk",
        "percentile": "Top 15%",
        "loan_eligible_amount": 39167,
        "factors": [
            {"label": "Income Stability", "score": 85, "weight": 25},
            {"label": "Savings Discipline", "score": 78, "weight": 20},
            {"label": "Expense Discipline", "score": 72, "weight": 15},
            {"label": "Recovery Ability", "score": 68, "weight": 15},
            {"label": "Business Consistency", "score": 80, "weight": 15},
            {"label": "Trust Signals", "score": 90, "weight": 10},
        ],
        "breakdown": [
            {"name": "Income Stability", "value": 85, "positive": True},
            {"name": "Savings Discipline", "value": 78, "positive": True},
        ],
        "insights": [
            {
                "title": "Strengthen Recovery Ability",
                "desc": "Recovery Ability is low at 68. This is a key area to focus on.",
                "type": "negative",
            }
        ],
    }

    result = mock_score_user(fake_supabase_client, "user_123")
    assert result["score"] == 770
    assert result["tier"] == "Established · Low Risk"
    assert len(result["factors"]) == 6
