from app.schemes import SCHEMES_CATALOG, match_schemes_for_user


def test_match_schemes_basic():
    user_id = "user_test"
    score_record = {
        "score": 770,
        "factors": [
            {"label": "Income Stability", "score": 85},
            {"label": "Savings Discipline", "score": 78},
            {"label": "Expense Discipline", "score": 72},
            {"label": "Recovery Ability", "score": 68},
            {"label": "Business Consistency", "score": 80},
            {"label": "Trust Signals", "score": 90},
        ],
    }

    result = match_schemes_for_user(user_id, score_record)
    assert result["user_id"] == user_id
    assert "schemes" in result
    assert len(result["schemes"]) >= 1
    # top scheme should be microloan or expansion based on catalog
    top = result["schemes"][0]
    assert "match_score" in top
    assert top["match_score"] >= 0
