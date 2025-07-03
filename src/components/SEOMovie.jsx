import SEO from "./SEO";

export default function SEOMovie({ movie }) {
  const image = movie.thumbnail_url || "https://cdn.papertigercinema.com/static/ptc_lgo.png";

  return (
    <SEO
      title={`${movie.title} (${movie.year}) | Paper Tiger Cinema`}
      description={movie.overview?.slice(0, 160) || "Watch this classic public domain movie free online."}
      url={`https://papertigercinema.com/movies/${movie.slug}`}
      image={image}
    />
  );
}
