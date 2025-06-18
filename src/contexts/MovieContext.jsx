// ─────────────────────────────────────────
//  src/contexts/MovieContext.jsx   (fixed)
// ─────────────────────────────────────────
import {
  createContext, useContext, useState, useEffect,
  useCallback, useMemo,
} from "react";
import { toast } from "react-toastify";
import {
  getMovies, getFeaturedMovies, searchMovies,
  fetchFavorites, addFavorite, removeFavorite,
  fetchWatchLater, addWatchLater, removeWatchLater,
  fetchProgress, updateProgress as apiUpdateProgress,
  tokenIsValid,
} from "../services/api";

const MovieContext = createContext();

/* ── wait until we REALLY have a usable access-token ── */
const waitForToken = async () => {
  /* wipe the old “undefined” poison once at start-up                */
  if (localStorage.getItem("access_token") === "undefined") {
    localStorage.removeItem("access_token");
  }
  /* spin only until a non-empty, non-“undefined” token exists       */
  while (true) {
    const tok = localStorage.getItem("access_token");
    if (tok && tok !== "undefined") break;
    await new Promise(r => setTimeout(r, 0));   // next micro-task
  }
};

export const MovieProvider = ({ children }) => {

  /* primitive (unchanged) */
  const [movies, setMovies]               = useState([]);
  const [featuredMovies, setFeaturedMovies] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error,   setError]               = useState(null);
  const [searchTerm, setSearchTerm]       = useState("");
  const [filteredMovies, setFilteredMovies] = useState([]);

  /* auth & side lists */
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [favorites,  setFavorites]  = useState([]);
  const [watchLater, setWatchLater] = useState([]);
  const [progress,   setProgress]   = useState({});

  /* 1. global auto-logout event (unchanged) */
  useEffect(() => {
    const onLogout = () => {
      setIsLoggedIn(false);
      setFavorites([]); setWatchLater([]); setProgress({});
      toast.warning("Session expired – please log in again.");
    };
    window.addEventListener("ptc-auto-logout", onLogout);
    return () => window.removeEventListener("ptc-auto-logout", onLogout);
  }, []);

  /* 2. guest progress bootstrap (unchanged) */
  useEffect(() => {
    setProgress(JSON.parse(localStorage.getItem("guest_progress") || "{}"));
  }, []);

  /* 3. side-list fetchers (unchanged logic, trimmed comments) */
  const fetchFavoritesList = useCallback(async () => {
    if (!isLoggedIn) return setFavorites([]);
    try   { setFavorites(await fetchFavorites()); }
    catch { setFavorites([]); }
  }, [isLoggedIn]);

  const fetchWatchLaterList = useCallback(async () => {
    if (!isLoggedIn) return setWatchLater([]);
    try   { setWatchLater(await fetchWatchLater()); }
    catch { setWatchLater([]); }
  }, [isLoggedIn]);

  const fetchProgressList = useCallback(async () => {
    if (!isLoggedIn) return;
    try {
      const rows = await fetchProgress();    // [{movie,position}]
      setProgress(Object.fromEntries(rows.map(r => [r.movie, r.position])));
    } catch { setProgress({}); }
  }, [isLoggedIn]);

  /* 4. mutators (unchanged) …                                                      */
  /* ----------------------------------------------------------------------------- */
  const isFavorite   = id => favorites .some(f => f.movie.id === id);
  const isInWatchLater = id =>
    watchLater.some(w => (typeof w.movie === "number" ? w.movie : w.movie.id) === id);

  const addToFavorites      = async id => { if (!isLoggedIn) return toast.warning("Log in first");
    if (isFavorite(id)) return; await addFavorite(id); fetchFavoritesList(); toast.success("Added to favorites"); };

  const removeFromFavorites = async id => { await removeFavorite(id);
    setFavorites(prev => prev.filter(f => f.movie.id !== id)); toast.info("Removed from favorites"); };

  const addToWatchLater     = async id => { if (!isLoggedIn) return toast.warning("Log in first");
    if (isInWatchLater(id)) return; try { await addWatchLater(id); toast.success("Added to Watch-Later"); }
    catch(e){ if(e.message.includes("Already")) toast.info("Already in Watch-Later"); else throw e; }
    fetchWatchLaterList(); };

  const removeFromWatchLater= async id => { await removeWatchLater(id);
    setWatchLater(prev => prev.filter(w => (typeof w.movie==="number"?w.movie:w.movie.id)!==id));
    toast.info("Removed from Watch-Later"); };

  const updateProgress = useCallback(async (movieId, seconds) => {
    setProgress(prev => ({ ...prev, [movieId]: seconds }));
    if (!isLoggedIn) {
      const guest = JSON.parse(localStorage.getItem("guest_progress") || "{}");
      guest[movieId] = seconds; localStorage.setItem("guest_progress", JSON.stringify(guest));
      return;
    }
    try { await apiUpdateProgress(movieId, seconds); } catch {/* ignore */ }
  }, [isLoggedIn]);
  /* ----------------------------------------------------------------------------- */

  /* 5. initial data + auth bootstrap (unchanged) */
  const loadMovies    = useCallback(async () => {
    try { setLoading(true); setMovies(await getMovies()); }
    catch { setError("Failed to load movies"); setMovies([]); }
    finally { setLoading(false); }
  }, []);
  const loadFeatured  = useCallback(async () => {
    try { setFeaturedMovies(await getFeaturedMovies()); }
    catch { setFeaturedMovies([]); }
  }, []);

  useEffect(() => {
    loadMovies(); loadFeatured();
    (async () => {
      const access  = localStorage.getItem("access_token");

      /* 1 – happy path → access token still OK */
      if (access && tokenIsValid(access)) {
        setIsLoggedIn(true);
        return;
      }
       else {
        setIsLoggedIn(false);        // no usable tokens at all
      }
    })();
    
  }, [loadMovies, loadFeatured]);

  /* 6. side-list auto fetch – now waits one tick */
  useEffect(() => {
    if (!isLoggedIn) return;
    (async () => {
      await waitForToken();                  // ← key addition
      fetchFavoritesList();
      fetchWatchLaterList();
      fetchProgressList();
    })();
  }, [isLoggedIn, fetchFavoritesList, fetchWatchLaterList, fetchProgressList]);

  /* 7. derived lists / search (unchanged) */
  const popularMovies = useMemo(
    () => [...movies].sort((a,b)=>(b.views??0)-(a.views??0)).slice(0,30), [movies]);
  const recentlyAdded = useMemo(
    () => [...movies].sort((a,b)=>(new Date(b.created_at||0)-new Date(a.created_at||0))||(b.id-a.id)).slice(0,30),
    [movies]);

  const handleSearch = async term => {
    setSearchTerm(term);
    if (!term.trim()) return setFilteredMovies([]);
    try { setFilteredMovies(await searchMovies(term)); }
    catch { setFilteredMovies([]); }
  };
    /* 0-bis. react whenever api.js tells us we’re authenticated ---------- */
  useEffect(() => {
    const onGoodAuth = () => {
      setIsLoggedIn(true);
      fetchFavoritesList();
      fetchWatchLaterList();
      fetchProgressList();
    };
    window.addEventListener("ptc-login-success",  onGoodAuth);
    return () => {
      window.removeEventListener("ptc-login-success",  onGoodAuth);
    };
  }, [fetchFavoritesList, fetchWatchLaterList, fetchProgressList]);
  /* 8. context value – login now waits too */
  const value = {
    movies, featuredMovies, loading, error,
    popularMovies, recentlyAdded,
    searchTerm, filteredMovies, handleSearch,

    isLoggedIn,
    login : async () => {
      await waitForToken();                 // ← ensure token visible
      setIsLoggedIn(true);
      fetchFavoritesList(); fetchWatchLaterList(); fetchProgressList();
    },
    logout: () => {
      localStorage.removeItem("access_token");
      setIsLoggedIn(false);
      setFavorites([]); setWatchLater([]); setProgress({});
      toast.success("Logged out");
    },

    favorites, isFavorite, addToFavorites, removeFromFavorites,
    watchLater, isInWatchLater, addToWatchLater, removeFromWatchLater,
    progress,   updateProgress,
  };

  return <MovieContext.Provider value={value}>{children}</MovieContext.Provider>;
};

/* handy hook */
export const useMovieContext = () => useContext(MovieContext);
