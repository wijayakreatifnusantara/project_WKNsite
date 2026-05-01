import sqlite3
import os

def init_db():
    db_path = "wkn_database.db"
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Create employees table
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nik TEXT UNIQUE NOT NULL,
        nama TEXT NOT NULL,
        email TEXT,
        posisi TEXT,
        departemen TEXT,
        gaji_pokok REAL NOT NULL,
        tanggal_masuk TEXT,
        is_active INTEGER DEFAULT 1,
        deleted_at TEXT
    )
    ''')

    conn.commit()
    conn.close()
    print(f"Database initialized at {db_path}")

if __name__ == "__main__":
    init_db()
