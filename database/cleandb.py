import sqlite3
import os
import glob

# Connect to the database
conn = sqlite3.connect('cinespace.db')  # adjust path if needed
cursor = conn.cursor()

# Delete all rows from users and bookings
cursor.execute("DELETE FROM bookings;")
cursor.execute("DELETE FROM users;")

# Reset AUTOINCREMENT counters (optional, makes IDs start from 1 again)
cursor.execute("DELETE FROM sqlite_sequence WHERE name='bookings';")
cursor.execute("DELETE FROM sqlite_sequence WHERE name='users';")

# Commit changes and close connection
conn.commit()
conn.close()

print("✅ All test data deleted from users and bookings.")

# Delete all QR code images
qr_path = '../static/qrcodes'
if os.path.exists(qr_path):
    files = glob.glob(os.path.join(qr_path, '*.png'))
    for f in files:
        os.remove(f)
    print(f"🧹 {len(files)} QR code images deleted from static/qrcodes.")
else:
    print("⚠️ QR code folder not found.")
