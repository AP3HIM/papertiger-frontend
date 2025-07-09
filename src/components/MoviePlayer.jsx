import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import ReactGA from "react-ga4";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/MoviePlayer.css"; // Adjust the path if needed

export default function MoviePlayer({ url, movieId, movieTitle = "Unknown" }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const reactPlayerRef = useRef(null);
  const seekDoneRef = useRef(false);
  const throttleRef = useRef(0);
  const fallbackTimeoutRef = useRef(null);
  const mountedRef = useRef(true);
  const hasTrackedPlayRef = useRef(false);

  const { updateProgress, progress } = useMovieContext();
  const [useFallback, setUseFallback] = useState(false);
  const [reactPlaying, setReactPlaying] = useState(false);

  useEffect(() => {
    mountedRef.current = true;

    if (!url || !url.startsWith("http")) return;
    if (url.includes("archive.org")) {
      setUseFallback(true);
      return;
    }
    if (!videoRef.current || useFallback || document.readyState !== "complete") return;

    const player = videojs(videoRef.current, {
      controls: true,
      autoplay: false,
      preload: "metadata",
      fluid: true,
      responsive: true,
      aspectRatio: "16:9",
      inactivityTimeout: 0,
      controlBar: {
        volumePanel: { inline: false },
        pictureInPictureToggle: false,
        children: [
          "playToggle",
          "progressControl",
          "volumePanel",
          "fullscreenToggle",
        ],
      },
    });

    playerRef.current = player;
    player.src({ type: "video/mp4", src: url });

    player.ready(() => {
      player.one("play", () => {
        setTimeout(() => {
          player.controlBar?.show();
          player.bigPlayButton?.show();
        }, 200);
      });
    });

    player.on("loadedmetadata", () => {
      clearTimeout(fallbackTimeoutRef.current);

      const params = new URLSearchParams(window.location.search);
      const startParam = parseFloat(params.get("start"));
      const resumeTime = !isNaN(startParam) ? startParam : (progress[movieId] || 0);

      if (!seekDoneRef.current && resumeTime > 2) {
        let attempts = 0;

        const trySeek = () => {
          const duration = player.duration();
          if (!duration || isNaN(duration)) {
            console.warn("Duration not ready yet...");
            return;
          }

          console.log(`Trying to seek to ${resumeTime}s... (attempt ${attempts + 1})`);
          player.currentTime(resumeTime);

          setTimeout(() => {
            const currentTime = player.currentTime();
            if (Math.abs(currentTime - resumeTime) < 2 || attempts >= 5) {
              console.log(`Seek successful at ${currentTime.toFixed(1)}s`);
              seekDoneRef.current = true;
            } else {
              attempts++;
              console.warn(`Seek failed (at ${currentTime}s), retrying...`);
              trySeek();
            }
          }, 1000);
        };

        trySeek();
      }
    });


    setTimeout(() => {
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.setAttribute("tabindex", "0");
        videoEl.focus();
        videoEl.click();
      }
    }, 1500);

    fallbackTimeoutRef.current = setTimeout(() => {
      const duration = player.duration();
      if (!duration || isNaN(duration) || duration < 1) {
        console.warn("Video.js metadata failed — falling back to ReactPlayer.");
        cleanupAndFallback();
      }
    }, 6000);

    player.on("timeupdate", () => {
      const currentTime = player.currentTime();
      if (currentTime - throttleRef.current > 15) {
        throttleRef.current = currentTime;
        updateProgress(movieId, Math.floor(currentTime));
      }
    });

    player.on("play", () => {
      if (!hasTrackedPlayRef.current) {
        ReactGA.event({ category: "Video", action: "Play", label: movieTitle });
        hasTrackedPlayRef.current = true;
      }
    });

    player.on("pause", () => {
      throttleRef.current = 0;
    });

    player.on("ended", () => {
      updateProgress(movieId, 0);
    });

    player.on("error", (e) => {
      console.error("Video.js error:", e);
      cleanupAndFallback();
    });

    const handleKeyDown = (e) => {
      if (!playerRef.current) return;

      if (e.code === "Space") {
        e.preventDefault();
        playerRef.current.paused() ? playerRef.current.play() : playerRef.current.pause();
      }

      if (e.key === "f" || e.code === "KeyF") {
        e.preventDefault();
        playerRef.current.requestFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      mountedRef.current = false;
      clearTimeout(fallbackTimeoutRef.current);
      try {
        if (player && !player.isDisposed?.()) {
          player.pause();
          player.dispose();
        }
      } catch (err) {
        console.warn("Dispose error:", err);
      }
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [url, movieId, useFallback, movieTitle]);

  useEffect(() => {
    const handleKeyDownFallback = (e) => {
      if (!reactPlayerRef.current) return;

      if (e.code === "Space") {
        e.preventDefault();
        setReactPlaying((prev) => !prev);
      }

      if (e.key === "f" || e.code === "KeyF") {
        e.preventDefault();
        document.fullscreenElement
          ? document.exitFullscreen()
          : reactPlayerRef.current.wrapper.requestFullscreen();
      }
    };

    if (useFallback) {
      document.addEventListener("keydown", handleKeyDownFallback);
    }

    return () => {
      if (useFallback) {
        document.removeEventListener("keydown", handleKeyDownFallback);
      }
    };
  }, [useFallback]);

  function cleanupAndFallback() {
    try {
      if (playerRef.current && !playerRef.current.isDisposed?.()) {
        playerRef.current.pause();
        playerRef.current.dispose();
      }
    } catch (err) {
      console.warn("Failed to dispose player:", err);
    }
    toast.warn("Video failed to load properly. Try refreshing the page.");
    if (mountedRef.current) setUseFallback(true);
  }

  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return (
      <div className="movie-wrapper">
        <p className="error-message" style={{ color: "red", padding: "1rem" }}>
          No video available for this movie.
        </p>
      </div>
    );
  }

  if (useFallback) {
    return (
      <div className="movie-wrapper" style={{ position: "relative", overflow: "hidden" }}>
        <ReactPlayer
          ref={reactPlayerRef}
          url={url}
          playing={reactPlaying}
          controls
          width="100%"
          height="100%"
          config={{
            file: {
              attributes: {
                controlsList: "nodownload",
                preload: "metadata",
              },
            },
          }}
          onReady={() => {
            const params = new URLSearchParams(window.location.search);
            const startParam = parseFloat(params.get("start"));
            const resumeTime = !isNaN(startParam) ? startParam : (progress[movieId] || 0);

            if (!seekDoneRef.current && resumeTime > 2) {
              let retries = 0;
              const trySeek = () => {
                if (!reactPlayerRef.current) return;

                reactPlayerRef.current.seekTo(resumeTime, "seconds");

                setTimeout(() => {
                  const el = reactPlayerRef.current.getInternalPlayer();
                  const currentTime = el?.currentTime?.() || 0;

                  if (Math.abs(currentTime - resumeTime) > 2 && retries < 5) {
                    retries += 1;
                    trySeek();
                  } else {
                    seekDoneRef.current = true;
                    setReactPlaying(true);
                  }
                }, 1000);
              };

              trySeek();
            }
          }}

          onProgress={({ playedSeconds }) => {
            if (playedSeconds - throttleRef.current > 15) {
              throttleRef.current = playedSeconds;
              updateProgress(movieId, Math.floor(playedSeconds));
            }
          }}
          onStart={() => {
            if (!hasTrackedPlayRef.current) {
              ReactGA.event({ category: "Video", action: "Play", label: movieTitle });
              hasTrackedPlayRef.current = true;
            }
          }}
          onPause={() => {
            throttleRef.current = 0;
          }}
          onEnded={() => {
            setReactPlaying(false);
            updateProgress(movieId, 0);
          }}
        />
      </div>
    );
  }

  return (
    <div className="movie-wrapper">
      <div className="video-watermark">
        <img src="https://cdn.papertigercinema.com/static/ptc_lgo.png" alt="PTC" />
      </div>
      <div
        data-vjs-player
        style={{ width: "100%" }}
        onClick={() => videoRef.current?.focus()}
      >
        <video
          ref={videoRef}
          className="video-js vjs-skin-city vjs-big-play-centered"
          playsInline
          tabIndex={0}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
