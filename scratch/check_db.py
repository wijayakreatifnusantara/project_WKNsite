import sqlite3
conn = sqlite3.connect("wkn_database.db")
conn.row_factory = sqlite3.Row
cursor = conn.cursor()
try:
    cursor.execute("SELECT * FROM employees")
    rows = cursor.fetchall()
    print(f"Total employees in SQLite: {len(rows)}")
    for row in rows:
        print(dict(row))
except Exception as e:
    print(f"Error: {e}")
conn.close()
