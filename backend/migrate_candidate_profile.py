#!/usr/bin/env python3
"""
Migration script to add phone, linkedin, github columns to candidates table.
Run this if you have an existing database without these columns.
"""

from sqlalchemy import create_engine, text
from database_config import DATABASE_URL

def migrate():
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check and add phone column
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='candidates' AND column_name='phone'
        """))
        
        if not result.fetchone():
            print("Adding 'phone' column to candidates table...")
            conn.execute(text("ALTER TABLE candidates ADD COLUMN phone VARCHAR"))
            conn.commit()
            print("✓ Added phone column")
        else:
            print("✓ Column 'phone' already exists")
        
        # Check and add linkedin column
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='candidates' AND column_name='linkedin'
        """))
        
        if not result.fetchone():
            print("Adding 'linkedin' column to candidates table...")
            conn.execute(text("ALTER TABLE candidates ADD COLUMN linkedin VARCHAR"))
            conn.commit()
            print("✓ Added linkedin column")
        else:
            print("✓ Column 'linkedin' already exists")
        
        # Check and add github column
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='candidates' AND column_name='github'
        """))
        
        if not result.fetchone():
            print("Adding 'github' column to candidates table...")
            conn.execute(text("ALTER TABLE candidates ADD COLUMN github VARCHAR"))
            conn.commit()
            print("✓ Added github column")
        else:
            print("✓ Column 'github' already exists")
        
        print("\n✓ Migration completed successfully")

if __name__ == "__main__":
    try:
        migrate()
    except Exception as e:
        print(f"✗ Migration failed: {e}")
        exit(1)
