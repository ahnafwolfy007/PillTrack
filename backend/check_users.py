"""
Quick script to check user data in the database
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

def check_users():
    try:
        print("Connecting to database...")
        conn = psycopg2.connect(**DB_CONFIG)
        cur = conn.cursor()
        
        # Get all users with new columns
        cur.execute("""
            SELECT id, name, email, phone, address, date_of_birth, blood_type, allergies, emergency_contact 
            FROM users
            LIMIT 10
        """)
        
        rows = cur.fetchall()
        print(f"\nFound {len(rows)} users:\n")
        
        for row in rows:
            print(f"ID: {row[0]}")
            print(f"  Name: {row[1]}")
            print(f"  Email: {row[2]}")
            print(f"  Phone: {row[3]}")
            print(f"  Address: {row[4]}")
            print(f"  DOB: {row[5]}")
            print(f"  Blood Type: {row[6]}")
            print(f"  Allergies: {row[7]}")
            print(f"  Emergency Contact: {row[8]}")
            print()
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    check_users()
