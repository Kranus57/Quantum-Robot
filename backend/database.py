import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from sqlalchemy import create_engine, inspect, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# Database URL: Supports PostgreSQL via POSTGRES_URL or DATABASE_URL, defaults to SQLite
raw_db_url = os.getenv("POSTGRES_URL") or os.getenv("DATABASE_URL") or "sqlite:///./quantum_edu.db"

# Fix SQLAlchemy compatibility for postgres:// URLs (Heroku / Supabase / Render)
if raw_db_url.startswith("postgres://"):
    raw_db_url = raw_db_url.replace("postgres://", "postgresql://", 1)

DATABASE_URL = raw_db_url
connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(DATABASE_URL, connect_args=connect_args)
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
        print(f"MongoDB connection initialized successfully for quantum_edu_db")
    except Exception as mongo_err:
        print(f"MongoDB connection note: {mongo_err}")

def auto_migrate_schema():
    """Ensure existing SQLite/PostgreSQL DB tables match latest models columns"""
    try:
        inspector = inspect(engine)
        if "users" in inspector.get_table_names():
            columns = [c["name"] for c in inspector.get_columns("users")]
            with engine.connect() as conn:
                if "password_hash" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN password_hash VARCHAR DEFAULT 'pbkdf2:sha256$hashed'"))
                if "user_background" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN user_background VARCHAR DEFAULT 'cs-undergrad'"))
                if "role" not in columns:
                    conn.execute(text("ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'student'"))
                conn.commit()
    except Exception as e:
        print(f"Auto-migration note: {e}")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_mongo_db():
    return mongo_db


