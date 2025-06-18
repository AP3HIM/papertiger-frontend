// src/pages/MovieDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMovieDetail, incrementView } from "../services/api";
import MoviePlayer from "../components/MoviePlayer";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard   from "../components/MovieCard";
import CommentsSection from "../components/CommentsSection";
import "../css/MovieDetail.css";

export default function MovieDetail() {
  const { id } = useParams();

  /** local state */
  const [movie,        setMovie]        = useState(null);   // ← you lost this line
  const [related,      setRelated]      = useState([]);
  const [err,          setErr]          = useState(null);

  /** global movie list (for “More like this”) */
  const { movies } = useMovieContext();

  /** load / cleanup *******************************************************/
  useEffect(() => {
    const run = async () => {
      try {
        const data = await getMovieDetail(id);
        setMovie(data);

        incrementView(id).catch(() => {});          // fire-and-forget

        // pick 6 titles from the same genre (exclude current)
        setRelated(
          movies
            .filter((m) => m.genre === data.genre && m.id !== data.id)
            .slice(0, 6)
        );
      } catch (e) {
        console.error(e);
        setErr("Failed to load movie");
      }
    };
    run();

    /* pause the video when we leave the page */
    return () => {
      const vid = document.querySelector("video");
      if (vid) { vid.pause(); vid.currentTime = 0; }
    };
  }, [id, movies]);

  /***** render ************************************************************/
  if (err)     return <p className="error-message">{err}</p>;
  if (!movie)  return <p className="loading">Loading…</p>;

  return (
    <div className="movie-detail-container">
      <div className="movie-left">
        <h2>{movie.title}</h2>
        <MoviePlayer url={movie.video_url} movieId={movie.id} />
        <div className="movie-meta">
          <p>{movie.year} • {movie.genre} • {movie.runtime_minutes} min</p>
          <p className="movie-description">{movie.description || movie.overview || "No description available."}</p>
        </div>
        {/* comments */}
        <CommentsSection movieId={movie.id} />  
      </div>

      <aside className="movie-right">
        <h3>More Like This</h3>
        <div className="related-movies-grid">
          {related.map((m) => <MovieCard key={m.id} movie={m} />)}
        </div>
      </aside>
    </div>
  );
}
