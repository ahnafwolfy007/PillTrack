"""
Migration script to add health-related columns to users table:
- date_of_birth
- blood_type
- allergies
- emergency_contact
"""

import psycopg2

# Database connection settings
DB_CONFIG = {
    'host': 'pg-21f07101-edusyncuiu.i.aivencloud.com',
    'port': 16537,
    'database': 'defaultdb',
    'user': 'avnadmin',
    'password': 'AVNS_mp_gm0Sfdjzv9LazqwK',
    'sslmode': 'require'
}

def run_migration():
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Check existing columns in users table
        cur.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'users'
        """)
        columns = [row[0] for row in cur.fetchall()]
        print(f"Existing columns in users table: {columns}")
        
        # Add date_of_birth column
        if 'date_of_birth' not in columns:
            cur.execute('ALTER TABLE users ADD COLUMN date_of_birth DATE')
            print("Added date_of_birth column")
        else:
            print("date_of_birth column already exists")
        
        # Add blood_type column
        if 'blood_type' not in columns:
            cur.execute('ALTER TABLE users ADD COLUMN blood_type VARCHAR(5)')
            print("Added blood_type column")
        else:
            print("blood_type column already exists")
        
        # Add allergies column
        if 'allergies' not in columns:
            cur.execute('ALTER TABLE users ADD COLUMN allergies TEXT')
            print("Added allergies column")
        else:
            print("allergies column already exists")
        
        # Add emergency_contact column
        if 'emergency_contact' not in columns:
            cur.execute('ALTER TABLE users ADD COLUMN emergency_contact VARCHAR(200)')
            print("Added emergency_contact column")
        else:
            print("emergency_contact column already exists")
        
        conn.commit()
        print("\nMigration completed successfully!")
        
        # Verify columns
        cur.execute("""
            SELECT column_name, data_type FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        """)
        print("\nUsers table columns after migration:")
        for row in cur.fetchall():
            print(f"  {row[0]}: {row[1]}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    run_migration()
