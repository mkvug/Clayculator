import { setConsent } from "../analytics.js";

// Cookie notice for the setup page. Accept and Decline carry equal weight.
export default function ConsentBanner({ onChoose }) {
  const choose = (value) => {
    setConsent(value);
    onChoose(value);
  };
  return (
    <div className="consent" role="region" aria-label="Cookie notice">
      <p>
        This setup page can use Google Analytics cookies to count visits and see which features are used. They are
        optional. The calculator embedded on your website does not use them.
      </p>
      <div className="consent-actions">
        <button type="button" className="btn" onClick={() => choose("denied")}>Decline</button>
        <button type="button" className="btn" onClick={() => choose("granted")}>Accept</button>
      </div>
    </div>
  );
}
