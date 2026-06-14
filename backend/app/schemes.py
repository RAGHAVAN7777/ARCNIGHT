from __future__ import annotations

from typing import Any, Dict, List, Tuple
from pydantic import BaseModel
import math

# Scheme definition model
class Scheme(BaseModel):
    id: str
    name: str
    description: str
    min_score: int = 300
    factor_targets: Dict[str, int] = {}
    factor_weights: Dict[str, int] = {}
    eligibility_threshold: int = 60
    priority: int = 50
    loan_cap_formula: str | None = None
    recommended_actions: List[str] = []
    required_documents: List[str] = []


# Hard-coded scheme catalog for hackathon; can be moved to DB in future
SCHEMES_CATALOG = [
    Scheme(
        id="microloan-01",
        name="Micro Loan",
        description="Small business microloan for working capital.",
        min_score=450,
        factor_targets={
            "Income Stability": 70,
            "Business Consistency": 60,
            "Trust Signals": 60,
        },
        factor_weights={
            "Income Stability": 40,
            "Business Consistency": 35,
            "Trust Signals": 25,
        },
        eligibility_threshold=65,
        priority=10,
        loan_cap_formula="min(50000, (score-300)/600*50000)",
        recommended_actions=["Open a bank account", "Provide UPI history"],
        required_documents=["ID", "Bank statement"],
    ),
    Scheme(
        id="emergency-01",
        name="Emergency Buffer Loan",
        description="Short-term small emergency loan.",
        min_score=300,
        factor_targets={"Recovery Ability": 80, "Savings Discipline": 50},
        factor_weights={"Recovery Ability": 70, "Savings Discipline": 30},
        eligibility_threshold=55,
        priority=20,
        loan_cap_formula="min(10000, (score-300)/600*10000)",
        recommended_actions=["Set up automatic weekly savings"],
        required_documents=["ID"],
    ),
    Scheme(
        id="expansion-01",
        name="Business Expansion",
        description="Larger loan for expanding micro-businesses.",
        min_score=650,
        factor_targets={"Business Consistency": 85, "Income Stability": 80},
        factor_weights={"Business Consistency": 60, "Income Stability": 40},
        eligibility_threshold=70,
        priority=5,
        loan_cap_formula="min(200000, (score-300)/600*200000)",
        recommended_actions=["Document sales for last 6 months"],
        required_documents=["ID", "6 months bank statement"],
    ),
    Scheme(
        id="savings-01",
        name="Savings Booster Grant",
        description="Small grant to bootstrap formal savings.",
        min_score=300,
        factor_targets={"Savings Discipline": 40},
        factor_weights={"Savings Discipline": 100},
        eligibility_threshold=50,
        priority=30,
        loan_cap_formula=None,
        recommended_actions=["Enroll in direct debit savings"],
        required_documents=["ID"],
    ),
]


def _normalize_score_to_0_100(score: int) -> float:
    # score in 300-900 -> normalize to 0-100
    clamped = max(300, min(900, score))
    return (clamped - 300) / 600 * 100


def _factor_alignment(user_factors: Dict[str, int], scheme: Scheme) -> float:
    # Factor alignment: Σ( (100 - |F_u[i] - F_s[i]|) × W_s[i] ) / 100
    total_weight = sum(scheme.factor_weights.values()) or 100
    acc = 0.0
    for label, w in scheme.factor_weights.items():
        Fu = user_factors.get(label, 50)
        Fs = scheme.factor_targets.get(label, 50)
        acc += (100 - abs(Fu - Fs)) * (w / total_weight)  # weighted
    # acc is 0-100
    return acc


def _evaluate_scheme(user_score: int, user_factors: List[Dict], scheme: Scheme) -> Tuple[float, bool, Dict]:
    # Convert factors list to dict
    user_factors_map = {f["label"]: f["score"] for f in user_factors}
    final_norm = _normalize_score_to_0_100(user_score)
    factor_align = _factor_alignment(user_factors_map, scheme)
    base_match = 0.7 * final_norm + 0.3 * factor_align

    eligible = True
    reasons = []
    if user_score < scheme.min_score:
        eligible = False
        reasons.append(f"Final score {user_score} below scheme min {scheme.min_score}")

    # check hard factor minimums if present
    for label, minv in scheme.factor_targets.items():
        userv = user_factors_map.get(label, 0)
        if userv < minv * 0.6:  # treat target as soft; if user < 60% of target, consider reason
            reasons.append(f"{label} below desired target ({userv} < {minv})")

    details = {
        "final_norm": final_norm,
        "factor_alignment": factor_align,
        "base_match": base_match,
        "reasons": reasons,
    }

    return base_match, eligible, details


def match_schemes_for_user(user_id: str, score_record: Dict, top_n: int = 5) -> Dict:
    # score_record contains 'score' and 'factors' list
    user_score = int(score_record.get("score", 300))
    user_factors = score_record.get("factors", [])

    results = []
    for scheme in SCHEMES_CATALOG:
        match_score, eligible, details = _evaluate_scheme(user_score, user_factors, scheme)
        results.append(
            {
                "id": scheme.id,
                "name": scheme.name,
                "description": scheme.description,
                "eligible": eligible and (match_score >= scheme.eligibility_threshold),
                "match_score": round(match_score),
                "reasons": details.get("reasons", []),
                "required_documents": scheme.required_documents,
                "recommended_actions": scheme.recommended_actions,
                "priority": scheme.priority,
                "details": details,
            }
        )

    # sort
    results.sort(key=lambda r: (r["match_score"], -r["priority"]), reverse=True)
    return {
        "user_id": user_id,
        "source_score": score_record,
        "schemes": results[:top_n],
    }
