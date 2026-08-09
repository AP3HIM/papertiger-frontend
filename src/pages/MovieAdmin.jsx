// src/pages/MovieAdmin.jsx
import { useEffect, useState } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import api from "../services/api";

export default function MovieAdmin() {
  const [movies, setMovies] = useState([]);
  const [saving, setSaving] = useState(false);
  const { token } = useMovieContext();

  useEffect(() => {
    api.get("/movies/").then(res => setMovies(res.data));
  }, []);

  function handleChange(index, field, value) {
    const updated = [...movies];
    updated[index][field] = value;
    setMovies(updated);
  }

  async function handleSave(movie) {
    setSaving(true);
    try {
      await api.patch(`/movies/${movie.id}/`, movie, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Saved!");
    } catch (err) {
      console.error(err);
      alert("Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <h1>Movie Admin</h1>
      {movies.map((m, i) => (
        <div key={m.id} className="admin-card">
          <input
            value={m.title}
            onChange={(e) => handleChange(i, "title", e.target.value)}
          />
          <input
            value={m.thumbnail_url}
            onChange={(e) => handleChange(i, "thumbnail_url", e.target.value)}
          />
          <textarea
            value={m.overview}
            onChange={(e) => handleChange(i, "overview", e.target.value)}
          />
          <input
            value={m.genre}
            onChange={(e) => handleChange(i, "genre", e.target.value)}
          />
          <label>
            Featured:
            <input
              type="checkbox"
              checked={m.is_featured}
              onChange={(e) => handleChange(i, "is_featured", e.target.checked)}
            />
          </label>
          <label>
            Hero:
            <input
              type="checkbox"
              checked={m.is_hero}
              onChange={(e) => handleChange(i, "is_hero", e.target.checked)}
            />
          </label>
          <button onClick={() => handleSave(m)} disabled={saving}>Save</button>
        </div>
      ))}
    </div>
  );
}
