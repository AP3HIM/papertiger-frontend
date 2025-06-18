// src/components/MovieCard.jsx
import { Link, useLocation } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import { toast } from "react-toastify";
import "../css/MovieCard.css";
import placerholder from "../assets/placerholder_thumbnail.jpg";


export default function MovieCard({ movie }) {
  const {
    isLoggedIn,
    isFavorite, addToFavorites, removeFromFavorites,
    isInWatchLater, addToWatchLater, removeFromWatchLater,
    progress
  } = useMovieContext();

  const movieId = movie.id ?? movie.movie?.id;
  const favorite = isFavorite(movieId);
  const inLater = isInWatchLater(movieId);
  const location = useLocation();

  const seconds = progress[movie.id] ?? 0;
  const pct = movie.runtime_minutes
    ? Math.min(100, (seconds / (movie.runtime_minutes * 60)) * 100)
    : 100 * (seconds > 0);                     // 100 % stripe if runtime unknown

  const onFavClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn) return toast.warning("You must be logged in to use favorites");
    favorite ? removeFromFavorites(movieId) : addToFavorites(movieId);
  };

  const onLaterClick = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (!isLoggedIn) return toast.warning("You must be logged in to use Watch-Later");
    inLater ? removeFromWatchLater(movieId) : addToWatchLater(movieId);
  };

  const rt = movie.runtime_minutes;
  const rtT = rt ? `${Math.floor(rt / 60)}h ${rt % 60}m` : "N/A";

  return (
    <Link to={`/movies/${movieId}`} className="movie-link">
      <div className="movie-card">
        {pct > 0 && (
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
        )}
        <div className="movie-poster">
          <img
            src={movie.thumbnail_url?.trim() || placerholder}
            alt={movie.title}
            className="poster-img"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = placerholder;
            }}
          />

          <button
            className={`favorite-btn ${favorite ? "active" : ""}`}
            onClick={onFavClick}
          >
            ♥
          </button>
          <button
            className={`watchlater-btn ${inLater ? "active" : ""}`}
            onClick={onLaterClick}
          >
            ➕
          </button>
        </div>
        <div className="movie-info">
          <h3 className="movie-title">{movie.title}</h3>
          <p className="movie-year">{movie.year || ""}</p>
          <p className="movie-meta">{movie.genre} • {rtT}</p>
        </div>
      </div>
    </Link>
  );
}
