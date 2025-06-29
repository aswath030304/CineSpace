from flask import Blueprint, request, jsonify
import sqlite3
import re

auth_bp = Blueprint('auth', __name__)
DB_PATH = 'database/cinespace.db'

def get_db():
    return sqlite3.connect(DB_PATH)

def is_strong_password(password):
    return (
        len(password) >= 8 and
        re.search(r'[A-Z]', password) and
        re.search(r'[\W_]', password)  # symbol
    )

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    conn = get_db()
    cur = conn.cursor()

    # Fetch user
    cur.execute("SELECT * FROM users WHERE email=? AND password=?", (data['email'], data['password']))
    user = cur.fetchone()

    if user:
        # user tuple: (id, username, password, email, phone, sec_q, sec_ans)
        user_id, username, _, email, phone, _, _ = user

        # Update phone if provided
        if 'phone' in data and data['phone']:
            cur.execute("UPDATE users SET phone=? WHERE email=?", (data['phone'], email))
            conn.commit()

        conn.close()

        return jsonify({
            "status": "success",
            "message": "Login successful",
            "user_id": user_id,
            "username": username,
            "email": email,
            "phone": data.get("phone", phone)
        })

    conn.close()
    return jsonify({"status": "fail", "message": "Invalid email or password"})


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    if not is_strong_password(data['password']):
        return jsonify({"status": "fail", "message": "Weak password. Use 8+ chars, 1 capital, 1 symbol."})

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO users (username, email, password, phone, security_question, security_answer)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            data['username'],
            data['email'],
            data['password'],
            data.get('phone', ''),  # use empty string if phone is missing
            data['security_question'],
            data['security_answer']
        ))
        conn.commit()
        conn.close()
        return jsonify({"status": "success", "message": "Signup successful", "username": data['username']})
    except sqlite3.IntegrityError:
        return jsonify({"status": "fail", "message": "Email already exists"})
