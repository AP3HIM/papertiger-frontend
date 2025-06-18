import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { useMovieContext } from "../contexts/MovieContext";
import logoUrl from "../assets/PTC_Logo.svg";
import { useRef, useEffect } from "react";
import gsap from "gsap";

const GENRES = [
  "Horror", "Comedy", "Drama", "Sci-Fi", "Action", "Romance", "Western", "Thriller"
];

function NavBar() {
  const navigate = useNavigate();
  const { isLoggedIn, logout } = useMovieContext();
  const logoRef = useRef(null);

  useEffect(() => {
    if (logoRef.current) {
      gsap.fromTo(
        logoRef.current,
        { scale: 0, opacity: 0, rotation: -180 },
        { scale: 1, opacity: 1, rotation: 0, duration: 1.5, ease: "elastic.out(1, 0.5)" }
      );
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <Link to="/">
        <img src={logoUrl} alt="Paper Tiger Cinema Logo" className="logo" />
      </Link>
      <div className="navbar-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/favorites" className="nav-link">Favorites</Link>
        <Link to="/watchlater" className="nav-link">Watch Later</Link>

        <div className="genre-dropdown nav-link">
          Genres ▾
          <div className="dropdown-content">
            {GENRES.map((genre) => (
              <Link
                key={genre}
                to={`/genre/${genre}`}
                className="dropdown-item"
              >
                {genre}
              </Link>
            ))}
          </div>
        </div>

        {isLoggedIn ? (
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        ) : (
          <>
            <Link to="/login" className="nav-link">Login</Link>
            <Link to="/register" className="nav-link">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
