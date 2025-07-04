import "../../css/LegalPage.css";
import SEOStatic from "../../components/SEOStatic";


export default function PrivacyPolicy() {
  return (
    <>
      <SEOStatic
        title="Privacy | Paper Tiger Cinema"
        description="Read the privacy terms for using Paper Tiger Cinema's website and services."
        path="/privacy"
      />
      <div className="legal-page">
        <h1>Privacy Policy</h1>
        <p>We collect minimal user data (login credentials, favorites, watch progress). We do not sell or share your data. Cookies are used for essential features like login and session storage only.</p>
      </div>
    </>
  );
}
