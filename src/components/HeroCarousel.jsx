// src/components/HeroCarousel.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import { Link, useNavigate } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/HeroCarousel.css";
import "../css/Navbar.css";
import hcplaceholder from "../assets/hc_thumbnail.jpg";
import logoUrl from "../assets/PTC_Logo.svg";
import { useRef, useEffect } from "react";
import gsap from "gsap";

const GENRES = [
  "Horror", "Comedy", "Drama", "Sci-Fi", "Action", "Romance", "Western", "Thriller"
];

const HeroCarousel = ({
  movies = [],      // e.g. popularMovies from Home.jsx
  searchQuery,      // current searchTerm
  handleSearch,     // function to call whenever user types or submits search
  genres = [],
  handleGenreSelect,
}) => {
  const { isLoggedIn, logout } = useMovieContext();
  const navigate = useNavigate();
  const logoRef = useRef(null);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0.5, opacity: 0, rotationY: 180 },
        { scale: 1, opacity: 1, rotationY: 0, duration: 1.5, ease: "power3.out" }
      );
    }
  }, []);

  const onLogout = () => {
    logout();
    navigate("/");
  };

  const onInputChange = (e) => {
    handleSearch(e.target.value);
  };

  const onSearchSubmit = (e) => {
    e.preventDefault();
    handleSearch(searchQuery);
  };

  return (
    <div className="hero-carousel-wrapper">
      {/* Overlay nav + search */}
      <div className="hero-overlay-nav-search">
        <div className="hero-navbar-top">
          <div className="hero-logo">
            <Link to="/">
              <img src={logoUrl} alt="Paper Tiger Cinema Logo" className="logo" />
            </Link>
          </div>
          <div className="hero-nav-links">
            <Link to="/" className="hero-nav-link">Home</Link>
            <Link to="/favorites" className="hero-nav-link">Favorites</Link>
            <Link to="/watchlater" className="hero-nav-link">Watch Later</Link>
            <div className="hero-genre-dropdown hero-nav-link">
              Genres ▾
              <div className="hero-dropdown-content">
                {GENRES.map((genre) => (
                  <Link
                    key={genre}
                    to={`/genre/${genre}`}
                    className="hero-dropdown-item"
                  >
                    {genre}
                  </Link>
                ))}
              </div>
            </div>
            {isLoggedIn ? (
              <button onClick={onLogout} className="hero-nav-button">Logout</button>
            ) : (
              <>
                <Link to="/login" className="hero-nav-link">Login</Link>
                <Link to="/register" className="hero-nav-link">Register</Link>
              </>
            )}
          </div>
        </div>

        {/* Search Form */}
        <form onSubmit={onSearchSubmit} className="hero-search-form">
          <input
            type="text"
            className="hero-search-input"
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={onInputChange}
          />
          <button type="submit" className="hero-search-button">Search</button>
          {genres.length > 0 && (
            <select
              className="hero-genre-select"
              onChange={(e) => handleGenreSelect(e.target.value)}
              value={genres.includes(searchQuery) ? searchQuery : ""}
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          )}
        </form>
      </div>

      {/* Swiper Carousel */}
      {movies.length > 0 ? (
        <Swiper
          spaceBetween={30}
          centeredSlides={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={false}
          modules={[Autoplay, Pagination, Navigation]}
          className="hero-swiper"
        >
          {movies.map((movie) => (
            <SwiperSlide key={movie.id}>
              <div
                className="hero-slide-content"
                style={{
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 50%), url(${movie.thumbnail_url?.trim() ? movie.thumbnail_url : hcplaceholder})`,
                  backgroundColor: "#000",
                }}
              >
                <div className="hero-movie-details">
                  <h2 className="hero-movie-title">{movie.title}</h2>
                  <p className="hero-movie-overview">
                    {movie.overview || `${movie.genre || "Unknown Genre"} ${movie.year || ""}`}
                  </p>
                  <Link to={`/movies/${movie.slug}`} className="hero-more-info-btn">
                    Watch Now
                  </Link>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="hero-empty-message">No movies available right now.</div>
      )}
    </div>
  );
};

export default HeroCarousel;
