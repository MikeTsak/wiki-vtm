import React from 'react';
import './ErrorModal.css';

const ErrorModal = ({ isOpen, onClose, title = 'An Error Occurred', error }) => {
  if (!isOpen) return null;

  // Extract detailed error information if it's an Axios/Network error
  let errorMessage = 'Unknown error';
  let errorDetails = '';

  if (typeof error === 'string') {
    errorMessage = error;
  } else if (error) {
    errorMessage = error.message || 'Error';
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      errorDetails = `Status: ${error.response.status}
Response Data: ${JSON.stringify(error.response.data, null, 2)}`;
    } else if (error.request) {
      // The request was made but no response was received
      errorDetails = 'No response received from the server. The backend might be offline or blocked by CORS.';
    } else {
      // Something happened in setting up the request that triggered an Error
      errorDetails = error.stack || 'No additional details available.';
    }
  }

  return (
    <div className="error-modal-overlay" onClick={onClose}>
      <div className="error-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="error-modal-header">
          <h2>⚠️ {title}</h2>
          <button className="error-modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="error-modal-body">
          <p className="error-modal-message"><strong>{errorMessage}</strong></p>
          
          {errorDetails && (
            <div className="error-modal-details">
              <p>Diagnostic Details:</p>
              <pre>{errorDetails}</pre>
            </div>
          )}
        </div>
        <div className="error-modal-footer">
          <button className="error-modal-btn" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
