// src/components/LandingScreen.jsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import "../css/MovieGrid.css";
import logoBlack from "../assets/PTC_Logo.svg";
import logoWhite from "../assets/PTC_Logo_White.svg";

const GRID_ROWS = 7;
const GRID_COLS = 12;

function LandingScreen() {
  const navigate = useNavigate();
  const gridRef = useRef(null);
  const centerTileRef = useRef(null);
  const flashRef = useRef(null);
  const [showCTA, setShowCTA] = useState(false);

  useEffect(() => {

    // Calculate center percentage based on the center tile index
    const centerCol = Math.floor(GRID_COLS / 2) + 0.5;
    const centerRow = Math.floor(GRID_ROWS / 2) + 0.5;
    const originX = `${(centerCol / GRID_COLS) * 100}%`;
    const originY = `${(centerRow / GRID_ROWS) * 100}%`;

    gsap.to(gridRef.current, {
      scale: 5.5,
      xPercent: -4.2, // try 4.2% or 1 full tile (100 / 12 ≈ 8.33%)
      duration: 2.4,
      ease: "power2.inOut",
      transformOrigin: `${originX} ${originY}`,
      onComplete: () => {
        gsap.to(flashRef.current, {
          opacity: 1,
          duration: 0.25,
          onComplete: () => {
            setShowCTA(true);
          },
        });
      },
    });
  }, []);

  useEffect(() => {
    if (showCTA) {
      gsap.to(centerTileRef.current, {
        x: "-30vw",
        duration: 1.2,
        ease: "power2.out",
      });

      gsap.to(".full-white-screen", {
        opacity: 1,
        duration: 1,
        delay: 0.2,
        ease: "power2.inOut",
      });

      gsap.fromTo(
        ".slogan-right",
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, delay: 0.8, duration: 1.2, ease: "power2.out" }
      );
    }
  }, [showCTA]);

  const handleEnter = () => {

    const projectorSound = new Audio("/sounds/old-school-projector.mp3");
    projectorSound.play().catch((err) => {
      console.warn("Autoplay failed:", err);
    });
    localStorage.setItem("seenLanding", "true");
    navigate("/home");
  };

  const totalTiles = GRID_ROWS * GRID_COLS;
  const centerIndex = Math.floor(totalTiles / 2);

  return (
    <div className="landing-wrapper">
      <div
        className="movie-grid"
        ref={gridRef}
        style={{
          gridTemplateColumns: `repeat(${GRID_COLS}, 1fr)`,
          gridTemplateRows: `repeat(${GRID_ROWS}, 1fr)`,
          transform: "scale(1) translateY(-2.5%)", // slight upward shift
        }}
      >
        {Array.from({ length: totalTiles }).map((_, index) => {
          if (index === centerIndex) {
            return (
              <div key={index} className="movie-grid-item center-tile" ref={centerTileRef}>
                <img src={logoWhite} alt="White Logo" />
              </div>
            );
          }
          return (
            <div key={index} className="movie-grid-item logo-tile">
              <img src={logoBlack} alt="Black Logo" />
            </div>
          );
        })}
      </div>

      <div className="white-flash" ref={flashRef} />

      {showCTA && (
        <div className="full-white-screen">
          <div className="logo-left">
            <img src={logoWhite} alt="PTC Logo" />
          </div>
          <div className="slogan-right">
            <h2 className="cta-tagline">Vintage Films. Modern Experience.</h2>
            <p>
              Explore thousands of iconic public domain films — now with the best
              streaming experience ever made.
            </p>
            <button onClick={handleEnter}>Start Watching</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LandingScreen;
