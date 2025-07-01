// --- Navbar & Profile Toggle ---
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");
  const profileBtn = document.getElementById("profile-button");
  const profileMenu = document.getElementById("profile-dropdown");

  // Toggle mobile menu
  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("hidden");
    });
  }

  // Toggle profile dropdown
  if (profileBtn && profileMenu) {
    profileBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      profileMenu.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!profileMenu.contains(e.target) && !profileBtn.contains(e.target)) {
        profileMenu.classList.add("hidden");
      }
    });
  }

  // Active nav link styling
  document.querySelectorAll(".nav-link").forEach((link) => {
    link.addEventListener("click", function () {
      document.querySelectorAll(".nav-link").forEach((l) => {
        l.classList.remove("text-red-500", "font-semibold");
      });
      this.classList.add("text-red-500", "font-semibold");
    });
  });
});

// --- Slideshow Logic ---
let slideIndex = 1;
showSlides(slideIndex);

function plusSlides(n) {
  showSlides(slideIndex += n);
}

function showSlides(n) {
  const slides = document.getElementsByClassName("mySlides");
  if (!slides.length) return;

  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slides[slideIndex - 1].style.display = "block";
}
const API_KEY = '08cea072574b840d375fdec0cee559a1';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
const RECOMMENDED_LIMIT = 15;
const allowedLanguages = ['en', 'ta', 'te', 'ml', 'kn', 'hi'];

function getFormattedVotes(count) {
  return count >= 1000 ? (count / 1000).toFixed(1) + 'K' : count.toString();
}

function isWithinDays(dateStr, daysRange) {
  const today = new Date();
  const targetDate = new Date(dateStr);
  const diffDays = (targetDate - today) / (1000 * 60 * 60 * 24);
  return diffDays >= -15 && diffDays <= 10;
}

async function fetchRecommended() {
  try {
    const nowPlaying = await fetch(`https://api.themoviedb.org/3/movie/now_playing?api_key=${API_KEY}&language=en-US&page=1`);
    const upcoming = await fetch(`https://api.themoviedb.org/3/movie/upcoming?api_key=${API_KEY}&language=en-US&page=1`);

    const nowPlayingData = await nowPlaying.json();
    const upcomingData = await upcoming.json();

    const allMovies = [...nowPlayingData.results, ...upcomingData.results];

    const filtered = allMovies.filter(movie =>
      movie.poster_path &&
      movie.vote_average >= 5 &&
      allowedLanguages.includes(movie.original_language) &&
      isWithinDays(movie.release_date, 10) // past 15 to next 10 days
    );

    return filtered.slice(0, RECOMMENDED_LIMIT);
  } catch (error) {
    console.error("Failed to fetch recommended movies:", error);
    return [];
  }
}

function renderRecommended() {
  const scrollContainer = document.getElementById("recommended-scroll");
  if (!scrollContainer) return;

  fetchRecommended().then(movies => {
    if (!movies.length) {
      scrollContainer.innerHTML = `<p class="text-gray-600">No recommended movies found.</p>`;
      return;
    }

    scrollContainer.innerHTML = "";

    movies.forEach(movie => {
      const card = document.createElement("div");
      card.className = "movie-card";

      card.innerHTML = `
        <a href="/moviedetails?movie_id=${movie.id}">>
          <img src="${IMAGE_BASE + movie.poster_path}" alt="${movie.title}" />
          <p class="likes">👍 ${getFormattedVotes(movie.vote_count)} Likes</p>
          <p class="title">${movie.title}</p>
          <p class="genre">Rating: ${movie.vote_average}</p>
        </a>
      `;

      scrollContainer.appendChild(card);
    });
  });
}

// --- Scroll Buttons ---
document.addEventListener("DOMContentLoaded", () => {
  renderRecommended();

  const scrollContainer = document.getElementById("recommended-scroll");
  const scrollLeftBtn = document.getElementById("scrollLeft");
  const scrollRightBtn = document.getElementById("scrollRight");

  if (scrollContainer && scrollLeftBtn && scrollRightBtn) {
    scrollLeftBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: -300, behavior: "smooth" });
    });
    scrollRightBtn.addEventListener("click", () => {
      scrollContainer.scrollBy({ left: 300, behavior: "smooth" });
    });
  }
});


const searchInput = document.getElementById("search-input");
const resultsBox = document.getElementById("search-results");
const TMDB_API_KEY = "08cea072574b840d375fdec0cee559a1";

let basePath = "/moviedetails";

