import sqlite3
import os

def list_all_users():
    db_path = os.path.join(os.path.dirname(__file__), 'users.db')
    
    if not os.path.exists(db_path):
        print("Database does not exist yet. No users signed up.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        cursor.execute("SELECT id, name, email FROM users")
        users = cursor.fetchall()
        
        print(f"\n===== VIQA DATABASE (Total Users: {len(users)}) =====")
        print(f"{'ID':<5} | {'Name':<20} | {'Email':<30}")
        print("-" * 65)
        for u in users:
            print(f"{u[0]:<5} | {u[1]:<20} | {u[2]:<30}")
        print("========================================================\n")
            
    except sqlite3.OperationalError:
        print("Database table 'users' not found. Ensure auth_db.py has initialized the DB.")
        
    conn.close()

if __name__ == "__main__":
    list_all_users()
