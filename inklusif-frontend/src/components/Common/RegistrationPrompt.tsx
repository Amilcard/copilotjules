import React from 'react';
import { Link } from 'react-router-dom';

// Refined Info Icon SVG as per Screen 9 specs (color #F39C12, size 20px)
const InfoIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ marginRight: '12px', flexShrink: 0 }}>
    <path fillRule="evenodd" clipRule="evenodd" d="M9.99935 0.833313C4.93651 0.833313 0.832672 4.93715 0.832672 10C0.832672 15.0628 4.93651 19.1666 9.99935 19.1666C15.0622 19.1666 19.166 15.0628 19.166 10C19.166 4.93715 15.0622 0.833313 9.99935 0.833313ZM8.74935 6.25C8.74935 5.83579 9.08514 5.5 9.49935 5.5H10.4993C10.9136 5.5 11.2493 5.83579 11.2493 6.25V6.66665C11.2493 7.08086 10.9136 7.41665 10.4993 7.41665H9.49935C9.08514 7.41665 8.74935 7.08086 8.74935 6.66665V6.25ZM8.74935 9.16665C8.74935 8.75244 9.08514 8.41665 9.49935 8.41665H10.4993C10.9136 8.41665 11.2493 8.75244 11.2493 9.16665V13.3333C11.2493 13.7475 10.9136 14.0833 10.4993 14.0833H9.49935C9.08514 14.0833 8.74935 13.7475 8.74935 13.3333V9.16665Z" fill="#F39C12"/>
  </svg>
);

interface RegistrationPromptProps {
  isVisible: boolean;
  onDismiss?: () => void;
}

const RegistrationPrompt: React.FC<RegistrationPromptProps> = ({ isVisible, onDismiss }) => {
  if (!isVisible) {
    return null;
  }

  // Styles based on Screen 9 "Bannières rappel"
  const promptStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-banner-background, #FFF9E6)', 
    border: '1px solid var(--color-banner-border, #FCEBC4)', // Softer border derived from bg/icon
    borderRadius: 'var(--button-border-radius, 8px)', // Consistent border radius
    padding: '16px 20px', // Ample padding
    margin: '32px 0', 
    display: 'flex',
    flexDirection: 'row', // Default, ensure items are in a row
    alignItems: 'flex-start', // Align items to the top, let text wrap
    justifyContent: 'space-between',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    fontFamily: 'var(--font-primary, Montserrat)',
    width: '100%', // Ensure it takes full width of its container
    boxSizing: 'border-box',
  };

  const contentWrapperStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start', // Align icon with the start of the text
    flexGrow: 1, // Allow text content to take available space
  };

  const messageStyle: React.CSSProperties = {
    fontSize: '14px', 
    color: 'var(--color-text-primary, #333333)', 
    lineHeight: 1.5,
    margin: 0, // Remove default paragraph margin
  };

  const buttonContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column', // Stack buttons vertically on small screens if needed, or keep row
    alignItems: 'flex-end', // Align to the right
    gap: '10px',
    marginLeft: '20px', // Space between text and buttons
    flexShrink: 0,
  };
  
  const buttonStyleBase: React.CSSProperties = {
    padding: '6px 12px', // Slightly smaller padding for buttons in banner
    fontSize: '13px', // Slightly smaller font for buttons in banner
    borderRadius: 'var(--button-border-radius, 6px)', // Slightly smaller radius
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
    border: '1px solid transparent',
    fontWeight: 'var(--font-weight-semibold, 600)',
    whiteSpace: 'nowrap', // Prevent button text from wrapping
  };

  const createAccountButtonStyle: React.CSSProperties = {
    ...buttonStyleBase,
    backgroundColor: 'var(--color-orange-primary, #FF6F61)',
    color: 'var(--color-text-light, #FFFFFF)',
  };

  const loginButtonStyle: React.CSSProperties = {
    ...buttonStyleBase,
    backgroundColor: 'transparent',
    color: 'var(--color-blue-primary, #0055A4)',
    borderColor: 'var(--color-blue-primary, #0055A4)',
  };
  
  const dismissButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'var(--color-text-secondary, #777)',
    fontSize: '18px', // Slightly smaller dismiss icon
    cursor: 'pointer',
    padding: '0', // Remove padding for a tighter look
    lineHeight: 1,
    alignSelf: 'flex-start', // Align with top of button group
    marginLeft: '8px', // If buttons are in a row and dismiss is last
  };

  return (
    <div style={promptStyle} role="alert">
      <div style={contentWrapperStyle}>
        <InfoIcon />
        <p style={messageStyle}>
          Saviez-vous que vous pouvez accéder aux aides et recevoir des rappels personnalisés en complétant votre inscription ?
        </p>
      </div>
      
      {/* Group buttons and dismiss icon for better layout control */}
      <div style={{ display: 'flex', alignItems: 'flex-start', flexShrink: 0 }}>
        <div style={buttonContainerStyle}>
          <Link to="/register" style={createAccountButtonStyle} className="button-link">
            Créer un compte
          </Link>
          <Link to="/login" style={loginButtonStyle} className="button-link">
            Se connecter
          </Link>
        </div>
        {onDismiss && (
          <button onClick={onDismiss} style={dismissButtonStyle} title="Fermer" aria-label="Fermer la notification">
            &times;
          </button>
        )}
      </div>
    </div>
  );
};

export default RegistrationPrompt;