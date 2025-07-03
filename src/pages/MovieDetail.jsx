// src/pages/MovieDetail.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getMovieDetail, incrementView } from "../services/api";
import MoviePlayer from "../components/MoviePlayer";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard   from "../components/MovieCard";
import CommentsSection from "../components/CommentsSection";
import "../css/MovieDetail.css";
import { Helmet } from "react-helmet-async";


export default function MovieDetail() {
  const { slug } = useParams();

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
        const data = await getMovieDetail(slug);
        setMovie(data);

        incrementView(slug).catch(() => {});          // fire-and-forget

        console.log("MOVIE DETAIL DATA:", data);


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
  }, [slug, movies]);

  /***** render ************************************************************/
  if (err)     return <p className="error-message">{err}</p>;
  if (!movie)  return <p className="loading">Loading…</p>;

  return (
    <>
      <Helmet>
        <title>{movie.title} ({movie.year}) | Paper Tiger Cinema</title>
        <meta name="description" content={movie.overview?.slice(0, 160) || "Watch this classic movie online free."} />
        <link rel="canonical" href={`https://papertigercinema.com/movies/${movie.slug}`} />

        {/* Open Graph / Facebook */}
        <meta property="og:title" content={`${movie.title} (${movie.year})`} />
        <meta property="og:description" content={movie.overview?.slice(0, 160) || "Watch this classic movie online free."} />
        <meta property="og:image" content={movie.thumbnail_url} />
        <meta property="og:url" content={`https://papertigercinema.com/movies/${movie.slug}`} />
        <meta property="og:type" content="video.movie" />

        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${movie.title} (${movie.year})`} />
        <meta name="twitter:description" content={movie.overview?.slice(0, 160) || "Watch this classic movie online free."} />
        <meta name="twitter:image" content={movie.thumbnail_url} />

        {/* Schema.org JSON-LD */}
        <script type="application/ld+json">{`
          {
            "@context": "https://schema.org",
            "@type": "Movie",
            "name": "${movie.title}",
            "description": "${movie.overview?.slice(0, 300)}",
            "datePublished": "${movie.year}-01-01",
            "genre": "${movie.genre}",
            "image": "${movie.thumbnail_url}",
            "url": "https://papertigercinema.com/movies/${movie.slug}"
          }
        `}</script>
      </Helmet>

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
    </>
  );
}
