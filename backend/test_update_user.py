"""
Test script to directly update user health info in the database
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

def update_user_health_info():
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Update user 5 (Ahnaf Atique) with test data
        cur.execute("""
            UPDATE users 
            SET date_of_birth = '2000-01-15',
                blood_type = 'O+',
                allergies = 'Peanuts, Dust',
                emergency_contact = 'Emergency - 01700000000'
            WHERE id = 5
        """)
        
        print(f"Updated {cur.rowcount} rows")
        conn.commit()
        
        # Verify the update
        cur.execute("""
            SELECT id, name, email, date_of_birth, blood_type, allergies, emergency_contact 
            FROM users WHERE id = 5
        """)
        
        row = cur.fetchone()
        if row:
            print(f"\nUser after update:")
            print(f"  ID: {row[0]}")
            print(f"  Name: {row[1]}")
            print(f"  Email: {row[2]}")
            print(f"  DOB: {row[3]}")
            print(f"  Blood Type: {row[4]}")
            print(f"  Allergies: {row[5]}")
            print(f"  Emergency Contact: {row[6]}")
        
        conn.close()
        print("\nDone! Refresh your profile page to see the changes.")
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    update_user_health_info()
