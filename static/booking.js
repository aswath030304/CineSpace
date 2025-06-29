const API_KEYss = "08cea072574b840d375fdec0cee559a1";
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("movie_id");

const today = new Date();
const todayMidnight = new Date(today.toDateString());
const ninetyDaysAgo = new Date();
ninetyDaysAgo.setDate(today.getDate() - 90);

let selectedDate = new Date();

function formatDate(date) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}

function getDisplayDate(date) {
  return date.toDateString().slice(0, 10); // Example: "Wed Jun 26"
}

function renderDateButtons(startDate, count = 1) {
  const container = document.getElementById("date-buttons");
  container.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);

    const btn = document.createElement("button");
    btn.textContent = getDisplayDate(date);
    btn.className =
      "px-4 py-2 bg-white text-black border border-gray-300 rounded hover:bg-red-700 hover:border-red-700 hover:!text-white";

    if (formatDate(date) === formatDate(selectedDate)) {
      btn.classList.add("font-bold", "border-green-500", "bg-green-500", "!text-white");
    }

    btn.addEventListener("click", () => {
      selectedDate = date;
      renderDateButtons(startDate, count);
      renderShowTimes();
    });

    container.appendChild(btn);
  }
}

function renderShowTimes() {
  const now = new Date();

  const showTimes = [
    { time: "10:00", label: "10:00 AM" },
    { time: "13:30", label: "1:30 PM" },
    { time: "17:30", label: "5:30 PM" },
    { time: "21:00", label: "9:00 PM" }
  ];

  const container = document.getElementById("booking-section");
  container.innerHTML = `
    <h2 class="text-xl font-semibold mb-4">Available Show Timings</h2>
    <div class="flex flex-wrap justify-center gap-4">
      ${showTimes.map(({ time, label }) => {
        const [hour, minute] = time.split(":");
        const showTime = new Date(selectedDate);
        showTime.setHours(parseInt(hour), parseInt(minute), 0);

        const isPast = formatDate(selectedDate) === formatDate(now) && now > showTime;
        const url = `/seating?movie_id=${movieId}&date=${formatDate(selectedDate)}&time=${encodeURIComponent(label)}`;

        return isPast
          ? `
            <button disabled
              class="border border-green-500 rounded-md px-4 py-2 text-center opacity-50 cursor-not-allowed">
              <p class="font-semibold text-gray-800">${label}</p>
              <p class="text-sm text-gray-500">4K DOLBY ATMOS</p>
            </button>
          `
          : `
            <a href="${url}">
              <button
                class="border border-green-500 rounded-md px-4 py-2 text-center hover:bg-green-100 cursor-pointer">
                <p class="font-semibold text-gray-800">${label}</p>
                <p class="text-sm text-gray-500">4K DOLBY ATMOS</p>
              </button>
            </a>
          `;
      }).join("")}
    </div>
  `;
}

async function fetchMovieDetails() {
  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEYss}&language=en-US`
    );
    const movie = await res.json();

    document.getElementById("movie-poster").src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    document.getElementById("movie-title").textContent = movie.title;
    document.getElementById("release-date").textContent = `Release Date: ${movie.release_date}`;

    const releaseDate = new Date(movie.release_date);
    const daysUntilRelease = Math.floor((releaseDate - todayMidnight) / (1000 * 60 * 60 * 24));

    if (daysUntilRelease >= 3) {
      // Booking not open yet
      document.getElementById("booking-section").innerHTML = `
        <p class="text-lg text-green-500 font-semibold">
          🟢🎟️ Booking not open yet. Please check back closer to the release date.
        </p>`;
    } else if (daysUntilRelease >= 0 && daysUntilRelease < 3) {
      // Show release date + (3 - daysUntilRelease) days
      const count = 4 - daysUntilRelease;
      selectedDate = new Date(releaseDate);
      renderDateButtons(releaseDate, count);
      renderShowTimes();
    } else if (releaseDate <= today && releaseDate >= ninetyDaysAgo) {
      // Already released within 90 days
      const startDate = todayMidnight > releaseDate ? todayMidnight : releaseDate;
      selectedDate = startDate;
      renderDateButtons(startDate, 4);
      renderShowTimes();
    } else {
      // Too old
      document.getElementById("booking-section").innerHTML = `
        <p class="text-lg text-red-600 font-semibold">
          Currently this show is not available in CineSpace.
        </p>`;
    }
  } catch (error) {
    console.error("Error fetching movie:", error);
    document.getElementById("booking-section").innerHTML = `
      <p class="text-red-600 font-semibold">Unable to load movie data. Please try again later.</p>
    `;
  }
}

fetchMovieDetails();
