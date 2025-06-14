import React from 'react';

// Placeholder Icons for Screen 2
const CoinsIcon: React.FC<{ size?: string; color?: string; style?: React.CSSProperties }> = ({ size = "40px", color = "var(--color-orange-primary, #FF6F61)", style }) => (
  <div style={{ width: size, height: size, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
    {/* Simple representation of coins */}
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
      <path d="M16 11V5h-2v contextoInsira aqui o restante do código...6h2V5zm-4 0V5H8v6h2V5zm-2 8v-2H4v2h2v-2zm8 0v-2h-2v2h2v-2zm2-12h-2V3h2v2zm-4 0h-2V3h2v2zM8 5H6V3h2v2zM4 17v-2H2v2h2zm16 0v-2h-2v2h2z"/>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  </div>
);

const BarChartIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ width: '80px', height: '60px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', borderBottom: '2px solid var(--color-border-soft, #E0E0E0)', ...style }}>
    <div style={{ width: '15px', height: '30%', backgroundColor: 'var(--color-border-soft, #E0E0E0)' }}></div>
    <div style={{ width: '15px', height: '60%', backgroundColor: 'var(--color-orange-primary, #FF6F61)' }}></div>
    <div style={{ width: '15px', height: '45%', backgroundColor: 'var(--color-border-soft, #E0E0E0)' }}></div>
  </div>
);


interface OnboardingScreen2Props {
  onNext: () => void;
  onSkip: () => void; // "Plus tard" button
}

const OnboardingScreen2: React.FC<OnboardingScreen2Props> = ({ onNext, onSkip }) => {
  const screenStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--color-background-page, #F5F5F5)',
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  const illustrationZoneStyle: React.CSSProperties = {
    flexBasis: '50%', // Spec: Top 50%
    minHeight: '200px', // Avoid collapsing too much
    width: '100%',
    backgroundColor: 'var(--color-background-page, #F5F5F5)', // Matches overall page background
    display: 'flex',
    flexDirection: 'column', // Stack icons if needed
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    gap: '20px', // Space between icons if stacked
  };

  const infoZoneStyle: React.CSSProperties = {
    flexBasis: '50%', // Spec: Bottom 50%
    padding: '24px', // Spec: Padding 24px
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', 
    alignItems: 'center',
    textAlign: 'center',
    backgroundColor: 'var(--color-background-card, #FFFFFF)', // "Bg carte budget"
    borderTop: '1px solid var(--color-border-soft, #DDDDDD)', // Visual separation
    // borderRadius: '8px', // If this zone is a distinct card
    // boxShadow: '0 -2px 5px rgba(0,0,0,0.05)', // Shadow if distinct card
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 'var(--font-weight-semibold, 600)',
    fontSize: '22px', // Spec: 22px
    lineHeight: '28px', // Spec: 28px
    color: 'var(--color-text-primary, #333333)',
    margin: '0 0 12px 0', // Spec: gap 12px to subtitle
  };

  const subtitleStyle: React.CSSProperties = {
    fontWeight: 'var(--font-weight-regular, 400)',
    fontSize: '14px', // Spec: 14px
    lineHeight: '20px', // Spec: 20px
    color: 'var(--color-text-secondary, #555555)',
    marginBottom: '24px', // Space before button
    maxWidth: '280px', // Ensure text wraps nicely
  };
  
  const ctaButtonStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    borderRadius: 'var(--button-border-radius, 8px)',
    backgroundColor: 'var(--color-orange-primary, #FF6F61)', // Spec: bg #FF6F61
    color: 'var(--color-text-light, #FFFFFF)',
    fontFamily: 'var(--font-primary, Montserrat)',
    fontWeight: 'var(--font-weight-bold, 700)',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
  };

  const skipLinkStyle: React.CSSProperties = {
    fontFamily: 'var(--font-primary, Montserrat)',
    fontWeight: 'var(--font-weight-regular, 400)',
    fontSize: '14px', // Spec: 14px
    color: 'var(--color-blue-primary, #0055A4)', // Spec: #0055A4
    marginTop: '16px', // Spec: margin-top 8px (increased for better spacing)
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    textDecoration: 'underline',
  };

  return (
    <div style={screenStyle}>
      <div style={illustrationZoneStyle}>
        {/* Placeholder for illustration */}
        <CoinsIcon />
        <BarChartIcon />
        <span style={{fontSize: '0.9rem', color: 'var(--color-text-secondary)'}}>Illustration: Budget Graph & Coins</span>
      </div>

      <div style={infoZoneStyle}>
        <h2 style={titleStyle}>Estimez rapidement vos aides financières</h2>
        <p style={subtitleStyle}>
          Découvrez les soutiens disponibles pour alléger le coût des activités.
        </p>
        <button 
          onClick={onNext} 
          style={ctaButtonStyle}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-orange-primary-darker, #E55B50)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-orange-primary, #FF6F61)')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Je calcule mon budget
        </button>
        <button onClick={onSkip} style={skipLinkStyle}>
          Plus tard
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen2;
