import React from 'react';

// Placeholder Icons for Social Buttons
const FacebookIconSVG: React.FC<{ color?: string }> = ({ color = "#FFFFFF" }) => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill={color} style={{ marginRight: '8px' }}><path d="M12,2C6.477,2,2,6.477,2,12c0,4.991,3.656,9.128,8.438,9.879V14.89H8.007v-2.905h2.43V9.949c0-2.421,1.479-3.74,3.646-3.74c1.04,0,1.933,0.078,2.193,0.112v2.603h-1.54c-1.175,0-1.402,0.558-1.402,1.377v1.811h2.889l-0.375,2.905h-2.514v7.008C18.344,21.128,22,16.991,22,12C22,6.477,17.523,2,12,2Z"></path></svg>
);
const GoogleIconSVG: React.FC<{ color?: string }> = ({ color = "var(--color-text-primary, #333)" }) => ( // Google uses multicolor, often represented by G on white
  <svg viewBox="0 0 24 24" width="20" height="20" fill={color} style={{ marginRight: '8px' }}><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.69,5.36 16.95,6.45L19.31,4.09C17.43,2.36 14.91,1.09 12.19,1.09C6.55,1.09 2,5.91 2,12C2,18.09 6.55,22.91 12.19,22.91C17.64,22.91 22,18.34 22,12.36C22,11.77 21.71,11.36 21.35,11.1Z" fill="#DB4437"></path><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.03,4.73 15.69,5.36 16.95,6.45L19.31,4.09C17.43,2.36 14.91,1.09 12.19,1.09C6.55,1.09 2,5.91 2,12C2,18.09 6.55,22.91 12.19,22.91C17.64,22.91 22,18.34 22,12.36C22,11.77 21.71,11.36 21.35,11.1Z" fillOpacity="0" strokeWidth="3" stroke="var(--color-text-primary, #333)"></path></svg> // A 'G' might be better
);


interface OnboardingScreen4Props {
  onComplete: () => void;
  onNavigate: (path: string) => void;
  // onPrevious is handled by DetailedOnboardingFlow's main navigation if that's desired
}

const OnboardingScreen4: React.FC<OnboardingScreen4Props> = ({ onComplete, onNavigate }) => {
  const screenStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--color-background-card, #FFFFFF)', // Spec: #FFFFFF background
    fontFamily: 'var(--font-primary, Montserrat)',
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
  };

  const illustrationZoneStyle: React.CSSProperties = {
    flexBasis: '50%',
    minHeight: '200px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'var(--color-text-secondary, #555)',
    fontSize: '1rem',
    padding: '20px',
  };

  const choiceZoneStyle: React.CSSProperties = {
    flexBasis: '50%',
    padding: '24px', // Spec: Padding 24px
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    gap: '16px', // Spec: gap 16px
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 'var(--font-weight-semibold, 600)',
    fontSize: '20px', // Spec: 20px
    color: 'var(--color-text-primary, #333333)',
    margin: 0,
  };

  const subtitleStyle: React.CSSProperties = {
    fontWeight: 'var(--font-weight-regular, 400)',
    fontSize: '14px', // Spec: 14px
    color: 'var(--color-text-secondary, #555555)',
    lineHeight: 1.5,
    maxWidth: '300px', // Ensure text wraps nicely
    margin: '0 0 8px 0', // Small margin before buttons
  };

  const buttonBaseStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    borderRadius: 'var(--button-border-radius, 8px)',
    fontFamily: 'var(--font-primary, Montserrat)',
    fontWeight: 'var(--font-weight-bold, 700)',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease, opacity 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const emailButtonStyle: React.CSSProperties = {
    ...buttonBaseStyle,
    backgroundColor: 'var(--color-blue-primary, #0055A4)',
    color: 'var(--color-text-light, #FFFFFF)',
  };
  
  const socialButtonContainerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center', // Center the buttons
    gap: '16px', // Space between social buttons
    width: '100%',
    marginTop: '8px', // Space above social buttons
  };

  const socialButtonStyleBase: React.CSSProperties = {
    ...buttonBaseStyle,
    width: '48px', // Spec: 48x48px
    height: '48px',
    borderRadius: '24px', // Spec: circular (half of height/width)
    padding: 0, // Remove padding to let icon center
  };
  
  const facebookButtonStyle: React.CSSProperties = {
    ...socialButtonStyleBase,
    backgroundColor: '#1877F2',
  };
  
  const googleButtonStyle: React.CSSProperties = {
    ...socialButtonStyleBase,
    backgroundColor: 'var(--color-background-card, #FFFFFF)',
    border: '1px solid var(--color-border-soft, #DDDDDD)',
    color: 'var(--color-text-primary, #333333)', // For text placeholder "G"
  };

  const laterLinkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-primary, Montserrat)',
    fontWeight: 'var(--font-weight-regular, 400)',
    fontSize: '14px', // Spec: 14px
    color: 'var(--color-text-secondary, #555555)', // Spec: #555555
    marginTop: '16px', // Spec: Margin-top 16px
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textDecoration: 'underline',
  };
  
  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    const backendRoot = import.meta.env.VITE_API_BASE_URL ? 
                         import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 
                         'http://localhost:3001';
    window.location.href = `${backendRoot}/api/auth/${provider}`;
    onComplete(); // Assume social login click means they are "done" with onboarding for now
  };


  return (
    <div style={screenStyle}>
      <div style={illustrationZoneStyle}>
        <span>Illustration: Email & Social Icons</span>
        {/* Placeholder for actual icons: e.g., an envelope, Google logo, Facebook logo */}
      </div>

      <div style={choiceZoneStyle}>
        <h2 id="onboarding-title" style={titleStyle}>Rejoignez InKlusif</h2>
        <p style={subtitleStyle}>
          Inscrivez-vous maintenant ou plus tard pour profiter de toutes nos fonctionnalités.
        </p>
        
        <button onClick={() => onNavigate('/register')} style={emailButtonStyle}>
          S'inscrire par e-mail
        </button>

        <div style={socialButtonContainerStyle}>
          <button onClick={() => handleSocialLogin('google')} style={googleButtonStyle} aria-label="S'inscrire avec Google">
            <GoogleIconSVG /> {/* Or text "G" */}
          </button>
          <button onClick={() => handleSocialLogin('facebook')} style={facebookButtonStyle} aria-label="S'inscrire avec Facebook">
            <FacebookIconSVG /> {/* Or text "FB" */}
          </button>
          {/* Instagram omitted as not in backend */}
        </div>

        <button onClick={onComplete} style={laterLinkStyle}>
          Plus tard
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen4;
