"""
Migration script to update existing medications with default values
for new columns: reminder_minutes_before and quantity_per_dose
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
        
        # Check if columns exist first
        cur.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'medications'
        """)
        columns = [row[0] for row in cur.fetchall()]
        print(f"Existing columns: {columns}")
        
        # Update existing records with default values if columns exist
        if 'reminder_minutes_before' in columns:
            cur.execute('UPDATE medications SET reminder_minutes_before = 0 WHERE reminder_minutes_before IS NULL')
            print(f"Updated reminder_minutes_before: {cur.rowcount} rows")
        else:
            # Add column if it doesn't exist
            cur.execute('ALTER TABLE medications ADD COLUMN reminder_minutes_before INTEGER DEFAULT 0')
            print("Added reminder_minutes_before column")
        
        if 'quantity_per_dose' in columns:
            cur.execute('UPDATE medications SET quantity_per_dose = 1 WHERE quantity_per_dose IS NULL')
            print(f"Updated quantity_per_dose: {cur.rowcount} rows")
        else:
            # Add column if it doesn't exist
            cur.execute('ALTER TABLE medications ADD COLUMN quantity_per_dose INTEGER DEFAULT 1')
            print("Added quantity_per_dose column")
        
        conn.commit()
        print("Migration completed successfully!")
        
        # Verify
        cur.execute('SELECT id, name, reminder_minutes_before, quantity_per_dose FROM medications LIMIT 5')
        rows = cur.fetchall()
        print(f"\nSample medications after migration:")
        for row in rows:
            print(f"  ID: {row[0]}, Name: {row[1]}, ReminderMins: {row[2]}, QtyPerDose: {row[3]}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    run_migration()
