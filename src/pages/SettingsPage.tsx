import React from 'react';

const SettingsPage: React.FC = () => {
  const pageStyle: React.CSSProperties = {
    padding: 'var(--global-padding, 16px)',
    fontFamily: 'var(--font-primary, Montserrat)',
    textAlign: 'center',
  };
  const titleStyle: React.CSSProperties = {
    color: 'var(--color-blue-primary, #0055A4)',
    marginBottom: '1rem',
  };

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Paramètres</h1>
      <p>Cette section permettra de gérer les paramètres du compte et les préférences de notification.</p>
      <p>Contenu à venir.</p>
    </div>
  );
};

export default SettingsPage;

