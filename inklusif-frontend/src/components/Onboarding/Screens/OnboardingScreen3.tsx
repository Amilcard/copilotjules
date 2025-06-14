import React from 'react';
import AidCard from '../Common/AidCard'; // Import the AidCard component

// Placeholder Illustration for Screen 3
const CharacterWithCheckIcon: React.FC<{ style?: React.CSSProperties }> = ({ style }) => (
  <div style={{ 
    width: '150px', height: '150px', 
    borderRadius: '50%', 
    backgroundColor: 'var(--color-orange-light, #FFEADD)', 
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center', 
    textAlign: 'center', color: 'var(--color-orange-primary, #FF6F61)',
    fontSize: '0.9rem', padding: '10px',
    ...style 
  }}>
    <span style={{fontSize: '3rem'}}>💰</span> {/* Simplified check/coin */}
    <p style={{marginTop: '5px'}}>Personnage recevant un chèque ou pièce</p>
  </div>
);


interface OnboardingScreen3Props {
  onNext: () => void;
  // onSkip is handled by the global skip button in DetailedOnboardingFlow
}

const OnboardingScreen3: React.FC<OnboardingScreen3Props> = ({ onNext }) => {
  const screenStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--color-background-page, #F5F5F5)',
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  const illustrationZoneStyle: React.CSSProperties = {
    flexBasis: '55%', // Approx 55% height
    minHeight: '250px', 
    width: '100%',
    backgroundColor: 'var(--color-background-page, #F5F5F5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  };

  const infoZoneStyle: React.CSSProperties = {
    flexBasis: '45%', 
    padding: '24px', 
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start', // Align content to top, button will be pushed down
    backgroundColor: 'var(--color-background-card, #FFFFFF)', 
    borderTopLeftRadius: '20px', // Curve the top of the white area
    borderTopRightRadius: '20px',
    overflowY: 'auto', // Allow scrolling for aid cards if content overflows
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: 'var(--font-weight-semibold, 600)',
    fontSize: '22px', 
    color: 'var(--color-text-primary, #333333)',
    marginBottom: '8px', 
    textAlign: 'center',
  };

  const subtitleStyle: React.CSSProperties = {
    fontWeight: 'var(--font-weight-regular, 400)',
    fontSize: '14px', 
    lineHeight: '20px',
    color: 'var(--color-text-secondary, #555555)',
    textAlign: 'center',
    marginBottom: '20px', 
  };
  
  const ctaButtonStyle: React.CSSProperties = {
    width: '100%',
    height: '48px',
    borderRadius: 'var(--button-border-radius, 8px)',
    backgroundColor: 'var(--color-blue-primary, #0055A4)', // Spec: bg #0055A4
    color: 'var(--color-text-light, #FFFFFF)',
    fontFamily: 'var(--font-primary, Montserrat)',
    fontWeight: 'var(--font-weight-bold, 700)',
    fontSize: '16px',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease, transform 0.1s ease',
    marginTop: 'auto', // Push button to the bottom of its container
    marginBottom: '10px', // Ensure some space at the very bottom
  };

  const aidCardsContainerStyle: React.CSSProperties = {
      flexGrow: 1, // Allow this area to take space before button
      overflowY: 'auto',
      paddingRight: '5px', // for scrollbar
      marginRight: '-5px', // to compensate scrollbar width for centering
  };

  return (
    <div style={screenStyle}>
      <div style={illustrationZoneStyle}>
        <CharacterWithCheckIcon />
      </div>

      <div style={infoZoneStyle}>
        <h2 style={titleStyle}>Quelles aides pour quelles activités ?</h2>
        <p style={subtitleStyle}>
          Découvrez les dispositifs existants pour vous accompagner.
        </p>
        
        <div style={aidCardsContainerStyle}>
            <AidCard 
              title="Pass'Sport" 
              description="Une aide de 50 euros pour l'inscription dans un club sportif." 
            />
            <AidCard 
              title="Pass'Culture" 
              description="Un crédit pour des activités culturelles (cinéma, livres, concerts...)." 
            />
            <AidCard 
              title="Aide Locale (Exemple)" 
              description="Votre mairie ou région peut proposer des aides spécifiques." 
            />
        </div>

        <button 
          onClick={onNext} 
          style={ctaButtonStyle}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-blue-primary-darker, #004080)')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-blue-primary, #0055A4)')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Afficher mes aides
        </button>
      </div>
    </div>
  );
};

export default OnboardingScreen3;
