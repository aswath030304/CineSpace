const API_BASE = "/api";  // ✅ Change this to match your Flask port
const seatCountSelect = document.getElementById("seatCount");
const seatMapWrapper = document.getElementById("seat-map-wrapper");
const seatMap = document.getElementById("seat-map");
const confirmBtn = document.getElementById("confirmBtn");

const movieTitleEl = document.getElementById("page-title");
const movieInfoEl = document.getElementById("movie-info");

const params = new URLSearchParams(window.location.search);
const movieId = params.get("movie_id");
const date = params.get("date");
const time = params.get("time");

const totalRows = 13;
const totalCols = 12;
const aisleCols = [4, 8];
const rowLabels = "ABCDEFGHIJKLM".split("");

let selectedSeats = [];
let allowedCount = 0;
let soldSeats = new Set();

async function fetchSoldSeats() {
  try {
    const res = await fetch(`${API_BASE}/sold-seats?movie_id=${movieId}&show_date=${date}&show_time=${time}`);
    const data = await res.json();
    if (data.status === "success") {
      soldSeats = new Set(data.sold_seats);
    }
  } catch (err) {
    console.error("❌ Error fetching sold seats:", err);
  }
}


function getSeatId(rowIndex, colIndex) {
  const row = rowLabels[rowIndex];
  const offset = aisleCols.filter(i => colIndex > i).length;
  return `${row}${colIndex - offset + 1}`;
}

function renderSeats() {
  seatMap.innerHTML = "";
  for (let r = 0; r < totalRows; r++) {
    for (let c = 0; c < totalCols + aisleCols.length; c++) {
      const div = document.createElement("div");

      if (aisleCols.includes(c)) {
        div.className = "w-8 h-8";
      } else {
        const seatId = getSeatId(r, c);
        div.textContent = seatId;
        div.dataset.seat = seatId;
        div.className = "w-10 h-10 text-sm font-medium rounded flex items-center justify-center";

        if (soldSeats.has(seatId)) {
          div.classList.add("bg-red-500", "text-white", "cursor-not-allowed");
        } else if (selectedSeats.includes(seatId)) {
          div.classList.add("bg-green-500", "text-white", "cursor-pointer");
        } else {
          div.classList.add("bg-gray-200", "text-black", "hover:bg-green-600", "cursor-pointer");
        }

        div.onclick = () => {
          if (soldSeats.has(seatId)) return;
          if (selectedSeats.includes(seatId)) {
            selectedSeats = selectedSeats.filter(s => s !== seatId);
          } else if (selectedSeats.length < allowedCount) {
            selectedSeats.push(seatId);
          }
          updateSeatGrid();
        };
      }

      seatMap.appendChild(div);
    }
  }
}

function updateSeatGrid() {
  renderSeats();
  confirmBtn.disabled = selectedSeats.length !== allowedCount;
}

seatCountSelect.addEventListener("change", () => {
  allowedCount = parseInt(seatCountSelect.value);
  selectedSeats = [];
  seatMapWrapper.classList.remove("hidden");
  updateSeatGrid();
});

confirmBtn.addEventListener("click", async () => {
  const userId = localStorage.getItem("user_id");
  const username = localStorage.getItem("username");

if (!userId) {
  // Show login modal
  document.getElementById("authModal").classList.remove("hidden");

  // Ensure login form is shown, not signup or forgot
  toggleToLogin(); 

  showMessage("Please login to book your seats.", "error");
  return;
}

  const seatCount = selectedSeats.length;
  if (seatCount !== allowedCount) {
    alert(`Please select exactly ${allowedCount} seat(s).`);
    return;
  }

  try {
    const movieTitle = movieTitleEl.textContent.replace("Seat Layout for ", "");
    const res = await fetch(`${API_BASE}/book`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: userId,
        movie_id: movieId,
        movie_title: movieTitle,
        show_date: date,
        show_time: time,
        seats: selectedSeats
      })
    });


    const data = await res.json();
    if (data.status === "success") {
      const qr = encodeURIComponent(data.ticket.qr_code);
      const movie = encodeURIComponent(data.ticket.movie);
      const seats = encodeURIComponent(data.ticket.seats);
      const dateStr = encodeURIComponent(data.ticket.date);
      const timeStr = encodeURIComponent(data.ticket.time);

      window.location.href = `/confirmation?qr=${qr}&movie=${movie}&seats=${seats}&date=${dateStr}&time=${timeStr}`;

    } else {
      alert(data.message);
    }

  } catch (err) {
    alert("Booking failed. Try again.");

    console.error(err);
  }
});

async function fetchMovieTitle() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=08cea072574b840d375fdec0cee559a1`);
    const data = await res.json();
    movieTitleEl.textContent = `Seat Layout for ${data.title}`;
    movieInfoEl.textContent = `Date: ${date} | Time: ${time}`;
    document.title = `Seat Layout for ${data.title}`;
  } catch {
    movieTitleEl.textContent = "Seat Layout";
    movieInfoEl.textContent = `Date: ${date} | Time: ${time}`;
  }
}

(async () => {
  await fetchMovieTitle();
  await fetchSoldSeats();
})();
function closeModal() {
  document.getElementById("authModal").classList.add("hidden");
}
function toggleToLogin() {
  document.getElementById("loginForm").classList.remove("hidden");
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("forgotForm").classList.add("hidden");
}

function toggleToSignup() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.remove("hidden");
  document.getElementById("forgotForm").classList.add("hidden");
}

function toggleToForgot() {
  document.getElementById("loginForm").classList.add("hidden");
  document.getElementById("signupForm").classList.add("hidden");
  document.getElementById("forgotForm").classList.remove("hidden");
}

function showMessage(message, type = "success") {
  const box = document.getElementById("messageBox");
  if (!box) return;

  box.textContent = message;
  box.classList.remove("hidden");
  box.className = `p-3 my-2 rounded text-sm font-semibold text-white text-center ${type === "success" ? "bg-green-600" : "bg-red-600"}`;

  setTimeout(() => box.classList.add("hidden"), 4000);
}
document.addEventListener("DOMContentLoaded", () => {
  const API_BASEs = "/api";

  // ✅ Login Handler
  document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showMessage("Please enter both email and password.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASEs}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      showMessage(data.message, data.status === "success" ? "success" : "error");

      if (data.status === "success") {
        localStorage.setItem("user_id", data.user_id);
        localStorage.setItem("username", data.username);
        localStorage.setItem("email", data.email);
        closeModal();
      }

    } catch (err) {
      showMessage("Login failed. Try again.", "error");
      console.error(err);
    }
  });

  // ✅ Signup Handler
  document.getElementById("signupBtn").addEventListener("click", async () => {
    const username = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const phone = document.getElementById("signupPhone").value.trim();
    const password = document.getElementById("signupPassword").value.trim();
    const security_question = document.getElementById("signupQuestion").value;
    const security_answer = document.getElementById("signupAnswer").value.trim();

    if (!username || !email || !phone || !password || !security_question || !security_answer) {
      showMessage("Please fill all fields.", "error");
      return;
    }

    const pwdRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
    if (!pwdRegex.test(password)) {
      showMessage("Password must be at least 8 characters, include 1 capital letter and 1 special character.", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASEs}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, phone, password, security_question, security_answer })
      });

      const data = await res.json();
      showMessage(data.message, data.status === "success" ? "success" : "error");

      if (data.status === "success") {
        toggleToLogin();
      }
    } catch (err) {
      showMessage("Signup failed. Try again.", "error");
      console.error(err);
    }
  });
});
