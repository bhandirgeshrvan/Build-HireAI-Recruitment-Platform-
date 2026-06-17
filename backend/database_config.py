from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_LINK")

# pgbouncer=true is required for Supabase connection pooler (port 6543)
# pool_pre_ping keeps connections healthy on Render's free tier
engine = create_engine(
    DATABASE_URL,
    connect_args={"options": "-c statement_timeout=30000"},
    pool_pre_ping=True,
    pool_recycle=300,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
