// src/components/MoviePlayer.jsx
import { useEffect, useRef, useState } from "react";
import videojs from "video.js";
import "video.js/dist/video-js.css";
import ReactPlayer from "react-player";
import { useMovieContext } from "../contexts/MovieContext";
import "../css/MoviePlayer.css";
import "videojs-skin-city";


export default function MoviePlayer({ url, movieId, height = "500px" }) {
  const videoRef = useRef(null);
  const playerRef = useRef(null);
  const reactPlayerRef = useRef(null);
  const seekDoneRef = useRef(false);
  const throttleRef = useRef(0);
  const fallbackTimeoutRef = useRef(null);
  const mountedRef = useRef(true);

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

    try {
      player.src({ type: "video/mp4", src: url });
    } catch (err) {
      console.error("Video load error:", err);
      cleanupAndFallback();
      return;
    }

    fallbackTimeoutRef.current = setTimeout(() => {
      if (!player.duration() || isNaN(player.duration())) {
        console.warn("Video.js did not load metadata — falling back");
        cleanupAndFallback();
      }
    }, 4000);

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

    return () => {
      mountedRef.current = false;
      clearTimeout(fallbackTimeoutRef.current);
      if (player && !player.isDisposed()) {
        player.pause();
        player.dispose();
      }
    };
  }, [url, movieId, useFallback]);

  function cleanupAndFallback() {
    try {
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.pause();
        playerRef.current.dispose();
      }
    } catch (err) {
      console.warn("Failed to dispose player:", err);
    }
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
          height={height}
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
    <div className="movie-wrapper" style={{ backgroundColor: "#000", padding: "0.5rem", position: "relative" }}>
      <div className="video-watermark">
        <img src="https://cdn.papertigercinema.com/static/ptc_lgo.png" alt="PTC" />
      </div>
      <div data-vjs-player style={{ maxWidth: "100%", height }}>
        <video
          ref={videoRef}
          className="video-js vjs-skin-city vjs-big-play-centered"
          playsInline
          style={{ width: "100%", height }}
        />
      </div>
    </div>
  );
}
