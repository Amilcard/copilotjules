import React from 'react';
import InfoCard from '../components/Common/InfoCard';
import MultiStepProgressBar from '../components/Common/MultiStepProgressBar';

const AccueilPage: React.FC = () => (

<div style={{ padding: 24 }}>
    <h1>Bienvenue sur Inklusif</h1>
    <div style={{ margin: '16px 0' }}>
      <MultiStepProgressBar currentStep={2} totalSteps={5} />
    </div>
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginTop: 24,
      }}
    >
      <InfoCard title="Utilisateurs inscrits" value={1234} icon={<span>👥</span>} />
      <InfoCard
        title="Activités disponibles"
        value={56}
        variant="secondary"
        icon={<span>🏃‍♂️</span>}
      />
    </div>
  </div>
);

export default AccueilPage;
