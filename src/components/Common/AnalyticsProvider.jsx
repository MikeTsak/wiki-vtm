import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';
import './AnalyticsProvider.css';

const TRACKING_ID = "G-GWY4YMQYXC";

const AnalyticsProvider = ({ children }) => {
  const [consentGiven, setConsentGiven] = useState(() => {
    return localStorage.getItem('cookieConsent') === 'accepted';
  });
  const [showBanner, setShowBanner] = useState(() => {
    return !localStorage.getItem('cookieConsent');
  });

  const location = useLocation();

  // Initialize GA and track pageviews if consent is given
  useEffect(() => {
    if (consentGiven) {
      if (!window.gaInitialized) {
        ReactGA.initialize(TRACKING_ID);
        window.gaInitialized = true;
      }
      ReactGA.send({ hitType: "pageview", page: location.pathname + location.search });
    }
  }, [consentGiven, location]);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'accepted');
    setConsentGiven(true);
    setShowBanner(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookieConsent', 'declined');
    setConsentGiven(false);
    setShowBanner(false);
  };

  return (
    <>
      {children}
      {showBanner && (
        <div className="cookie-banner">
          <div className="cookie-content">
            <p>
              We use cookies to analyze site traffic and enhance your experience. 
              By clicking "Accept", you consent to our use of Google Analytics cookies.
            </p>
          </div>
          <div className="cookie-actions">
            <button className="btn-outline" onClick={handleDecline}>Decline</button>
            <button className="btn-primary" onClick={handleAccept}>Accept</button>
          </div>
        </div>
      )}
    </>
  );
};

export default AnalyticsProvider;
