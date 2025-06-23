// src/pages/MakeMeStaff.jsx
import { useEffect, useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { BASE_API_URL } from "../services/api";

export default function MakeMeStaff() {
  const { token } = useMovieContext();
  const [message, setMessage] = useState("Sending request...");

  useEffect(() => {
    if (!token) {
      setMessage("You must be logged in to use this.");
      return;
    }

    fetch(`${BASE_API_URL}/make-me-staff/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setMessage(data.message);
        } else {
          setMessage("Something went wrong.");
        }
      })
      .catch(err => {
        console.error(err);
        setMessage("Error making request.");
      });
  }, [token]);

  return (
    <div style={{ padding: "2rem", textAlign: "center", color: "orange" }}>
      <h1>Make Me Staff</h1>
      <p>{message}</p>
    </div>
  );
}
