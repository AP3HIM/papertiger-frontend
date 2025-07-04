import "../../css/LegalPage.css";
import SEOStatic from "../../components/SEOStatic";


export default function About() {
  return (
    <>
      <SEOStatic
        title="About Paper Tiger Cinema"
        description="Learn about Paper Tiger Cinema's mission to preserve and share public domain films, free and accessible to all."
        path="/about"
      />
      <div className="legal-page">
        <h1>About Paper Tiger Cinema</h1>
        <p>Paper Tiger Cinema is a curated platform dedicated to public domain films. We provide free access to classic movies legally sourced from trusted archives.</p>
        <p>This site is run by movie lovers for movie lovers—no subscriptions, no paywalls, just cinema.</p>
      </div>
    </>
  );
}
