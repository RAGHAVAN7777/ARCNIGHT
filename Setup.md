# Vishwas AI — Backend Setup

## Status
- ✅ Phase 1: FastAPI scaffold + Supabase schema (`/health` endpoint)
- ✅ Phase 2: Interview Agent (`POST /interview`) — 7-question fixed flow, stores conversation in Supabase
- ⏳ Phase 3+: Document parsing, scoring agent, schemes matching — not yet implemented

## What You Need Installed
- **Python 3.10+**
- **A Supabase account** (free tier is fine) — you'll need a project URL + service key
- All Python packages are listed in `backend/requirements.txt` and installed in one step below (includes FastAPI, Uvicorn, Supabase client, and test dependencies)

## Setup
1. Clone the repo and go to the backend folder:
   ```bash
   cd backend
   ```

2. Create a virtual environment **inside the `backend/` folder** (don't create one at repo root):
   ```bash
   python -m venv venv
   venv\Scripts\activate      # Windows
   source venv/bin/activate   # Mac/Linux
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Set up environment variables — copy `.env.example` to `.env` and fill in:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   ```
   Get these from your Supabase project → Settings → API. **Never commit `.env`** — it's already in `.gitignore`.
   Get these values from Supabase Dashboard → Project Settings → API.
   **Never commit `.env`** — it's already in `.gitignore`.

5. Create the database tables — paste `sql/schema.sql` into your Supabase project's SQL Editor and run it.

6. Run the server (from inside `backend/`, with venv activated):
   ```bash
   python -m uvicorn app.main:app --reload
   ```
   (If `uvicorn` command isn't recognized directly, always use the `python -m uvicorn ...` form above.)

7. Verify it's working:
   - `GET http://127.0.0.1:8000/health` → should return `{"status":"ok"}`
   - `POST http://127.0.0.1:8000/interview` → returns the first interview question

## .gitignore Checklist
Make sure `.gitignore` includes:
```
.env
venv/
.venv/
__pycache__/
*.pyc
node_modules/
```

## Running Tests
```bash
python -m unittest discover backend/tests
```