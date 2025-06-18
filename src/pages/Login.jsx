import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMovieContext } from "../contexts/MovieContext";
import { loginUser } from "../services/api";
import ResendEmail from "../components/ResendEmail";
import { toast } from "react-toastify";
import "../css/Favorites.css";
import "../css/Auth.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useMovieContext();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await loginUser(username, password);          // <-- real API call
      localStorage.setItem("username", username);
      login();                                      // MovieContext
      toast.success("Logged in successfully!");
      navigate("/");
    } catch (err) {
      toast.error(err.message || "Login failed");
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">Login</button>
        </form>

        <div className="resend-wrapper">
          <p className="resend-info">Didn't receive a confirmation email?</p>
          <ResendEmail />
        </div>
      </div>
    </div>
  );
}

export default Login;
