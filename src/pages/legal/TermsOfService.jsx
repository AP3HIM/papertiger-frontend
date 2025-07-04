import "../../css/LegalPage.css";
import SEOStatic from "../../components/SEOStatic";


export default function TermsOfService() {
  return (
    <>
      <SEOStatic
        title="Terms of Service | Paper Tiger Cinema"
        description="Read the terms and conditions for using Paper Tiger Cinema's website and services."
        path="/terms"
      />

      <div className="legal-page">
        <h1>Terms of Service</h1>
        <p>By using Paper Tiger Cinema, you agree to access and view only public domain content legally provided through our platform. Misuse, redistribution of content, or unlawful activity may result in account suspension or removal.</p>
      </div>
    </>
  );
}
