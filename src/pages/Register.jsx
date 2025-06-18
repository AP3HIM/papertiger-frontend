import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";
import { toast } from "react-toastify";
import "../css/Favorites.css";
import "../css/Auth.css";

function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const navigate = useNavigate();

  const toggle = () => setShowPwd(p => !p);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== password2) return toast.error("Passwords do not match!");

    try {
      await registerUser(username, password, email);
      toast.success("Account created! Check your e-mail to confirm.");
      navigate("/login");                // user must log in AFTER confirming
    } catch (err) {
      toast.error("Registration failed: " + err.message);
    }
  };


  return (
    <div className="auth-page">
      <div className="auth-form">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <div className="pwd-wrapper">
            <input
              type={showPwd ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-btn"
              onClick={toggle}
            >
              {showPwd ? "Hide" : "Show"}
            </button>
          </div>

          <small className="password-hint">
            At least 8 chars, one uppercase, one number.
          </small>

          <input
            type={showPwd ? "text" : "password"}
            placeholder="Confirm Password"
            value={password2}
            onChange={e => setPassword2(e.target.value)}
            required
          />

          <button type="submit">Register</button>
        </form>
      </div>
    </div>
  );
}

export default Register;
