import React from 'react';
import { financialAidsData, FinancialAid } from '../../data/financialAids'; // Import static data
import InfoCard from '../../components/Common/InfoCard'; // Import the new InfoCard

// Placeholder icons if needed, or pass them in data
const PassSportIcon: React.FC = () => <span style={{fontSize: '24px'}}>⚽</span>;
const PassCultureIcon: React.FC = () => <span style={{fontSize: '24px'}}>🎭</span>;
const CafIcon: React.FC = () => <span style={{fontSize: '24px'}}>🏢</span>;
const ScolaireIcon: React.FC = () => <span style={{fontSize: '24px'}}>🎓</span>;

const iconMap: { [key: string]: JSX.Element } = {
    "⚽": <PassSportIcon />,
    "🎭": <PassCultureIcon />,
    "🏢": <CafIcon />,
    "🎓": <ScolaireIcon />,
};


const AidesFinancieresPage: React.FC = () => {
  const pageContainerStyle: React.CSSProperties = {
    maxWidth: '800px', // Consistent width for content pages within dashboard
    margin: '0 auto', // Centered
    padding: 'var(--global-padding, 16px)', // Use global padding
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  const titleStyle: React.CSSProperties = {
    color: 'var(--color-blue-primary, #0055A4)',
    marginBottom: '1rem',
    // textAlign: 'center', // Let it align with content, not always centered
  };
  
  const introTextStyle: React.CSSProperties = {
    marginBottom: '2rem',
    fontSize: '1rem',
    lineHeight: '1.6',
    color: 'var(--color-text-secondary, #555)',
  };

  const disclaimerStyle: React.CSSProperties = {
    marginTop: '2rem',
    paddingTop: '1rem',
    borderTop: '1px solid var(--color-border-soft, #EEEEEE)',
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary, #777)',
    textAlign: 'center',
  };

  return (
    <div style={pageContainerStyle}>
      <h1 style={titleStyle}>Mes Aides Financières</h1>
      <p style={introTextStyle}>
        Informez-vous sur les différentes aides financières disponibles pour alléger le coût des activités sportives, culturelles, de loisirs, pour les vacances ou la scolarité. Cette page fournit des informations générales. L'éligibilité spécifique et les montants exacts dépendent des conditions de chaque aide et de votre situation personnelle.
      </p>

      <div>
        {financialAidsData.map((aid: FinancialAid) => (
          <InfoCard
            key={aid.id}
            title={aid.title}
            // Use mapped icon if available, otherwise default EuroIcon in InfoCard will be used
            icon={aid.icon && iconMap[aid.icon] ? iconMap[aid.icon] : undefined} 
            description={`${aid.description}\n\n`} 
            // Adding eligibility directly to description for now as InfoCard has one main text area
            // For more structured display, InfoCard would need more props/sections.
            // For now, eligibility is part of the description.
            // description={`${aid.description}\n\n**Éligibilité :** ${aid.eligibility_summary}`}
            // Let's refine InfoCard or add eligibility to description string directly.
            // For now, just description, eligibility summary would be part of it.
            // The spec for InfoCard has title & description. So eligibility is part of description.
          >
            {/* This is a child prop, let's add eligibility and link here if InfoCard is adapted */}
            <p style={{fontSize: '0.9em', marginTop: '8px', color: 'var(--color-text-secondary)'}}>
                <strong>Éligibilité (résumé) :</strong> {aid.eligibility_summary}
            </p>
            {aid.more_info_link && (
              <a 
                href={aid.more_info_link} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{
                    display: 'inline-block',
                    marginTop: '10px',
                    fontSize: '0.9em',
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-orange-primary)'
                }}
              >
                En savoir plus
              </a>
            )}
          </InfoCard>
        ))}
      </div>

      <p style={disclaimerStyle}>
        Les informations fournies ici sont à titre indicatif. Vérifiez toujours les conditions exactes auprès des organismes concernés ou de votre mairie.
      </p>
    </div>
  );
};

export default AidesFinancieresPage;
mport React from 'react'; const AidesFinancieresPage = () => <div>AidesFinancieresPage</div>; export default AidesFinancieresPage;
