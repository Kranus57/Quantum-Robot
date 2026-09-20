import os
import sys

# Ensure root directory and backend directory are in sys.path for direct module execution
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

from urllib.parse import quote_plus

def sanitize_db_url(url: str) -> str:
    """Sanitize database URL by URL-encoding special characters in password and validating scheme."""
    if not url:
        return "sqlite:///./quantum_edu.db"
    url = url.strip()
    # Guard against accidental HTTP(S) Supabase project endpoints
    if url.startswith("https://") or url.startswith("http://"):
        return "sqlite:///./quantum_edu.db"
    if url.startswith("postgres://"):
        url = url.replace("postgres://", "postgresql://", 1)
    # If password has unencoded '@', extract and URL-encode it
    if "://" in url and "@" in url:
        prefix, rest = url.split("://", 1)
        at_index = rest.rfind("@")
        if at_index != -1:
            userpass = rest[:at_index]
            host_and_rest = rest[at_index + 1:]
            if ":" in userpass:
                user, password = userpass.split(":", 1)
                if "@" in password and "%40" not in password:
                    password = quote_plus(password)
                url = f"{prefix}://{user}:{password}@{host_and_rest}"
    return url

# Database URL: Supports PostgreSQL via POSTGRES_URL or DATABASE_URL, defaults to SQLite
raw_candidate = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL") or "sqlite:///./quantum_edu.db"
if raw_candidate.startswith("http://") or raw_candidate.startswith("https://"):
    raw_candidate = os.getenv("POSTGRES_URL") or "sqlite:///./quantum_edu.db"

raw_db_url = sanitize_db_url(raw_candidate)

# Cloud safety check: If deployed on Render and URL points to local machine (localhost), fallback to SQLite
if os.getenv("RENDER") and ("localhost" in raw_db_url or "127.0.0.1" in raw_db_url):
    print("Notice: Detected 'localhost' database on cloud environment (Render). Falling back to SQLite.")
    raw_db_url = "sqlite:///./quantum_edu.db"

DATABASE_URL = raw_db_url
is_sqlite = DATABASE_URL.startswith("sqlite")

engine_kwargs = {"connect_args": {"check_same_thread": False}} if is_sqlite else {"pool_pre_ping": True, "pool_recycle": 3600}
engine = create_engine(DATABASE_URL, **engine_kwargs)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# MongoDB Integration Support
MONGODB_URL = os.getenv("MONGODB_URL") or os.getenv("MONGO_URI")
mongo_client = None
mongo_db = None

if MONGODB_URL:
    try:
        from pymongo import MongoClient
        mongo_client = MongoClient(MONGODB_URL, serverSelectionTimeoutMS=2000)
        mongo_db = mongo_client["quantum_edu_db"]
        print("MongoDB connection initialized successfully for quantum_edu_db")
    except Exception as mongo_err:
        print(f"MongoDB connection note: {mongo_err}")

def auto_migrate_schema():
    """Ensure existing SQLite/PostgreSQL DB tables match latest models columns dynamically"""
    try:
        inspector = inspect(engine)
        existing_tables = inspector.get_table_names()
        
        with engine.connect() as conn:
            # 1. users table migrations
            if "users" in existing_tables:
                user_cols = [c["name"] for c in inspector.get_columns("users")]
                if "password_hash" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR DEFAULT 'pbkdf2:sha256$hashed'"))
                if "user_background" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN user_background VARCHAR DEFAULT 'cs-undergrad'"))
                if "role" not in user_cols:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'student'"))
            
            # 2. quantum_circuits table migrations
            if "quantum_circuits" in existing_tables:
                circuit_cols = [c["name"] for c in inspector.get_columns("quantum_circuits")]
                if "qasm_code" not in circuit_cols:
                    conn.execute(text("ALTER TABLE quantum_circuits ADD COLUMN qasm_code TEXT"))
                if "framework" not in circuit_cols:
                    conn.execute(text("ALTER TABLE quantum_circuits ADD COLUMN framework VARCHAR DEFAULT 'qiskit'"))

            # 3. module_test_results table migrations
            if "module_test_results" in existing_tables:
                test_cols = [c["name"] for c in inspector.get_columns("module_test_results")]
                if "details_json" not in test_cols:
                    conn.execute(text("ALTER TABLE module_test_results ADD COLUMN details_json JSON"))

            conn.commit()
            print("Database schema auto-migration completed successfully.")
    except Exception as e:
        print(f"Auto-migration note: {e}")

def init_db():
    """Initialize database tables and run schema auto-migrations with fallback"""
    global engine, SessionLocal, DATABASE_URL, is_sqlite
    try:
        Base.metadata.create_all(bind=engine)
        auto_migrate_schema()
    except Exception as err:
        print(f"Warning: Primary database connection failed ({err}). Falling back to SQLite...")
        DATABASE_URL = "sqlite:///./quantum_edu.db"
        is_sqlite = True
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
        SessionLocal.configure(bind=engine)
        Base.metadata.create_all(bind=engine)
        auto_migrate_schema()

def get_db():
    """FastAPI Dependency for SQLAlchemy session handling"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mongo_db():
    """Retrieve active MongoDB handle (or None if unconfigured)"""
    return mongo_db

def check_db_health():
    """Check database operational health for both RDBMS and MongoDB"""
    health = {
        "status": "healthy",
        "rdbms": {
            "engine": "SQLite" if is_sqlite else "PostgreSQL",
            "url": DATABASE_URL.split("@")[-1] if "@" in DATABASE_URL else DATABASE_URL,
            "tables": []
        },
        "mongodb": {
            "connected": False,
            "database": "quantum_edu_db" if mongo_db is not None else None
        }
    }
    
    try:
        inspector = inspect(engine)
        health["rdbms"]["tables"] = inspector.get_table_names()
    except Exception as err:
        health["rdbms"]["error"] = str(err)
        health["status"] = "degraded"

    if mongo_client:
        try:
            mongo_client.admin.command('ping')
            health["mongodb"]["connected"] = True
        except Exception as mongo_err:
            health["mongodb"]["error"] = str(mongo_err)

    return health



