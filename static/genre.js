const API_KEY = "08cea072574b840d375fdec0cee559a1";
// const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const genreParam = new URLSearchParams(window.location.search).get("genre") || "action";
document.getElementById("genre-title").textContent += genreParam;

// Use OR between genres using '|' symbol
const genreMap = {
  action: "28|80",        // Action OR Crime
  comedy: "35",
  fantasy: "14",
  thriller: "53|27",        // Horror OR Thriller
  romance: "10749",
  "science fiction": "878",
  scifi: "878",
  sciFi: "878"
};

const genreIds = genreMap[genreParam.toLowerCase()] || "28";
const allowedLanguage = ["en", "hi", "ta", "te", "ml", "kn"];

function isWithinDays(dateStr, daysBefore = 40, daysAfter = 10) {
  const today = new Date();
  const diff = (new Date(dateStr) - today) / (1000 * 60 * 60 * 24);
  return diff >= -daysBefore && diff <= daysAfter;
}

async function fetchByLanguageAndGenres(langList, genreStr) {
  const url = `https://api.themoviedb.org/3/discover/movie` +
    `?api_key=${API_KEY}` +
    `&with_genres=${genreStr}` +
    `&sort_by=popularity.desc` +
    `&with_original_language=${langList.join("|")}` +
    `&region=IN&page=1`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  return (await resp.json()).results;
}

async function fetchMoviesByGenre() {
  try {
    const [hollywood, indian] = await Promise.all([
      fetchByLanguageAndGenres(["en"], genreIds),
      fetchByLanguageAndGenres(["hi", "ta", "te", "ml", "kn"], genreIds)
    ]);

    const combined = [...hollywood, ...indian];
    const seen = new Set();
    const unique = combined.filter(movie => {
      if (seen.has(movie.id)) return false;
      seen.add(movie.id);
      return true;
    });

    const filtered = unique.filter(movie =>
      movie.poster_path &&
      movie.vote_average >= 5 &&
      allowedLanguage.includes(movie.original_language) &&
      isWithinDays(movie.release_date)
    );

    // ✅ Sort by release date (newest first)
    filtered.sort((a, b) => new Date(b.release_date) - new Date(a.release_date));

    const container = document.getElementById("movies-container");
    if (filtered.length === 0) {
      container.innerHTML = `<p class="text-center text-red-500 text-lg mt-6">
        Currently, no movies have been released in this genre.
      </p>`;
      return;
    }
    container.innerHTML = filtered.map(movie => `
  <a href="/moviedetails?movie_id=${movie.id}" 
     class="movie-card p-2 hover:shadow-md transition-transform block text-center">
    <img src="${IMAGE_BASE}${movie.poster_path}" alt="${movie.title}" class="w-full rounded-md" />
    <h3 class="mt-2 font-semibold text-sm truncate w-40 mx-auto">
      ${movie.title}
    </h3>
    <p class="text-sm text-gray-500">⭐ ${movie.vote_average}</p>
  </a>
`).join('');


  } catch (err) {
    console.error("Error:", err);
    document.getElementById("movies-container").innerHTML =
      `<p class="text-red-500 text-lg text-center mt-6">
         Error fetching movies. Please try again later.
       </p>`;
  }
}


fetchMoviesByGenre();

