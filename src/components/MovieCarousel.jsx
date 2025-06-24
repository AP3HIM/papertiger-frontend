// src/components/MovieCarousel.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/navigation";
import { FreeMode, Navigation } from "swiper/modules";
import MovieCard from "./MovieCard";
import "../css/MovieCarousel.css";

export default function MovieCarousel({
  title,
  movies = [],
  cardComponent: Card = MovieCard, // default
}) {
  return (
    <div className="movie-carousel-container">  
      {title && <h2 className="movie-carousel-title">{title}</h2>}

      <Swiper
        breakpoints={{
          0: { slidesPerView: 1.1 },       // <480px
          480: { slidesPerView: 1.5 },     // small phones
        }}
        slidesPerView={6}
        spaceBetween={4}
        navigation
        modules={[FreeMode, Navigation]}
        className="movie-swiper"
      >
        {movies.map((movie) => (
          <SwiperSlide key={movie.id} className="movie-carousel-slide">
            <Card movie={movie} />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
