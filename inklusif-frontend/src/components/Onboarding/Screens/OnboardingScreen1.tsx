import React from 'react';

// Placeholder for Logo - In a real app, this would be an actual SVG or Image component
const LogoComponent: React.FC<{ size?: string, style?: React.CSSProperties }> = ({ size = "32px", style }) => (
  <div style={{ 
    width: size, height: size, 
    backgroundColor: 'var(--color-blue-primary, #0055A4)', 
    borderRadius: '4px', 
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: 'var(--color-text-light, #FFFFFF)', fontWeight: 'bold', fontSize: `calc(${size} * 0.6)`,
    ...style 
  }}>
    IK
  </div>
);

interface OnboardingScreen1Props {
  onNext: () => void;
}

const OnboardingScreen1: React.FC<OnboardingScreen1Props> = ({ onNext }) => {
  // Styles are inline for brevity, consider CSS Modules or styled-components for larger projects
  const screenStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%', // Take full height of the modal's screen container
    backgroundColor: 'var(--color-background-page, #F5F5F5)', // Screen 1 main background
    paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)', // Adjust for notch if any
    paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 16px)',
  };

  const logoContainerStyle: React.CSSProperties = {
    position: 'absolute', // Positioned relative to the screenStyle div if it's a containing block
    top: 'calc(env(safe-area-inset-top, 0px) + 16px)', // 16px from actual top edge
    left: '16px',
    zIndex: 1, // Above illustration if it overlaps
  };

  const illustrationZoneStyle: React.CSSProperties = {
    flexBasis: '60%', // Approx 60% height
    minHeight: '300px', // Minimum height for illustration
    width: '100%',
    backgroundColor: '#E0E8F0', // Placeholder background for illustration area
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    color: 'var(--color-text-secondary, #555)',
    fontSize: '1rem',
    overflow: 'hidden', // Ensure illustration does not break layout
  };

  const textZoneStyle: React.CSSProperties = {
    flexBasis: '40%',
    padding: '24px', // Spec: Padding 24px
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center', // Vertically center content in remaining space
    alignItems: 'center', // Horizontally center for text
    textAlign: 'center', // Text alignment
    backgroundColor: 'var(--color-background-card, #FFFFFF)', // White background for text area below illustration
  };

  const titleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-primary, Montserrat)',
    fontWeight: 'var(--font-weight-semibold, 600)', // Semi-Bold
    fontSize: '24px', // Spec: 24px
    lineHeight: '32px', // Spec: 32px
    letterSpacing: '+0.5px', // Spec: +0.5px
    color: 'var(--color-text-primary, #333333)', // Spec: #333333
    margin: 0, // Reset default margin
  };

  const hookStyle: React.CSSProperties = {
    fontFamily: 'var(--font-primary, Montserrat)',
    fontWeight: 'var(--font-weight-regular, 400)', // Regular
    fontSize: '16px', // Spec: 16px
    lineHeight: '24px', // Spec: 24px
    color: 'var(--color-text-primary, #333333)', // Spec: #333333
    marginTop: '8px', // Spec: margin-top 8px
    marginBottom: '24px', // Space before button
  };

  const ctaButtonStyle: React.CSSProperties = {
    width: '100%', // Spec: Full-width
    height: '48px', // Spec: Height 48px
    borderRadius: 'var(--button-border-radius, 8px)', // Spec: Border-radius 8px
    backgroundColor: 'var(--color-blue-primary, #0055A4)', // Spec: Background #0055A4
    color: 'var(--color-text-light, #FFFFFF)', // Spec: Text #FFFFFF
    fontFamily: 'var(--font-primary, Montserrat)',
    fontWeight: 'var(--font-weight-bold, 700)', // Spec: Montserrat Bold
    fontSize: '16px', // Spec: 16px
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    // Focus state should be handled globally or with specific CSS for :focus-visible
  };
  
  // Note: Hover and active styles are better handled with CSS classes or styled-components
  // For inline, you'd need JS event handlers to change styles, which is cumbersome.
  // The global button styles in index.css might provide some base if using className="primary" etc.
  // For now, direct style for simplicity of this step.

  return (
    <div style={screenStyle}>
      {/* Logo - Assuming it's part of each screen for now as per some designs */}
      {/* <div style={logoContainerStyle}>
        <LogoComponent />
      </div> */}
      {/* If Logo is global to the modal, it's better in DetailedOnboardingFlow.tsx */}

      <div style={illustrationZoneStyle}>
        {/* Placeholder for illustration */}
        <span>Illustration: User with Map<br/>(Dominant #0055A4 & #FF6F61)</span>
      </div>

      <div style={textZoneStyle}>
        <h2 id="onboarding-title" style={titleStyle}>Découvrez des activités près de chez vous</h2>
        <p style={hookStyle}>
          Trouvez facilement des loisirs, sports et événements culturels adaptés à toute la famille.
        </p>
        <button 
          onClick={onNext} 
          style={ctaButtonStyle}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-blue-primary-darker, #004080)')} // Simple hover
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-blue-primary, #0055A4)')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Commencer
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen1;
