window.addEventListener("scroll", function () {
  const header = document.querySelector(".site-header");
  if (!header) return;
  if (window.scrollY > 50) header.classList.add("scrolled");
  else header.classList.remove("scrolled");
});

const searchToggle = document.querySelector(".search-toggle");
if (searchToggle) {
  searchToggle.addEventListener("click", function () {
    const form = document.querySelector(".search-form");
    if (form) form.classList.toggle("active");
  });
}

document.querySelectorAll(".btn-outline").forEach((button) => {
  button.addEventListener("click", function () {
    this.classList.toggle("active");
    this.textContent = this.classList.contains("active")
      ? "✓ Ma Liste"
      : "+ Ma Liste";
  });
});

const API_KEY = "08a341931ab5f5dcee467baeb4a68c76";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_W500 = "https://image.tmdb.org/t/p/w500";
const IMG_W300 = "https://image.tmdb.org/t/p/w300";

function ensureGlobalStatus() {
  const main = document.querySelector("main#contenu") || document.body;
  if (!document.getElementById("loader")) {
    const d = document.createElement("div");
    d.id = "loader";
    d.setAttribute("role", "status");
    d.style.margin = "1rem 0";
    d.style.display = "none";
    main.prepend(d);
  }
  if (!document.getElementById("error")) {
    const d = document.createElement("div");
    d.id = "error";
    d.setAttribute("role", "alert");
    d.style.margin = "0.5rem 0";
    main.prepend(d);
  }
}
function showLoading(isLoading) {
  ensureGlobalStatus();
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = isLoading ? "block" : "none";
    loader.textContent = isLoading ? "⏳ Chargement…" : "";
  }
}
function showError(msg) {
  ensureGlobalStatus();
  const box = document.getElementById("error");
  if (box) box.textContent = msg || "";
}
function sectionStatus(containerId, message) {
  const ul = document.getElementById(containerId);
  if (!ul) return;
  ul.innerHTML = `<li aria-live="polite" style="opacity:.8">${message}</li>`;
}

function displayMovieInHero(movie) {
  const heroImg = document.querySelector(".hero-background");
  const titleEl = document.getElementById("hero-title");
  const descEl = document.querySelector(".hero-description");
  const metaEl = document.querySelector(".hero-meta");
  const moreInfoBtn = document.querySelector(
    ".hero-actions .btn.btn-secondary"
  );

  if (titleEl) {
    const year = movie.release_date
      ? ` (${new Date(movie.release_date).getFullYear()})`
      : "";
    titleEl.textContent = `${movie.title}${year}`;
  }
  if (descEl)
    descEl.textContent =
      movie.overview.length > 180
        ? movie.overview.substring(0, 180) + "..."
        : movie.overview || "Pas de description disponible.";

  if (heroImg) {
    const path = movie.backdrop_path || movie.poster_path;
    if (path) {
      heroImg.src = IMG_W500 + path;
      heroImg.alt = `Bannière du film ${movie.title}`;
    }
  }

  if (metaEl) {
    const durationMin = movie.runtime || 0;
    const h = Math.floor(durationMin / 60);
    const m = durationMin % 60;
    const duration = durationMin ? `${h}h${String(m).padStart(2, "0")}` : "—";
    const rating5 = movie.vote_average
      ? (movie.vote_average / 2).toFixed(1)
      : "—";
    const genres = movie.genres?.map((g) => g.name).join(", ") || "—";
    const year = movie.release_date
      ? new Date(movie.release_date).getFullYear()
      : "—";

    metaEl.innerHTML = `
      <li><span>${year}</span></li>
      <li><span>${duration}</span></li>
      <li class="rating">
        <span class="rating-stars">★</span>
        <span>${rating5}/5</span>
      </li>
      <li><span>${genres}</span></li>
    `;
  }

  if (moreInfoBtn) {
    moreInfoBtn.setAttribute("aria-label", `Plus d'infos sur ${movie.title}`);
    moreInfoBtn.onclick = (e) => {
      e.preventDefault();
      window.open(`https://www.themoviedb.org/movie/${movie.id}`, "_blank");
    };
  }
}

async function getMovieWithFetch(movieId) {
  try {
    showLoading(true);
    showError("");
    const res = await fetch(
      `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=fr-FR`
    );
    if (!res.ok) throw new Error(`Erreur HTTP: ${res.status}`);
    const movie = await res.json();
    displayMovieInHero(movie);
    return movie;
  } catch (e) {
    console.error(e);
    showError(`Erreur: ${e.message}`);
  } finally {
    showLoading(false);
  }
}

const containers = {
  tendances: "grid-tendances",
  recommandes: "grid-recommandes",
  nouveautes: "grid-nouveautes",
};

function movieCardTemplate(item) {
  const year = item.release_date
    ? new Date(item.release_date).getFullYear()
    : "—";
  const rating5 = item.vote_average ? (item.vote_average / 2).toFixed(1) : "—";
  const poster = item.poster_path
    ? IMG_W300 + item.poster_path
    : "images/films/inception.webp";

  return `
    <article class="card" aria-labelledby="title-${item.id}">
      <a class="card-link" href="#" onclick="window.open('https://www.themoviedb.org/movie/${item.id}', '_blank'); return false;">
        <img class="card-image" src="${poster}" alt="Affiche de ${item.title}" loading="lazy">
        <div class="card-overlay">
          <button class="card-play" aria-label="Regarder ${item.title}">▶</button>
        </div>
      </a>
      <div class="card-body">
        <h3 id="title-${item.id}">${item.title}</h3>
        <div class="card-meta">
          <span>${year}</span>
          <span class="card-rating">★ ${rating5}/5</span>
        </div>
        <button class="btn btn-outline" data-addlist="${item.id}">+ Ma Liste</button>
      </div>
    </article>
  `;
}

function renderListTo(containerId, items) {
  const ul = document.getElementById(containerId);
  if (!ul) return;
  if (!items?.length) {
    ul.innerHTML = `<li>Aucun film trouvé.</li>`;
    return;
  }
  ul.innerHTML = items
    .slice(0, 12)
    .map((m) => `<li>${movieCardTemplate(m)}</li>`)
    .join("");

  ul.querySelectorAll("button.btn.btn-outline[data-addlist]").forEach((btn) => {
    btn.addEventListener("click", function () {
      this.classList.toggle("active");
      this.textContent = this.classList.contains("active")
        ? "✓ Ma Liste"
        : "+ Ma Liste";
    });
  });
}

async function fetchList(url, containerId, labelChargement = "Chargement…") {
  try {
    sectionStatus(containerId, `⏳ ${labelChargement}`);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    renderListTo(containerId, data.results || []);
  } catch (e) {
    console.error(e);
    const ul = document.getElementById(containerId);
    if (ul) ul.innerHTML = `<li>Erreur de chargement : ${e.message}</li>`;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  getMovieWithFetch(155);
  const commonParams = `api_key=${API_KEY}&language=fr-FR&region=FR&page=1`;

  fetchList(
    `${BASE_URL}/trending/movie/week?${commonParams}`,
    containers.tendances,
    "Tendances…"
  );
  fetchList(
    `${BASE_URL}/movie/popular?${commonParams}`,
    containers.recommandes,
    "Recommandés…"
  );
  fetchList(
    `${BASE_URL}/movie/now_playing?${commonParams}`,
    containers.nouveautes,
    "Nouveautés…"
  );
});
