import React, { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import ReactPlayer from "react-player";
import { toast } from "react-toastify";
import ReactGA from "react-ga4";
import { useMovieContext } from "../context/MovieContext";

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

    if (!videoRef.current || !url || useFallback) return;

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

    player.ready(() => {
      try {
        player.src({ type: "video/mp4", src: url });
      } catch (err) {
        console.error("Video load error:", err);
        cleanupAndFallback();
      }
    });

    player.on("loadedmetadata", () => {
      clearTimeout(fallbackTimeoutRef.current);
      
      const params = new URLSearchParams(window.location.search);
      const startParam = parseFloat(params.get("start"));
      const resumeTime = !isNaN(startParam) ? startParam : (progress[movieId] || 0);

      if (!seekDoneRef.current && resumeTime > 2) {
        console.log(` Seeking to ${resumeTime} seconds from ?start param or progress`);
        player.currentTime(resumeTime);
        seekDoneRef.current = true;
      }
    });



    // Ensure the video element gets focus so keypresses work
    setTimeout(() => {
      const videoEl = videoRef.current;
      if (videoEl) {
        videoEl.setAttribute("tabindex", "0");  // Ensure focusable
        videoEl.focus();
        videoEl.click();
        console.log("Focused and clicked video element");
      }
    }, 1500);


    fallbackTimeoutRef.current = setTimeout(() => {
      if (!player.duration() || isNaN(player.duration())) {
        console.warn("Video.js did not load metadata — falling back");
        cleanupAndFallback();
      }
    }, 8000);

    player.on("loadedmetadata", () => {
      clearTimeout(fallbackTimeoutRef.current);
      const start = progress[movieId] || 0;
      if (!seekDoneRef.current && start > 2) {
        player.currentTime(start);
        seekDoneRef.current = true;
      }
    });

    player.on("timeupdate", () => {
      const currentTime = player.currentTime();
      if (currentTime - throttleRef.current > 15) {
        throttleRef.current = currentTime;
        updateProgress(movieId, Math.floor(currentTime));
      }
    });

    player.on("play", () => {
      if (!hasTrackedPlayRef.current) {
        ReactGA.event({
          category: "Video",
          action: "Play",
          label: movieTitle,
        });
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
        if (playerRef.current.paused()) {
          playerRef.current.play();
        } else {
          playerRef.current.pause();
        }
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
      if (player && !player.isDisposed()) {
        player.pause();
        player.dispose();
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
        const container = document.fullscreenElement
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
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.pause();
        playerRef.current.dispose();
      }
    } catch (err) {
      console.warn("Failed to dispose player:", err);
    }
    toast.warn("Video failed to load properly. Try refreshing the page.");
    if (mountedRef.current) setUseFallback(true);
  }

  if (useFallback) {
    return (
      <div className="movie-wrapper" style={{ backgroundColor: "#000", padding: "0.5rem" }}>
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
            if (seekDoneRef.current) return;
            const start = progress[movieId] || 0;
            if (start > 2) reactPlayerRef.current.seekTo(start, "seconds");
            seekDoneRef.current = true;
            setTimeout(() => setReactPlaying(true), 0);
          }}
          onProgress={({ playedSeconds }) => {
            if (playedSeconds - throttleRef.current > 15) {
              throttleRef.current = playedSeconds;
              updateProgress(movieId, Math.floor(playedSeconds));
            }
          }}
          onStart={() => {
            if (!hasTrackedPlayRef.current) {
              ReactGA.event({
                category: "Video",
                action: "Play",
                label: movieTitle,
              });
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
  // 🔍 FINAL TEST TIP — keypress logger to confirm player is focused
  useEffect(() => {
    const logKey = (e) => {
      console.log(" Key pressed:", e.code);
    };
    window.addEventListener("keydown", logKey);
    return () => window.removeEventListener("keydown", logKey);
  }, []);

  

  return (
    <div className="movie-wrapper" style={{ backgroundColor: "#000", padding: "0.5rem", position: "relative" }}>
      <div className="video-watermark">
        <img src="https://cdn.papertigercinema.com/static/ptc_lgo.png" alt="PTC" />
      </div>
      <div 
        data-vjs-player
        style={{ width: "100%" }}
        onClick={() => {
          if (videoRef.current) videoRef.current.focus();
        }}
      >
        <video
          ref={videoRef}
          className="video-js vjs-skin-city vjs-big-play-centered"
          playsInline
          tabIndex={0}  // Add this so it can be focused programmatically
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  );
}
