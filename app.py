from flask import Flask, render_template, request, redirect, session, send_from_directory
from auth_routes import auth_bp
from booking import booking_bp
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__, template_folder='templates', static_folder='static')
app.secret_key = 'your_secret_key'
CORS(app)

# Admin credentials
ADMIN_EMAIL = "cinespace@cine.com"
ADMIN_PASSWORD = "CineSpace@030304"

# Home Page
@app.route('/')
def index():
    return render_template('index.html')

# Orders Page
@app.route('/orders')
def orders():
    return render_template('orders.html')

# Profile Page
@app.route('/profile')
def profile():
    return render_template('profile.html')

# Genre Page
@app.route('/genre')
def genre_page():
    genre = request.args.get("genre")
    return render_template('genre.html', genre=genre)

@app.route('/language')
def language_page():
    language = request.args.get("language")
    return render_template('language.html', language=language)
@app.route('/booking')
def booking_page():
    movie_id = request.args.get("movie_id")
    return render_template('booking.html', movie_id=movie_id)


@app.route('/moviedetails')
def moviedetails():
    movie_id = request.args.get("movie_id")
    return render_template("moviedetails.html", movie_id=movie_id)

@app.route("/seating")
def seating():
    movie_id = request.args.get("movie_id")
    date = request.args.get("date")
    time = request.args.get("time")
    return render_template("seating.html", movie_id=movie_id, date=date, time=time)
@app.route("/confirmation")
def confirmation():
    return render_template("confirmation.html")


# Admin Login
@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']

        if email == ADMIN_EMAIL and password == ADMIN_PASSWORD:
            session['admin'] = True
            return redirect('/admin/dashboard')
        else:
            return render_template('admin_login.html', error='Invalid credentials')
    
    return render_template('admin_login.html')

# Admin Logout
@app.route('/admin/logout')
def admin_logout():
    session.pop('admin', None)
    return redirect('/')

@app.route('/admin/dashboard')
def admin_dashboard():
    if session.get('admin'):
        conn = sqlite3.connect('database/cinespace.db')
        conn.row_factory = sqlite3.Row  
        cursor = conn.cursor()
        cursor.execute("""
            SELECT bookings.id, users.username, bookings.movie_title,
                   bookings.show_date, bookings.show_time, bookings.seats, bookings.price
            FROM bookings
            JOIN users ON bookings.user_id = users.id
        """)
        bookings = cursor.fetchall()
        conn.close()
        return render_template('admin_dashboard.html', bookings=bookings)
    else:
        return redirect('/admin/login')


# User Logout
@app.route('/logout')
def user_logout():
    session.clear()
    return '', 204

# Register Blueprints
app.register_blueprint(auth_bp, url_prefix='/api')
app.register_blueprint(booking_bp, url_prefix='/api')

# Only needed if you store things outside /static (not usually required)
@app.route('/assets/<path:filename>')
def assets(filename):
    return send_from_directory(os.path.join(app.static_folder, 'assets'), filename)

# Run the app
if __name__ == '__main__':
    app.run(debug=True)
