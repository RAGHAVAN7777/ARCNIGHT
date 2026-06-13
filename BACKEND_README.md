# Vishwas AI — Backend Build Instructions
*Generated from analysis of the ARCNIGHT frontend (React + Vite + TS)*

## Frontend Analysis Summary
The frontend has 5 pages, currently running on hardcoded mock data:

| Page | Currently Mocked Data | Needs From Backend |
|---|---|---|
| `AssessmentPage` | `chatMessages` array (hardcoded Q&A), language list, fake file uploads | Real AI interview turn-by-turn + document parsing |
| `DashboardPage` | `factors` (6 score factors), `breakdownData` (8 explainability items), `insights` (3 cards), score=770 | Real score, breakdown, factors, insights from scoring agent |
| `SimulatorPage` | `computeYearlyProjection()` — pure frontend math | Can stay frontend-only OR be backed by `/simulate` (optional) |
| `SchemesPage` | `allSchemes` — 8 hardcoded govt schemes with `eligible`/`matchScore` | Real eligibility + match score based on user's score |

**Key finding:** the frontend is fully wired with realistic data shapes already — our job is to make the backend return JSON in *exactly* these shapes so we can swap mock arrays for `fetch()` calls with minimal frontend changes.

## Tech Stack
- **Backend:** FastAPI (Python)
- **Database:** Supabase (Postgres + client SDK)
- **AI:** Gemini API
- **Deployment:** Docker Compose (FastAPI only — Supabase is hosted/cloud)

## Engineering Principles (follow strictly)
1. **Spec before code** — for each endpoint, confirm request/response shape against the tables below before implementing.
2. **Small, verified slices** — one endpoint at a time, stop for review after each.
3. **Tests check behavior** — e.g. "given these chat answers, factors sum to a score in 300-900 range" — not internal function calls.
4. **No black boxes** — rubric weights and prompt design explained in plain language before coding.
5. **Commit at each stable point.**

---

## Endpoint Contracts

### Phase 1: Foundation
- Supabase project: create tables via Supabase SQL editor/dashboard
- FastAPI connects via `supabase-py` client (using project URL + service key)
- Tables: `users`, `conversations`, `scores`, `documents`
- `GET /health` → `{"status": "ok"}`
- **Stop for review.**

### Phase 2: Interview Agent (powers `AssessmentPage` Step 1)
`POST /interview`
```json
// Request
{ "user_id": "string", "message": "string", "language": "en" }

// Response — matches chatMessages shape
{ "role": "ai", "text": "string", "done": false }
```
- `done: true` on the final question, signaling frontend to enable "Generate Score"
- Each turn stored in `conversations` table
- ~6-8 fixed core questions: work type, duration, income, savings habit, expense variability, dependents/coping
- **Stop for review.**

### Phase 3: Document Parsing (powers `AssessmentPage` Step 2)
`POST /documents/upload`
```json
// Request: multipart file upload
// Response
{ "filename": "string", "status": "verified", "extracted_data": { } }
```
- Even a stub (`status: "verified"` always) is fine for demo — real OCR via Gemini multimodal is a stretch goal
- **Stop for review.**

### Phase 4: Scoring Agent (powers `DashboardPage`)
`POST /score`
```json
// Request
{ "user_id": "string" }

// Response — matches DashboardPage exactly
{
  "score": 770,
  "tier": "Established · Low Risk",
  "percentile": "Top 15%",
  "loan_eligible_amount": 50000,
  "factors": [
    { "label": "Income Stability", "score": 85, "weight": 25 },
    { "label": "Savings Discipline", "score": 78, "weight": 20 },
    { "label": "Expense Discipline", "score": 72, "weight": 15 },
    { "label": "Recovery Ability", "score": 68, "weight": 15 },
    { "label": "Business Consistency", "score": 80, "weight": 15 },
    { "label": "Trust Signals", "score": 90, "weight": 10 }
  ],
  "breakdown": [
    { "name": "Weekly Savings Habit", "value": 120, "positive": true },
    { "name": "Consistent Daily Income", "value": 80, "positive": true }
  ],
  "insights": [
    { "title": "Strong Income Pattern", "desc": "...", "type": "positive" }
  ]
}
```
- **Before coding:** propose the rubric — how the 6 factors are weighted and computed from conversation answers — for approval
- `factors` weights must sum to 100 (matches frontend: 25+20+15+15+15+10=100)
- `score` range: 300-900 (matches `SimulatorPage` Y-axis domain `[550,1000]` and base score 620)
- Store result in `scores` table with timestamp (enables history for demo)
- **Stop for review.**

### Phase 5: Schemes Matching (powers `SchemesPage`)
`GET /schemes?user_id={id}`
```json
// Response — array matching allSchemes shape
[
  {
    "name": "PM SVANidhi",
    "category": "street-vendors",
    "maxLoan": "₹50,000",
    "interest": "7% subsidy",
    "eligibility": "Street vendors with certificate of vending",
    "description": "...",
    "eligible": true,
    "matchScore": 95
  }
]
```
- Start with the 8 schemes already in frontend as a static seed list in DB
- `eligible` + `matchScore` computed from user's score/factors (e.g. score > threshold per scheme)
- **Stop for review.**

### Phase 6: Score History (for before/after demo)
`GET /score-history/{user_id}`
```json
[
  { "date": "2026-05-13", "score": 620 },
  { "date": "2026-06-13", "score": 770 }
]
```
- Seed script creates a "30 days ago" and "today" entry for demo user
- **Stop for review.**

---

## What NOT to do
- Don't touch `SimulatorPage` — its projection math is pure frontend, leave as-is unless asked
- Don't add Redis/Celery/Spring Boot
- Don't build voice/audio — text only
- Don't modify any frontend files unless explicitly asked
- Don't invent new data shapes — match the tables above exactly so frontend integration is a drop-in swap

## Workflow Reminder
After each phase: summarize what was built, flag ambiguities, wait for go-ahead before next phase.