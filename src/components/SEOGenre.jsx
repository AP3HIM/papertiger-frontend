import SEO from "./SEO";

export default function SEOGenre({ genre }) {
  return (
    <SEO
      title={`${genre} Movies | Paper Tiger Cinema`}
      description={`Watch the best public domain ${genre} movies online. Free streaming on Paper Tiger Cinema.`}
      url={`https://papertigercinema.com/genre/${genre}`}
    />
  );
}
