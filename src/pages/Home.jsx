import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import HeroCarousel from "../components/HeroCarousel";
import MovieCarousel from "../components/MovieCarousel";
import HomeMovieCard from "../components/HomeMovieCard";
import "../css/Home.css";
import "../css/HomeMovieCard.css";
import SEOHome from "../components/SEOHome";

const GENRES = ["Horror", "Comedy", "Drama", "Sci-Fi", "Action", "Romance", "Western", "Thriller"];

const tidy = (s = "") =>
  s.trim().toLowerCase()
    .replace(/\b\w/g, c => c.toUpperCase())
    .replace("Sci-fi", "Sci-Fi");

export default function Home() {
  const {
    movies, featuredMovies, searchTerm, handleSearch,
    loading, error, filteredMovies, popularMovies, recentlyAdded, progress,
  } = useMovieContext();

  const continueWatching = useMemo(
    () => movies.filter(m => (progress[m.id] ?? 0) > 0).slice(0, 12),
    [movies, progress]
  );

  const heroMovies = useMemo(
    () => movies.filter(m => m.is_hero),
    [movies]
  );

  const [grouped, setGrouped] = useState({});
  const [curatorPicks, setCuratorPicks] = useState([]);

  useEffect(() => {
    if (!Array.isArray(movies)) return;
    const featured = movies.filter(m => m.is_featured);
    const g = {};
    const curator = [];

    GENRES.forEach(name => {
      const genre = tidy(name);
      const all = featured.filter(m => tidy(m.genre) === genre);
      if (!all.length) return;

      const byViews = all.filter(m => (m.views ?? 0) >= 50);
      const top = (byViews.length ? byViews : all).slice(0, 12);
      const other = all.filter(m => !top.includes(m));

      if (top.length >= 6) {
        g[genre] = { top, other };
      } else {
        curator.push(...top, ...other);
      }
    });

    setGrouped(g);
    setCuratorPicks(curator.slice(0, 36));
  }, [movies]);

  return (
    <>
      <SEOHome />
      <div className="home-container">
        <div className="hero-full-bleed">
          <HeroCarousel
            movies={heroMovies}
            searchQuery={searchTerm}
            handleSearch={handleSearch}
          />
        </div>

        {loading && <div className="loading-message">Loading…</div>}
        {error && <div className="error-message">{error}</div>}

        {!loading && !error && searchTerm && (
          <section className="search-results-section">
            <h2 className="search-results-title">Search Results</h2>
            {filteredMovies.length ? (
              <div className="movies-grid">
                {filteredMovies.map(m => (
                  <HomeMovieCard key={m.id} movie={m} />
                ))}
              </div>
            ) : (
              <div className="no-results-message">No matches found.</div>
            )}
          </section>
        )}

        {!loading && !error && !searchTerm && (
          <div className="carousel-section">
            {continueWatching.length > 0 && (
              <MovieCarousel title="Continue Watching" movies={continueWatching} />
            )}

            <MovieCarousel title="Featured" movies={featuredMovies} />
            <MovieCarousel title="Popular Movies" movies={popularMovies} />

            {Object.entries(grouped).map(([genre, { top, other }]) => (
              <section key={genre} className="genre-section">
                <Link to={`/genre/${genre}`} className="genre-link">
                  <h2 className="movie-carousel-title">Top {genre} Movies</h2>
                </Link>
                <MovieCarousel title="" movies={top} />

                {other.length >= 6 && (
                  <>
                    <Link to={`/genre/${genre}`} className="genre-link">
                      <h3 className="movie-carousel-subtitle">Other {genre} Movies</h3>
                    </Link>
                    <MovieCarousel title="" movies={other} />
                  </>
                )}
              </section>
            ))}

            <MovieCarousel title="Recently Added" movies={recentlyAdded} />

            {curatorPicks.length > 0 && (
              <>
                <MovieCarousel title="Curator’s Picks" movies={curatorPicks.slice(0, 18)} />
                {curatorPicks.length > 18 && (
                  <MovieCarousel title="More Curator’s Picks" movies={curatorPicks.slice(18, 36)} />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
