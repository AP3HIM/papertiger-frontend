import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import MovieCard from "../components/MovieCard";
import "../css/GenrePage.css";
import SEOGenre from "../components/SEOGenre";

const normalize = (str = "") =>
  str.trim().toLowerCase().replace(/[\s\-]+/g, "");

const MOVIES_PER_PAGE = 24;

export default function GenrePage() {
  const { genreName } = useParams();
  const { movies, loading, error } = useMovieContext();
  const [genreMovies, setGenreMovies] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!Array.isArray(movies)) return;

    const inputGenre = normalize(genreName);
    const matched = movies.filter((movie) =>
      normalize(movie.genre).includes(inputGenre)
    );

    setGenreMovies(matched);
    setCurrentPage(1);
    document.title = `${genreName} Movies – Paper Tiger Cinema`;
  }, [genreName, movies]);

  if (loading) return <div className="loading-message">Loading…</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!genreMovies.length)
    return <div className="no-results-message">No movies found in this genre.</div>;

  const totalPages = Math.ceil(genreMovies.length / MOVIES_PER_PAGE);
  const start = (currentPage - 1) * MOVIES_PER_PAGE;
  const end = start + MOVIES_PER_PAGE;
  const pageMovies = genreMovies.slice(start, end);

  return (
    <>
      <SEOGenre genre={genreName} />
      <div className="genre-page-container">
        <h1 className="genre-title">{genreName} Movies</h1>
        <div className="movies-grid">
          {pageMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        <div className="pagination-controls">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              className={`page-btn ${i + 1 === currentPage ? "active" : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
