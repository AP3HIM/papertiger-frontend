import { Link } from "react-router-dom";
import "../css/Footer.css";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-links">
        <Link to="/about">About</Link>
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
        <Link to="/copyright">Copyright</Link>
      </div>
      <p className="footer-credit">© {new Date().getFullYear()} Paper Tiger Cinema</p>
    </footer>
  );
}
