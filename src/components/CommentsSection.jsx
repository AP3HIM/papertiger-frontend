import { useEffect, useState } from "react";
import { fetchComments, postComment, deleteComment } from "../services/api";
import { useMovieContext } from "../contexts/MovieContext";
import { toast } from "react-toastify";
import "../css/Comments.css";

export default function CommentsSection({ movieSlug }) {
  const { isLoggedIn } = useMovieContext();
  const [comments, setComments] = useState([]);
  const [text, setText]         = useState("");
  const [rating, setRating]     = useState(0);   // 1-5

  const load = async () => {
    try {
      const data = await fetchComments(movieSlug);
      setComments(data);
    } catch (err) {
      console.error("Failed to fetch comments:", err);
      toast.error("Could not load comments");
    }
  };

  useEffect(() => {
    if (movieSlug) load();
  }, [movieSlug]);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await postComment(movieSlug, text.trim(), rating || null);
      toast.success("Comment posted");
      setText("");
      setRating(0);
      load();
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const onDelete = async (id) => {
    if (!window.confirm("Delete comment?")) return;
    try {
      await deleteComment(id);
      toast.info("Comment removed");
      load();
    } catch (err) {
      toast.error("Couldn’t delete comment");
    }
  };

  return (
    <div className="comments-wrapper">
      <h3>Comments</h3>

      {isLoggedIn && (
        <form onSubmit={onSubmit} className="comment-form">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write your thoughts…"
            required
          />
          <select value={rating} onChange={(e) => setRating(+e.target.value)}>
            <option value="0">No rating</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n} ★
              </option>
            ))}
          </select>
          <button type="submit">Post</button>
        </form>
      )}

      {comments.length ? (
        comments.map((c) => (
          <div key={c.id} className="comment">
            <strong>{c.user_name}</strong>
            {c.rating && <span className="rating">{c.rating} ★</span>}
            <span className="date">
              {new Date(c.created_at).toLocaleDateString()}
            </span>
            <p>{c.text}</p>
            {isLoggedIn &&
              c.user_name === localStorage.getItem("username") && (
                <button
                  onClick={() => onDelete(c.id)}
                  className="delete-btn"
                >
                  ×
                </button>
              )}
          </div>
        ))
      ) : (
        <p>No comments yet.</p>
      )}
    </div>
  );
}
