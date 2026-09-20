# Deploying QLearn (Render + Vercel + Supabase)

### 🌐 Live Production Endpoints
- **Frontend App:** [https://quantumlearn-ivory.vercel.app](https://quantumlearn-ivory.vercel.app)
- **Backend API:** [https://qlearning-72cw.onrender.com](https://qlearning-72cw.onrender.com)
- **Interactive Swagger Docs:** [https://qlearning-72cw.onrender.com/docs](https://qlearning-72cw.onrender.com/docs)

---

## Architecture Overview
- **Frontend:** Hosted on **Vercel** (`dist/` build output from Vite).
- **Backend:** Hosted on **Render** (Python FastAPI with Qiskit, Cirq, PennyLane).
- **API Proxy:** `vercel.json` automatically rewrites all `/api/*` requests directly to `https://qlearning-72cw.onrender.com/api/$1`.
- **Database:** Hosted on **Supabase** (PostgreSQL) with auto-migration and SQLite fallback.

---

## Step 1: Push Changes to GitHub

Commit your changes and push to `origin main`:

```powershell
git add .
git commit -m "Update deployment and configuration"
git push origin main
```

---

## Step 2: Backend Configuration on Render

- **Service Name:** `qlearning-72cw`
- **Build Command:** `python -m pip install --upgrade pip && pip install -r requirements.txt`
- **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
- **Environment Variables:**
  - `PYTHON_VERSION`: `3.11.9`
  - `DATABASE_URL`: `postgresql://postgres:Mousam%402026@db.wrvwhfvntcslzobnujfe.supabase.co:5432/postgres`
  - `CORS_ORIGINS`: `*`
  - *(Optional)* AI Keys: `GROQ_API_KEY`, `GEMINI_API_KEY`, or `OPENAI_API_KEY`

---

## Step 3: Frontend Deployment on Vercel

- **Project Name:** `quantumlearn-ivory`
- **Framework:** `Vite`
- **Root Directory:** `./`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Proxy Configuration:** Managed via `vercel.json` pointing to `https://qlearning-72cw.onrender.com/api/$1`.

---

## Alternative: Docker Deployment

To build and run QLearn locally or on any Docker-compatible cloud host (AWS EC2, DigitalOcean, GCP):

```powershell
# Build and start container named 'qlearn'
docker compose up -d --build

# View logs
docker logs -f qlearn
```
