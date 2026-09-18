# Quantum Robot

Quantum Robot is an interactive quantum-computing education platform. It combines lessons, visual circuit building, quantum-state visualizations, AI tutoring, assessments, authentication, and multiplayer collaboration in one web application.

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Three.js, Recharts, Lucide React
- **Backend:** Python, FastAPI, Uvicorn, Pydantic, SQLAlchemy
- **Quantum computing:** Qiskit, Qiskit Aer, Cirq, PennyLane, and a native simulator
- **Databases:** SQLite by default; PostgreSQL and MongoDB are optional
- **AI integrations:** Gemini, Groq, OpenAI/OpenRouter, Anthropic, or local Ollama, with an offline fallback engine
- **Realtime communication:** FastAPI WebSockets

## Requirements

- Node.js 18+ and npm
- Python 3.10+
- Git
- PostgreSQL only if you choose PostgreSQL instead of the default SQLite database
- MongoDB only if you need MongoDB analytics features

The default setup needs no database server: SQLite is created automatically when the backend starts.

## Project Structure

The frontend is grouped under `frontend/`, while the Python API remains under `backend/`:

```text
frontend/
	index.html
	src/
backend/
	main.py
	requirements.txt
```

Run frontend commands from the repository root. Vite is configured to use `frontend/` as its application root.

## Setup on Ubuntu

Open a terminal and follow the steps in order. Commands beginning with `$` are examples of what you type.

### 1. Install system requirements

```bash
$ sudo apt update
$ sudo apt install -y git python3 python3-venv python3-pip nodejs npm
$ node --version
$ python3 --version
```

If Node.js is older than 18, install a current LTS release from [nodejs.org](https://nodejs.org/) before continuing.

### 2. Get the project

```bash
$ git clone <your-repository-url>
$ cd Quantum-Robot
```

If the project is already on your computer, use `cd` to enter its directory instead.

### 3. Choose and configure the database

**Recommended first run: SQLite**

SQLite is the default. No database installation or manual schema migration is required. The backend creates `quantum_edu.db` and runs the schema migration when it starts.

```bash
$ cp .env.example .env
$ sed -i 's/^POSTGRES_URL=.*/POSTGRES_URL=/' .env
$ sed -i 's/^MONGODB_URL=.*/MONGODB_URL=/' .env
```

Add at least one AI provider key to `.env` if you want cloud-powered tutoring. You can leave the placeholder keys unchanged to use the local fallback engine.

**Optional: PostgreSQL**

Choose this only if you need a server database:

```bash
$ sudo apt install -y postgresql postgresql-contrib
$ sudo systemctl enable --now postgresql
$ sudo -u postgres psql
```

At the PostgreSQL prompt, create a database and user, then exit:

```sql
CREATE USER quantum_user WITH PASSWORD 'change_this_password';
CREATE DATABASE quantum_db OWNER quantum_user;
\q
```

Edit `.env` and set one of these values. `POSTGRES_URL` takes precedence over `DATABASE_URL`:

```dotenv
POSTGRES_URL=postgresql://quantum_user:change_this_password@localhost:5432/quantum_db
DATABASE_URL=postgresql://quantum_user:change_this_password@localhost:5432/quantum_db
```

Do not commit `.env` or real credentials.

### 4. Install backend dependencies and initialize the database

```bash
$ python3 -m venv .venv
$ source .venv/bin/activate
$ python -m pip install --upgrade pip
$ python -m pip install -r backend/requirements.txt
$ python -m backend.main
```

Keep this terminal open. On the first start, wait for the API to listen on port `8001`; the database tables and initial data are created automatically. Press `Ctrl+C` after confirming it starts, then run the reloadable command instead:

```bash
$ python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
```

Open a second terminal for the frontend. If the shell does not show `(.venv)`, run `source .venv/bin/activate` again.

### 5. Install and run the frontend

```bash
$ npm install
$ npm run dev
```

Open <http://localhost:3000>. The frontend proxies `/api` requests to the backend at `http://127.0.0.1:8001`.

### 6. Verify the complete setup

In a browser or another terminal, check both services:

```bash
$ curl http://localhost:8001/
$ curl http://localhost:8001/api/db/health
```

The second response should report the active SQL engine and its tables. If both commands work, register a test account in the UI and try the quantum workspace.

## Setup on Windows

Use **PowerShell** for the commands below. Run PowerShell as Administrator only for software installation.

### 1. Install requirements

Install Git, Node.js 18+ LTS, and Python 3.10+ from their official installers. During Python installation, select **Add Python to PATH**. Confirm:

```powershell
PS> git --version
PS> node --version
PS> python --version
```

### 2. Get the project

```powershell
PS> git clone <your-repository-url>
PS> cd Quantum-Robot
```

For an existing checkout, only run `cd` into the project directory.

### 3. Choose and configure the database

**Recommended first run: SQLite**

```powershell
PS> Copy-Item .env.example .env
```

Leave `DATABASE_URL=sqlite:///./quantum_edu.db` in `.env`. The backend creates and migrates the SQLite database automatically. Add an AI provider key if cloud tutoring is required; otherwise the offline fallback remains available.

**Optional: PostgreSQL**

Install PostgreSQL for Windows, create a database named `quantum_db` and a user with a password, then set this in `.env`:

```dotenv
POSTGRES_URL=postgresql://quantum_user:change_this_password@localhost:5432/quantum_db
DATABASE_URL=postgresql://quantum_user:change_this_password@localhost:5432/quantum_db
```

The backend creates the application tables on its first successful connection. Do not commit `.env` or real credentials.

### 4. Install backend dependencies and initialize the database

```powershell
PS> py -m venv .venv
PS> .\.venv\Scripts\Activate.ps1
PS> python -m pip install --upgrade pip
PS> python -m pip install -r backend\requirements.txt
PS> python -m backend.main
```

Keep this terminal open until you confirm the backend starts on port `8001`. Press `Ctrl+C`, then start the reloadable development server:

```powershell
PS> python -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8001
```

If PowerShell blocks virtual-environment activation, run this once in the current PowerShell window and activate again:

```powershell
PS> Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### 5. Install and run the frontend

Open a second PowerShell window, enter the project directory, and run:

```powershell
PS> cd path\to\Quantum-Robot
PS> npm install
PS> npm run dev
```

Open <http://localhost:3000>. Vite forwards frontend API requests to the FastAPI server on port `8001`.

### 6. Verify the complete setup

```powershell
PS> Invoke-WebRequest http://localhost:8001/
PS> Invoke-WebRequest http://localhost:8001/api/db/health
```

Open the response URLs in a browser if you want to inspect the JSON. Then register a test account and use the quantum workspace.

## Useful Commands

```bash
# Frontend production build
npm run build

# Frontend preview after building
npm run preview

# Backend tests
python -m pytest
```

## Troubleshooting

- **Port 3000 or 8001 is busy:** stop the process using the port, or change the Vite/backend port and update the proxy or `.env` URLs together.
- **`ModuleNotFoundError` in the backend:** activate `.venv` and run `python -m pip install -r backend/requirements.txt` again.
- **Database connection failure:** start PostgreSQL, confirm the database credentials, and ensure `POSTGRES_URL` is a valid SQLAlchemy PostgreSQL URL. Remove it from `.env` to return to SQLite.
- **AI responses use the fallback engine:** check that the selected provider key is valid and that the corresponding endpoint is reachable. The application can still run without a cloud key.
- **Browser cannot reach the API:** confirm the backend terminal is running and that `http://localhost:8001/` returns JSON before refreshing the frontend.