import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // For potential future links

interface PendingChildValidation {
  id: string;
  name: string;
  activityName: string;
  requestedAt: Date;
}

const dummyPendingValidations: PendingChildValidation[] = [
  { 
    id: '1', 
    name: 'Léo Dupont', 
    activityName: 'Cours de Football U10', 
    requestedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000) // 1 day ago
  },
  { 
    id: '2', 
    name: 'Mia Martin', 
    activityName: 'Atelier Poterie Enfants', 
    requestedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000) // 3 days ago
  },
  { 
    id: '3', 
    name: 'Chloé Petit', 
    activityName: 'Stage de Théâtre Ados', 
    requestedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000) // 5 days ago
  },
];

const PendingValidationsPage: React.FC = () => {
  const [pendingChildren, setPendingChildren] = useState<PendingChildValidation[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Simulate loading state

  useEffect(() => {
    // Simulate fetching data
    setTimeout(() => {
      setPendingChildren(dummyPendingValidations);
      setIsLoading(false);
    }, 500); // 0.5 second delay
  }, []);

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date);
  };

  // Placeholder actions
  const handleValidate = (id: string) => alert(`Validation pour l'ID ${id} cliquée (fonctionnalité à implémenter).`);
  const handleRefuse = (id: string) => alert(`Refus pour l'ID ${id} cliqué (fonctionnalité à implémenter).`);
  const handleContactClub = (id: string) => alert(`Contacter l'organisme pour l'ID ${id} cliqué (fonctionnalité à implémenter).`);

  // Styles
  const pageContainerStyle: React.CSSProperties = {
    maxWidth: '800px',
    margin: '2rem auto',
    padding: 'var(--global-padding, 16px)',
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  const titleStyle: React.CSSProperties = {
    color: 'var(--color-blue-primary, #0055A4)',
    marginBottom: '1rem',
    textAlign: 'center',
  };
  
  const introTextStyle: React.CSSProperties = {
    marginBottom: '2rem',
    textAlign: 'center',
    fontSize: '1rem',
    color: 'var(--color-text-secondary, #555)',
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-background-card, #FFFFFF)',
    borderRadius: 'var(--card-border-radius, 8px)',
    boxShadow: '0 2px 8px var(--color-shadow, rgba(0,0,0,0.08))',
    padding: 'var(--global-padding, 16px)',
    marginBottom: '1rem',
    borderLeft: '4px solid var(--color-orange-primary, #FF6F61)', // Accent color
  };

  const itemHeaderStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-text-primary, #333)',
    marginBottom: '0.5rem',
  };
  
  const itemDetailStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    color: 'var(--color-text-secondary, #555)',
    marginBottom: '0.25rem',
  };
  
  const actionsContainerStyle: React.CSSProperties = {
    marginTop: '1rem',
    display: 'flex',
    flexWrap: 'wrap', // Allow buttons to wrap on smaller screens
    gap: '10px',
  };

  const buttonBaseStyle: React.CSSProperties = { /* Inherited from global or define here */
    padding: '8px 12px',
    fontSize: '0.85rem',
    borderRadius: 'var(--button-border-radius, 6px)',
    cursor: 'pointer',
    border: 'none',
    fontWeight: 'var(--font-weight-semibold, 600)',
  };


  if (isLoading) {
    return <div style={pageContainerStyle}><p>Chargement des validations en attente...</p></div>;
  }

  return (
    <div style={pageContainerStyle}>
      <h1 style={titleStyle}>Validations en Attente</h1>
      <p style={introTextStyle}>
        Voici les inscriptions aux activités pour lesquelles votre validation est requise.
      </p>

      {pendingChildren.length === 0 ? (
        <p style={{textAlign: 'center'}}>Aucune validation en attente pour le moment.</p>
      ) : (
        <div>
          {pendingChildren.map(child => (
            <div key={child.id} style={cardStyle}>
              <h3 style={itemHeaderStyle}>{child.name}</h3>
              <p style={itemDetailStyle}><strong>Activité:</strong> {child.activityName}</p>
              <p style={itemDetailStyle}><strong>Demandé le:</strong> {formatDate(child.requestedAt)}</p>
              <div style={actionsContainerStyle}>
                <button 
                  onClick={() => handleValidate(child.id)}
                  style={{...buttonBaseStyle, backgroundColor: 'var(--color-success, #2ECC71)', color: 'white'}}
                  className="primary-action" // For potential specific global style
                >
                  Valider l'inscription
                </button>
                <button 
                  onClick={() => handleRefuse(child.id)}
                  style={{...buttonBaseStyle, backgroundColor: 'var(--color-error, #E74C3C)', color: 'white'}}
                  className="danger-action"
                >
                  Refuser
                </button>
                <button 
                  onClick={() => handleContactClub(child.id)}
                  style={{...buttonBaseStyle, backgroundColor: 'var(--color-progressbar-bg, #CCCCCC)', color: 'var(--color-text-primary, #333)'}}
                  className="secondary-action"
                >
                  Contacter l'organisme
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingValidationsPage;