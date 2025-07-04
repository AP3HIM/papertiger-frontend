import SEO from "./SEO";

export default function SEOStatic({ title, path, description }) {
  return (
    <SEO
      title={`${title} | Paper Tiger Cinema`}
      description={
        description || `Read our ${title.toLowerCase()} at Paper Tiger Cinema.`
      }
      url={`https://papertigercinema.com${path}`}
    />
  );
}

