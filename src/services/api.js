// ─────────────────────────────────────────
//  src/services/api.js   (access-token only)
// ─────────────────────────────────────────
export const BASE_API_URL = "https://api.papertigercinema.com/api";
import { toast } from "react-toastify"
/* one key only */
const ACCESS_KEY = "access_token";
let sessionExpiredToastShown = false;
/* helpers */
const getAccess  = () => localStorage.getItem(ACCESS_KEY);
const setAccess  = v => v && localStorage.setItem(ACCESS_KEY, v);
const clearAuth  = () => {
  localStorage.removeItem(ACCESS_KEY);
  window.dispatchEvent(new Event("ptc-auto-logout"));
};

/* very small expiry test */
export const tokenIsValid = (tok) => {
  try {
    const [, p] = tok.split(".");
    const json  = atob(p.replace(/-/g, "+").replace(/_/g, "/")
                       .padEnd(p.length + (4 - p.length % 4) % 4, "="));
    return JSON.parse(json).exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

/* build headers */
const authHeaders = () => ({
  "Content-Type": "application/json",
  ...(getAccess() && { Authorization: `Bearer ${getAccess()}` }),
});

/* generic request (NO refresh, NO retry) */
export async function request(path, { method = "GET", body = null } = {}) {
  const res = await fetch(`${BASE_API_URL}${path}`, {
    method,
    headers: authHeaders(),
    ...(body && { body: JSON.stringify(body) }),
  });

  if (res.status === 401) {
    clearAuth();  // auto-logout on invalid token
    if (!sessionExpiredToastShown) {
      toast.error("Session expired. Please log in again.");
      sessionExpiredToastShown = true;
    }
  }

  if (!res.ok) throw new Error(await res.text());

  return res.status === 204 ? null : res.json();
}

/* endpoint helpers */
const arr = (d) => (Array.isArray(d)
  ? d
  : Array.isArray(d.results) ? d.results : []);

/* ── Movies ───────────────────────────── */
export const getMovies         = () => request("/movies/").then(arr);
export const getFeaturedMovies = () => request("/movies/?is_featured=true&page_size=100").then(arr);
export const getMovieDetail    = (id) => request(`/movies/${id}/`);
export const searchMovies      = (q)  => request(`/movies/?search=${encodeURIComponent(q)}`).then(arr);

/* ── Favourites ───────────────────────── */
export const fetchFavorites    = () => request("/movies/favorites/");
export const addFavorite       = (id) => request("/movies/favorites/add/",          { method: "POST", body: { movie_id: id } });
export const removeFavorite    = (id) => request(`/movies/favorites/${id}/remove/`, { method: "DELETE" });

/* ── Watch Later ──────────────────────── */
export const fetchWatchLater   = () => request("/movies/watchlater/");
export const addWatchLater     = (id) => request("/movies/watchlater/add/",         { method: "POST", body: { movie_id: id } });
export const removeWatchLater  = (id) => request(`/movies/watchlater/${id}/`,       { method: "DELETE" });

/* ── Progress ─────────────────────────── */
export const fetchProgress     = () => request("/movies/progress/");
export const updateProgress    = (id, pos) => request("/movies/progress/update/",   { method: "POST", body: { movie_id: id, position: pos } });
export const incrementView     = (id) => request(`/increment-view/${id}/`,   { method: "POST" });

/* ── Comments ─────────────────────────── */
export const fetchComments = (id) =>
  request(`/movies/${id}/comments/`).then(arr);

/**
 * POST a new comment (auth required)
 * @param {number} id   movie id
 * @param {string} text comment body
 * @param {number|null} rating 1-5 or null
 */
export async function postComment(id, text, rating = null) {
  const token = getAccess();                          // grab the stored JWT
  console.log("Posting comment with token:", token);  // <-- handy debug line
  return request(`/movies/${id}/comments/`, {
    method: "POST",
    body:   { text, rating },
  });
}

export const deleteComment = (cid) => {
  return request(`/comments/${cid}/`, { method: "DELETE" });
};
/* ── Auth helpers ─────────────────────── */
export async function loginUser(username, password) {
  const r = await fetch(`${BASE_API_URL}/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await r.json();
  if (!r.ok) throw new Error(data.detail || "Login failed");

  setAccess(data.access); // store ONLY the access token
  window.dispatchEvent(new Event("ptc-login-success"));
  return data.access;
}

export async function registerUser(username, password, email) {
  const r = await fetch(`${BASE_API_URL}/accounts/register/`, {  // ✅ this is correct
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, email }),
  });
  if (!r.ok) throw new Error(await r.text());
  return r.status;
}


export const logoutUser = clearAuth;
