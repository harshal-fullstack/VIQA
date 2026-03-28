import sqlite3
import hashlib
import os

DB_PATH = "users.db"

def _hash_password(password: str, salt: str = "viqa_salt123") -> str:
    """A simple hash function using standard library SHA-256."""
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def init_db():
    """Initializes the SQLite database with the users table."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            hashed_password TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def create_user(email: str, name: str, password: str) -> bool:
    """Creates a new user. Returns True if successful, False if email already exists."""
    hashed = _hash_password(password)
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("INSERT INTO users (email, name, hashed_password) VALUES (?, ?, ?)", 
                       (email, name, hashed))
        conn.commit()
        return True
    except sqlite3.IntegrityError:
        return False  # Email already exists
    finally:
        conn.close()

def verify_user(email: str, password: str) -> dict:
    """Verifies a user's credentials. Returns the user dict if successful, None otherwise."""
    hashed = _hash_password(password)
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, email, name FROM users WHERE email = ? AND hashed_password = ?", 
                   (email, hashed))
    user = cursor.fetchone()
    conn.close()
    
    if user:
        return {"id": user[0], "email": user[1], "name": user[2]}
    return None
