// const API_KEY = "08cea072574b840d375fdec0cee559a1";
// const IMAGE_BASE = "https://image.tmdb.org/t/p/w500";

const languageParam = new URLSearchParams(window.location.search).get("language") || "tamil";
document.getElementById("language-title").textContent += " " + languageParam;

const languageMap = {
  english: "en",
  hindi: "hi",
  tamil: "ta",
  telugu: "te",
  malayalam: "ml",
  kannada: "kn"
};

const langCode = languageMap[languageParam.toLowerCase()] || "ta";
const today = new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD

async function fetchMoviesByLanguage() {
  const container = document.getElementById("language-container");

  try {
    const res = await fetch(
      `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&with_original_language=${langCode}&sort_by=primary_release_date.desc&include_adult=false&vote_count.gte=50&vote_average.gte=6&release_date.lte=${today}&page=1`
    );

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      container.innerHTML = `<p class="text-center text-red-500 text-lg mt-6">No good-rated recent movies found in this language.</p>`;
      return;
    }

    const moviesHTML = data.results
      .filter(movie => movie.poster_path) // ensure image exists
      .map(movie => `
        <a href="/moviedetails?movie_id=${movie.id}" class="lang-card p-2 hover:shadow-md transition-transform">

          <img src="${IMAGE_BASE}${movie.poster_path}" alt="${movie.title}" />
          <h3 class="mt-2 font-semibold text-center text-sm truncate w-40 mx-auto">${movie.title}</h3>
          <p class="text-sm text-gray-500 text-center">⭐ ${movie.vote_average}</p>
        </a>
      `)
      .join("");

    container.innerHTML = moviesHTML;

  } catch (error) {
    console.error("Error fetching movies:", error);
    container.innerHTML = `<p class="text-red-500 text-lg text-center mt-6">Error fetching movies. Please try again later.</p>`;
  }
}

fetchMoviesByLanguage();
