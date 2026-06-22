#!/usr/bin/env python3
"""
Migration script to add structured_data column to resumes table.
Run this if you have an existing database without the structured_data column.
"""

from sqlalchemy import create_engine, text
from database_config import DATABASE_URL

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='resumes' AND column_name='structured_data'
        """))
        
        if result.fetchone():
            print("✓ Column 'structured_data' already exists")
            return
        
        # Add column
        print("Adding 'structured_data' column to resumes table...")
        conn.execute(text("""
            ALTER TABLE resumes 
            ADD COLUMN structured_data TEXT
        """))
        conn.commit()
        print("✓ Migration completed successfully")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        exit(1)
