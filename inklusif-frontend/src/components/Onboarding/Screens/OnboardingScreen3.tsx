import React from 'react';
import InfoCard from '../../Common/InfoCard';

const OnboardingScreen3: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Aides financières disponibles</h2>
      <div style={{ display: 'grid', gap: '16px' }}>
        <InfoCard 
          title="Aide CAF" 
          value="500€"
          description="Pour les activités sportives et culturelles"
        />
        <InfoCard 
          title="Pass'Sport" 
          value="50€"
          description="Allocation de rentrée sportive"
        />
        <InfoCard 
          title="Pass Culture" 
          value="300€"
          description="Pour les jeunes de 18 ans"
        />
      </div>
    </div>
  );
};

export default OnboardingScreen3;
