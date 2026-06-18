"""
Run once to drop all tables and recreate with the latest schema:
    python reset_db.py
"""
from database_config import engine, Base
from sqlalchemy import text
import models.models  # noqa — registers all models

print("Dropping all tables and enum types...")
with engine.connect() as conn:
    # Drop legacy enum types
    for enum_name in ["roleenum", "statusenum", "jobstatusenum", "jobtypeenum", "interviewstatusenum"]:
        conn.execute(text(f"DROP TYPE IF EXISTS {enum_name} CASCADE"))
    conn.commit()

# Drop all tables defined in models
Base.metadata.drop_all(bind=engine)
print("All tables dropped.")

# Recreate
Base.metadata.create_all(bind=engine)
print("All tables recreated with latest schema. Done.")
