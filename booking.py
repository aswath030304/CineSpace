from flask import Blueprint, request, jsonify
import sqlite3, os, qrcode
import requests
from datetime import datetime

booking_bp = Blueprint('booking', __name__)  
DB_PATH = 'database/cinespace.db'

def get_db():
    return sqlite3.connect(DB_PATH)


@booking_bp.route('/book', methods=['POST'])
def book_ticket():
    print("✅ /book endpoint hit")
    data = request.get_json()
    print("📩 Received booking data:", data)

    required = ['user_id', 'movie_id', 'movie_title', 'show_date', 'show_time', 'seats']
    if not all(k in data for k in required):
        print("❌ Missing fields in data")
        return jsonify({"status": "fail", "message": "Missing fields"})

    # 🎯 Handle seats and calculate price
    if isinstance(data['seats'], list):
        seat_list = data['seats']
    else:
        seat_list = [s.strip() for s in data['seats'].split(',') if s.strip()]
    
    seat_str = ', '.join(seat_list)
    price = len(seat_list) * 200  # ✅ Dynamic total price

    # 🧾 Prepare summary for QR
    summary = (
        f"Movie: {data['movie_title']}\n"
        f"Date: {data['show_date']} | Time: {data['show_time']}\n"
        f"Seats: {seat_str}\nPrice: ₹{price}"
    )

    # 📦 QR Code Generation
    qr_folder = os.path.join('static', 'qrcodes')
    os.makedirs(qr_folder, exist_ok=True)
    filename = f"{data['user_id']}_{int(datetime.now().timestamp())}.png"
    qr_path = os.path.join(qr_folder, filename)

    try:
        qrcode.make(summary).save(qr_path)

        conn = get_db()
        cur = conn.cursor()
        cur.execute('''
            INSERT INTO bookings (user_id, movie_id, movie_title, show_date, show_time, seats, price, qr_code_path)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            data['user_id'], data['movie_id'], data['movie_title'],
            data['show_date'], data['show_time'], seat_str, price, qr_path
        ))
        conn.commit()
        conn.close()

        return jsonify({
            "status": "success",
            "message": "Booking successful",
            "ticket": {
                "movie": data['movie_title'],
                "date": data['show_date'],
                "time": data['show_time'],
                "seats": seat_str,
                "price": price,
                "qr_code": "/" + qr_path.replace("\\", "/")
            }
        })

    except Exception as e:
        print("❌ Booking Error:", e)
        return jsonify({"status": "fail", "message": "Booking failed, internal error."})


@booking_bp.route('/sold-seats', methods=['GET'])
def get_sold_seats():
    movie_id = request.args.get('movie_id')
    show_date = request.args.get('show_date')
    show_time = request.args.get('show_time')

    if not (movie_id and show_date and show_time):
        return jsonify({"status": "fail", "message": "Missing parameters"}), 400

    conn = get_db()
    cur = conn.cursor()
    cur.execute('''
        SELECT seats FROM bookings
        WHERE movie_id = ? AND show_date = ? AND show_time = ?
    ''', (movie_id, show_date, show_time))

    results = cur.fetchall()
    conn.close()

    sold = set()
    for row in results:
        for seat in row[0].split(","):
            sold.add(seat.strip())

    return jsonify({"status": "success", "sold_seats": list(sold)})


@booking_bp.route('/get_orders', methods=['GET'])
def get_orders():
    user_id = request.args.get('user_id')
    if not user_id:
        return jsonify({"status": "fail", "message": "Missing user ID"}), 400

    try:
        conn = get_db()
        cur = conn.cursor()
        cur.execute('''
            SELECT movie_id, movie_title, show_date, show_time, seats, price, qr_code_path 
            FROM bookings 
            WHERE user_id=?
        ''', (user_id,))
        rows = cur.fetchall()
        conn.close()

        orders = []
        for row in rows:
            movie_id, title, date, time, seats, price, qr_code = row

            # 🧠 Fetch poster from TMDB API
            poster_path = ""
            try:
                tmdb_url = f"https://api.themoviedb.org/3/movie/{movie_id}?api_key=08cea072574b840d375fdec0cee559a1"
                r = requests.get(tmdb_url)
                if r.status_code == 200:
                    poster_path = r.json().get("poster_path", "")
            except Exception as e:
                print("Poster fetch failed:", e)

            orders.append({
                "movie_title": title,
                "show_date": date,
                "show_time": time,
                "seats": seats,
                "price": price,
                "qr_code": "/" + qr_code.replace("\\", "/"),
                "poster_path": poster_path
            })

        return jsonify({"status": "success", "orders": orders})

    except Exception as e:
        print("❌ Order Fetch Error:", e)
        return jsonify({"status": "fail", "message": "Internal server error"}), 500
