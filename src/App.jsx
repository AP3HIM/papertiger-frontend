// src/App.jsx
import ReactGA from "react-ga4";

const GA_ID = process.env.REACT_APP_GA_ID;
if (GA_ID) {
  ReactGA.initialize(GA_ID);
  ReactGA.send("pageview");
}

import { HelmetProvider } from 'react-helmet-async';

import "./css/App.css";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MovieProvider } from "./contexts/MovieContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "video.js/dist/video-js.css";

import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import MovieDetail from "./pages/MovieDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import GenrePage from "./pages/GenrePage";
import WatchLaterPage from "./pages/WatchLater";
import About from "./pages/legal/About";
import TermsOfService from "./pages/legal/TermsOfService";
import PrivacyPolicy from "./pages/legal/PrivacyPolicy";
import CopyrightPolicy from "./pages/legal/CopyrightPolicy";
import Footer from "./components/Footer";
import LandingScreen from "./components/LandingScreen";
// import MakeMeStaff from "./pages/MakeMeStaff";
// import MakeMeSuperuser from "./pages/MakeMeSuperuser";

function RoutesWithNav() {
  const { pathname } = useLocation();
  const seenLanding = localStorage.getItem("seenLanding");

  return (
    <>
      {/* Hide NavBar on landing and home pages */}
      {!["/", "/home"].includes(pathname) && <NavBar />}

      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={
              seenLanding ? <Navigate to="/home" replace /> : <LandingScreen />
            }
          />
          <Route path="/home" element={<Home />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/movies/:slug" element={<MovieDetail />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/genre/:genreName" element={<GenrePage />} />
          <Route path="/watchlater" element={<WatchLaterPage />} />
          <Route path="/about" element={<About />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/copyright" element={<CopyrightPolicy />} />
          {/*
          <Route path="/make-me-staff" element={<MakeMeStaff />} />
          <Route path="/make-me-superuser" element={<MakeMeSuperuser />} />
          */}
        </Routes>
        <ToastContainer position="bottom-right" autoClose={3000} theme="dark" />
      </main>

      <Footer />
    </>
  );
}


export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <MovieProvider>
          <RoutesWithNav />
        </MovieProvider>
      </Router>
    </HelmetProvider>
  );
}
