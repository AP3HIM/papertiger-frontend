import { Link } from "react-router-dom";
import "../css/HomeMovieCard.css";   // new
import placerholder from "../assets/placerholder_thumbnail.jpg";


export default function HomeMovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie.slug}`} className="home-card">
      <img
        src={movie.thumbnail_url?.trim() ? movie.thumbnail_url : placerholder}
        alt={movie.title}
        className="home-thumb"
        loading="lazy"
      />
      <span className="home-title">{movie.title}</span>
    </Link>
  );
}
