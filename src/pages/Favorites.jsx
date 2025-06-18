// src/pages/Favorites.jsx
import "../css/Favorites.css";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";

function Favorites() {
  const { favorites, isLoggedIn } = useMovieContext();

  if (!isLoggedIn && favorites.length === 0) {
    return (
      <div className="favorites-empty">
        <h2>You're Not Logged In</h2>
        <p>Create an account or log in to start favoriting movies!</p>
      </div>
    );
  }

  if (Array.isArray(favorites) && favorites.length > 0) {
    return (
      <div className="favorites">
        <h2>Your Favorites</h2>
        <div className="movies-grid">
          {favorites.map((fav) => {
            const movie = fav.movie?.id ? { ...fav.movie, id: fav.movie.id } : { ...fav, id: fav.movie };
            return <MovieCard movie={movie} key={movie.id} />;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-empty">
      <h2>No Favorite Movies Yet</h2>
      <p>Start adding movies to your favorites and they will appear here!</p>
    </div>
  );
}

export default Favorites;