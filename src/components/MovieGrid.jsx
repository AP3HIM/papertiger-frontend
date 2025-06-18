// src/components/MovieGrid.jsx
import { Link } from "react-router-dom";
import "../css/MovieGrid.css";
import logo from "../assets/PTC_Logo.svg";

function MovieGrid() {
  const totalTiles = 25;

  return (
    <div className="movie-grid">
      {Array.from({ length: totalTiles }).map((_, index) => {
        if (index === 12) {
          // Center tile
          return (
            <div key={index} className="movie-grid-item center-tile">
              <Link to="/" className="cta-tile">
                <img src={logo} alt="PTC Logo" className="cta-logo" />
                <div className="cta-text">Enter Paper Tiger Cinema</div>
              </Link>
            </div>
          );
        } else {
          return (
            <div key={index} className="movie-grid-item logo-tile">
              <img src={logo} alt="PTC Logo" className="movie-thumbnail" />
            </div>
          );
        }
      })}
    </div>
  );
}

export default MovieGrid;
