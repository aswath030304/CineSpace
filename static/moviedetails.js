const API_KEYs = "08cea072574b840d375fdec0cee559a1";
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get("movie_id");

async function fetchMovieDetails() {
  try {
    const res = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEYs}&append_to_response=videos,credits,recommendations`);
    const movie = await res.json();

    // Set Poster and Title
    document.getElementById("movie-poster").src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;
    document.getElementById("movie-title").textContent = movie.title;

    // Languages
    const languages = movie.spoken_languages.map(lang => lang.english_name).join(", ");
    document.getElementById("movie-languages").textContent = languages;

    // Runtime
    const hrs = Math.floor(movie.runtime / 60);
    const mins = movie.runtime % 60;
    document.getElementById("movie-runtime").textContent = `${hrs}h ${mins}m`;

    // Genres
    const genreText = movie.genres.map(g => g.name).join(", ");
    document.getElementById("movie-genres").textContent = genreText;

    // Certificate
    document.getElementById("movie-cert").textContent = movie.adult ? "A" : "UA";

    // Release Date
    const releaseDate = new Date(movie.release_date);
    const formattedDate = releaseDate.toLocaleDateString("en-GB", {
      day: "2-digit", month: "short", year: "numeric"
    });
    document.getElementById("release-date").textContent = `Release: ${formattedDate}`;
    document.getElementById("release-date-desktop").textContent = `Release: ${formattedDate}`;

    // Overview
    document.getElementById("movie-overview").textContent = movie.overview;

    // Book Tickets Button
    document.getElementById("book-btn").href = `/booking?movie_id=${movie.id}`;


    // Trailer Section
    const trailers = movie.videos.results.filter(
      v => v.type === "Trailer" && v.site === "YouTube"
    );
    const trailerContainer = document.getElementById("trailer-container");

    if (trailers.length > 0) {
      trailerContainer.innerHTML = `
        <iframe class="w-full h-full rounded-lg" src="https://www.youtube.com/embed/${trailers[0].key}" 
        frameborder="0" allowfullscreen></iframe>`;
    } else {
      trailerContainer.innerHTML = `<p class="text-gray-500">Trailer not available.</p>`;
    }

    // Cast Section
    const castList = document.getElementById("cast-list");
    castList.innerHTML = "";
    movie.credits.cast.slice(0, 10).forEach(actor => {
      const castItem = document.createElement("div");
      castItem.className = "flex-shrink-0 text-center w-24";
      castItem.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w185${actor.profile_path}" 
          alt="${actor.name}" class="w-20 h-20 rounded-full object-cover mx-auto mb-1">
        <p class="text-sm font-medium">${actor.name}</p>
        <p class="text-xs text-gray-500">as ${actor.character}</p>
      `;
      castList.appendChild(castItem);
    });

    // Recommendations
    const recList = document.getElementById("recommendations");
    recList.innerHTML = "";

    const recommended = movie.recommendations.results.filter(rec => rec.poster_path).slice(0, 3);

    if (recommended.length > 0) {
      recommended.forEach(rec => {
        const card = document.createElement("div");
        card.className = "bg-white shadow rounded-lg overflow-hidden";
        card.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${rec.poster_path}" alt="${rec.title}" 
        class="w-full h-72 object-cover" />
      <div class="p-3">
        <h4 class="font-semibold text-lg">${rec.title}</h4>
        <a href="/moviedetails?movie_id=${rec.id}" class="text-red-500 text-sm hover:underline">View Details</a>

      </div>
    `;
        recList.appendChild(card);
      });
    } else {
      recList.innerHTML = `<p class="text-gray-500 px-5 mt-5">No similar movies available yet.</p>`;
    }


  } catch (err) {
    console.error("Failed to load movie details:", err);
    document.getElementById("movie-title").textContent = "Movie not found.";
  }

}

fetchMovieDetails();


document.addEventListener("DOMContentLoaded", () => {
  const shareBtn = document.getElementById("share-button");

  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareData = {
        title: document.getElementById("movie-title").textContent,
        text: "Check out this movie on CineSpace!",
        url: window.location.href
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
          console.log("Shared successfully");
        } catch (err) {
          console.error("Error sharing:", err);
        }
      } else {
        // Fallback: Copy URL to clipboard
        try {
          await navigator.clipboard.writeText(shareData.url);
          alert("Link copied to clipboard!");
        } catch (err) {
          alert("Could not copy link. Please copy manually.");
        }
      }
    });
  }
});
