import { useEffect, useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { BASE_API_URL } from "../services/api";

export default function MakeMeSuperuser() {
  const { token } = useMovieContext();
  const [message, setMessage] = useState("Sending request...");

  useEffect(() => {
    if (!token) {
      setMessage("You must be logged in to use this.");
      return;
    }

    fetch(`${BASE_API_URL}/make-me-superuser/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setMessage(data.message || "Something went wrong."))
      .catch(err => {
        console.error(err);
        setMessage("Error making request.");
      });
  }, [token]);

  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "orange" }}>
      <h1>Make Me Superuser</h1>
      <p>{message}</p>
    </div>
  );
}
