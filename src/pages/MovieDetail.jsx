import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMovieDetail, incrementView } from "../services/api";
import MoviePlayer from "../components/MoviePlayer";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import CommentsSection from "../components/CommentsSection";
import SEOMovie from "../seo/SEOMovie";
import "../css/MovieDetail.css";

export default function MovieDetail() {
  const { slug } = useParams();
  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [err, setErr] = useState(null);
  const { movies } = useMovieContext();

  useEffect(() => {
    const run = async () => {
      try {
        const data = await getMovieDetail(slug);
        setMovie(data);
        incrementView(slug).catch(() => {});
        setRelated(
          movies.filter((m) => m.genre === data.genre && m.id !== data.id).slice(0, 6)
        );
      } catch (e) {
        console.error(e);
        setErr("Failed to load movie");
      }
    };
    run();

    return () => {
      const vid = document.querySelector("video");
      if (vid) {
        vid.pause();
        vid.currentTime = 0;
      }
    };
  }, [slug, movies]);

  if (err) return <p className="error-message">{err}</p>;
  if (!movie) return <p className="loading">Loading…</p>;

  return (
    <>
      <SEOMovie movie={movie} />
      <div className="movie-detail-container">
        <div className="movie-left">
          <h2>{movie.title}</h2>
          {movie.video_url && (
            <MoviePlayer url={movie.video_url} movieId={movie.id} movieTitle={movie.title} />
          )}
          <div className="movie-meta">
            <p>{movie.year} • {movie.genre} • {movie.runtime_minutes} min</p>
            <p className="movie-description">{movie.description || movie.overview || "No description available."}</p>
          </div>
          <CommentsSection movieId={movie.id} />
        </div>

        <aside className="movie-right">
          <h3>More Like This</h3>
          <div className="related-movies-grid">
            {related.map((m) => <MovieCard key={m.id} movie={m} />)}
          </div>
        </aside>
      </div>
    </>
  );
}
