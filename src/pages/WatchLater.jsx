// src/pages/WatchLater.jsx
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import "../css/Favorites.css";
import "../css/Auth.css";

export default function WatchLaterPage() {
  const { watchLater, movies, isLoggedIn } = useMovieContext();

  const list = watchLater
    .map((wl) => {
      const movieId = typeof wl.movie === "number" ? wl.movie : wl.movie.id;
      return movies.find((m) => m.id === movieId);
    })
    .filter(Boolean);

  if (!isLoggedIn && watchLater.length === 0) {
    return (
      <div className="favorites-empty">
        <h2>You're Not Logged In</h2>
        <p>Create an account or log in to start saving movies to watch later!</p>
      </div>
    );
  }

  if (list.length > 0) {
    return (
      <div className="favorites">
        <h2>Your Watch-Later List</h2>
        <div className="movies-grid">
          {list.map((m) => (
            <MovieCard key={m.id} movie={m} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-empty">
      <h2>No Watch-Later Movies Yet</h2>
      <p>Browse movies and click the + icon to save them for later!</p>
    </div>
  );
}
