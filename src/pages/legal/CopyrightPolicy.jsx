import "../../css/LegalPage.css";
import SEOStatic from "../../components/SEOStatic";


export default function CopyrightPolicy() {
  return (
    <>
      <SEOStatic
        title="Paper Tiger Cinema's Copyright Policy"
        description="Learn about Paper Tiger Cinema's mission to preserve and share public domain films, free and accessible to all."
        path="/copyright"
      />
      <div className="legal-page">
        <h1>Copyright Policy</h1>
        <p>All movies shown on Paper Tiger Cinema are believed to be in the public domain. If you believe content was posted in error, please contact us at <a href="mailto:noreply@papertigercinema.com">noreply@papertigercinema.com</a> and we will promptly review and remove any content as necessary.</p>
      </div>
    </>
  );
}