if (searchInput && resultsBox) {
  searchInput.addEventListener("input", async (e) => {
    const query = e.target.value.trim();
    if (query.length < 2) {
      resultsBox.classList.add("hidden");
      resultsBox.innerHTML = "";
      return;
    }

    try {
      const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}`);
      const data = await res.json();

      const movies = data.results.filter(movie =>
        movie.original_language !== "ja" &&
        movie.original_language !== "ko" &&
        !movie.adult
      ).slice(0, 5);

      if (movies.length === 0) {
        resultsBox.innerHTML = `<p class="p-2 text-gray-500">No results found.</p>`;
        resultsBox.classList.remove("hidden");
        return;
      }

      resultsBox.innerHTML = movies.map(movie => `
        <a href="${basePath}?movie_id=${movie.id}" class="block px-3 py-2 hover:bg-gray-100 text-sm">
          ${movie.title}
        </a>
      `).join("");

      resultsBox.classList.remove("hidden");
    } catch (err) {
      console.error("Search error:", err);
    }
  });

  searchInput.addEventListener("blur", () => {
    setTimeout(() => {
      resultsBox.classList.add("hidden");
    }, 150);
  });
}



document.addEventListener("DOMContentLoaded", () => {
  const mobileSearchInput = document.getElementById("mobile-search-input");
  const mobileResultsBox = document.getElementById("mobile-search-results");
  const TMDB_API_KEY = "08cea072574b840d375fdec0cee559a1";

  // Correct path adjustments based on page depth
  // const isBooking = location.pathname.includes("/booking/");
  // const isPages = location.pathname.includes("/pages/");
  const mobileBasePath = "/moviedetails";

  if (mobileSearchInput && mobileResultsBox) {
    mobileSearchInput.addEventListener("input", async (e) => {
      const query = e.target.value.trim();
      if (query.length < 2) {
        mobileResultsBox.classList.add("hidden");
        mobileResultsBox.innerHTML = "";
        return;
      }
      try {
        const res = await fetch(
          `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}` +
          `&query=${encodeURIComponent(query)}&include_adult=false`
        );
        const data = await res.json();
        const movies = data.results
          .filter(m => !m.adult && m.original_language !== "ja" && m.original_language !== "ko")
          .slice(0, 5);

        if (!movies.length) {
          mobileResultsBox.innerHTML = `<p class="p-2 text-gray-500">No results found.</p>`;
          mobileResultsBox.classList.remove("hidden");
          return;
        }

        mobileResultsBox.innerHTML = movies.map(m => `
          <a href="${mobileBasePath}?movie_id=${m.id}" class="block px-3 py-2 hover:bg-gray-100 text-sm">
            ${m.title}
          </a>
        `).join("");
        mobileResultsBox.classList.remove("hidden");
      } catch (err) {
        console.error("Mobile search error:", err);
      }
    });

    mobileSearchInput.addEventListener("blur", () => {
      setTimeout(() => mobileResultsBox.classList.add("hidden"), 150);
    });
  }
});
const API_BASEs = "";
function closeModal() {
  document.getElementById("authModal").classList.add("hidden");
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
  function openModal() {
    document.getElementById("authModal").classList.remove("hidden");
    toggleToLogin();
  }



  function toggleToLogin() {
    document.getElementById("loginForm").classList.remove("hidden");
    document.getElementById("signupForm").classList.add("hidden");
    document.getElementById("forgotForm").classList.add("hidden");
  }
document.addEventListener("DOMContentLoaded", () => {
  // Put EVERYTHING inside this block 👇👇👇

  // ✅ Login Event
  const loginBtn = document.querySelector("#loginBtn");
  if (loginBtn) {
    loginBtn.addEventListener("click", async () => {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
        showMessage("Please enter both email and password.", "error");
        return;
      }

      try {
        const res = await fetch(`${API_BASEs}/api/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();
        showMessage(data.message, data.status === "success" ? "success" : "error");

        if (data.status === "success") {
          localStorage.setItem("user_id", data.user_id);
          localStorage.setItem("username", data.username);
          localStorage.setItem("email", data.email);
          updateUserUI();
          closeModal();
        }
      } catch (err) {
        showMessage("Login failed. Try again.", "error");
        console.error(err);
      }
    });
  }

  // ✅ Signup Event
  const signupBtn = document.querySelector("#signupBtn");
  if (signupBtn) {
    signupBtn.addEventListener("click", async () => {
      const username = document.getElementById("signupName").value.trim();
      const phone = document.getElementById("signupPhone").value.trim();
      const email = document.getElementById("signupEmail").value.trim();
      const password = document.getElementById("signupPassword").value.trim();
      const security_question = document.getElementById("signupQuestion").value;
      const security_answer = document.getElementById("signupAnswer").value.trim();

      if (!username || !email || !password || !security_question || !security_answer) {
        showMessage("Please fill all fields.", "error");
        return;
      }

      const pwdRegex = /^(?=.*[A-Z])(?=.*[\W_]).{8,}$/;
      if (!pwdRegex.test(password)) {
        showMessage("Password must be at least 8 characters, include 1 capital letter and 1 special character.", "error");
        return;
      }

      try {
        const res = await fetch(`${API_BASEs}/api/signup`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password, phone, security_question, security_answer }),
        });

        const data = await res.json();
        showMessage(data.message, data.status === "success" ? "success" : "error");

        if (data.status === "success") {
          toggleToLogin();
        }

      } catch (err) {
        showMessage("Signup failed. Please try again.", "error");
        console.error(err);
      }
    });
  }

  // ✅ Sign In Button behavior
  const signInBtn = document.getElementById("signInBtn");
  if (signInBtn) {
    signInBtn.addEventListener("click", () => {
      const name = localStorage.getItem("username");
      if (name) {
        if (confirm(`You're logged in as ${name}. Do you want to logout?`)) {
          logout();
        }
      } else {
        openModal();
      }
    });
  }

  function logout() {
    localStorage.removeItem('user_id');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('phone');
    localStorage.removeItem('isLoggedIn');
    sessionStorage.clear();
    updateUserUI();
    fetch('/logout').then(() => window.location.href = '/');
  }

  function updateUserUI() {
    const name = localStorage.getItem("username");
    if (signInBtn) {
      if (name) {
        signInBtn.textContent = name;
        signInBtn.classList.remove("bg-pink-600");
        signInBtn.classList.add("bg-green-600");
      } else {
        signInBtn.textContent = "Sign in";
        signInBtn.classList.remove("bg-green-600");
        signInBtn.classList.add("bg-pink-600");
      }
    }
  }

  updateUserUI();

  function showMessage(message, type = "success") {
    const box = document.getElementById("messageBox");
    if (!box) return;
    box.textContent = message;
    box.classList.remove("hidden");
    box.className = `p-3 my-2 rounded text-sm font-semibold text-white text-center ${type === "success" ? "bg-green-600" : "bg-red-600"}`;
    setTimeout(() => box.classList.add("hidden"), 4000);
  }
});
