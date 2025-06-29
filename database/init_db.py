import sqlite3

# Use local path since you're in the 'database' folder
DB_PATH = 'cinespace.db'

# Connect to the database
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Drop tables if they exist
cursor.execute("DROP TABLE IF EXISTS bookings")
cursor.execute("DROP TABLE IF EXISTS users")

# Create 'users' table with phone
cursor.execute('''
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    security_question TEXT NOT NULL,
    security_answer TEXT NOT NULL
)
''')

# Create 'bookings' table
cursor.execute('''
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    movie_id TEXT NOT NULL,
    movie_title TEXT NOT NULL,
    show_date TEXT NOT NULL,
    show_time TEXT NOT NULL,
    seats TEXT NOT NULL,
    price INTEGER DEFAULT 200,
    qr_code_path TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
''')

conn.commit()
conn.close()

print("Database initialized: 'users' and 'bookings' tables created successfully!")
