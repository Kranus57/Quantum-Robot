# Deploying QLearn (Render + Vercel)

This project is configured for cloud deployment under the project name **`qlearn`** using **Render** for the Python FastAPI backend and **Vercel** for the React Vite frontend.

---

## Step 1: Push Changes to GitHub

Commit the deployment configuration files to your repository:

```powershell
git add .
git commit -m "Configure QLearn deployment for Render and Vercel"
git push origin main
```

---

## Step 2: Deploy Backend to Render (Name: `qlearn-api`)

1. Go to **[dashboard.render.com](https://dashboard.render.com/)** and sign in.
2. Click **New +** → **Web Service** (or **Blueprint** to use `render.yaml` automatically).
3. Connect your GitHub repository: `Kranus57/Quantum-Robot`.
4. Configure the Web Service:
   - **Name:** `qlearn-api`
   - **Language / Runtime:** `Python 3`
   - **Branch:** `main`
   - **Build Command:** `pip install -r backend/requirements.txt`
   - **Start Command:** `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
5. **Environment Variables** (under *Advanced* or *Environment* tab):
   - `PYTHON_VERSION`: `3.10.12`
   - `DATABASE_URL`: `sqlite:///./quantum_edu.db` (or a PostgreSQL connection string)
   - *(Optional)* `GEMINI_API_KEY`, `GROQ_API_KEY`, or `OPENAI_API_KEY` for AI tutoring.
6. Click **Create Web Service**.
7. Once deployed, copy your backend URL (e.g., `https://qlearn-api.onrender.com`).

---

## Step 3: Deploy Frontend to Vercel (Name: `qlearn`)

1. Go to **[vercel.com/new](https://vercel.com/new)** and sign in.
2. Under **Import Git Repository**, select `Quantum-Robot`.
3. Configure the project:
   - **Project Name:** `qlearn`
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. **API Proxy Route (`vercel.json`)**:
   - The included `vercel.json` automatically proxies `/api/*` calls to `https://qlearn-api.onrender.com/api/*`.
   - If your Render URL has a different domain name, update the destination in `vercel.json` or add `VITE_API_URL` as an environment variable in Vercel.
5. Click **Deploy**.

Your frontend will be live at `https://qlearn.vercel.app` (or your chosen custom domain).

---

## Alternative: Docker Deployment

To build and run QLearn locally or on any Docker-compatible cloud host (AWS EC2, DigitalOcean, GCP):

```powershell
# Build and start container named 'qlearn'
docker compose up -d --build

# View logs
docker logs -f qlearn
```
