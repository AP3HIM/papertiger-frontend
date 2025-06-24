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
        spaceBetween={4}
        navigation
        modules={[FreeMode, Navigation]}
        className="movie-swiper"
        breakpoints={{
          0: { slidesPerView: 1.2 },      // tiny phones
          480: { slidesPerView: 1.5 },    // small phones
          640: { slidesPerView: 2.5 },    // tablets
          768: { slidesPerView: 3.5 },    // small laptops
          1024: { slidesPerView: 6 },     // real desktops (exactly like before)
        }}
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
