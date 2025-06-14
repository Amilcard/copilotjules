import React, { useState, useEffect } from 'react';
import { GetActivitiesParams } from '../../services/activityService'; // For filter types

// Simple Close Icon SVG
const CloseIcon: React.FC<{ size?: string, color?: string }> = ({ size = "24px", color = "#333" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={size} height={size}>
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
  </svg>
);


interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentFilters: GetActivitiesParams;
  onApplyFilters: (filters: GetActivitiesParams) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({ 
  isOpen, 
  onClose, 
  currentFilters, 
  onApplyFilters 
}) => {
  const [type, setType] = useState(currentFilters.type || '');
  // Age, MaxPrice, Latitude, Longitude, Radius are now managed by SearchPage directly for prominent filters
  // This panel will only manage 'type' and any future advanced filters.
  // We still receive currentFilters to potentially display other active filters if needed,
  // but this simplified panel will only modify 'type'.

  const [localErrors, setLocalErrors] = useState<Record<string, string>>({}); // For future advanced filter validation

  // Update local state if currentFilters prop changes from parent (only for 'type')
  useEffect(() => {
    setType(currentFilters.type || '');
    // No need to update age, maxPrice, etc. here as they are not inputs in this panel anymore
  }, [currentFilters.type]); // Only re-sync if the 'type' filter from parent changes

  const handleApply = () => {
    // Construct the filter update based *only* on what this panel manages
    const panelSpecificFilters: GetActivitiesParams = {};
    if (type.trim()) panelSpecificFilters.type = type.trim();
    // Add any other advanced filters this panel might manage in the future

    // The onApplyFilters callback in SearchPage will merge these panel-specific
    // filters with the prominently displayed filters.
    onApplyFilters(panelSpecificFilters); 
  };

  const handleReset = () => {
    setType('');
    setLocalErrors({});
    // Reset only the filters managed by this panel
    onApplyFilters({ type: '' }); // Send empty string for type to clear it
  };

  if (!isOpen) {
    return null;
  }

  // Styles
  const panelOverlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Semi-transparent overlay
    zIndex: 1000, // Ensure it's on top of other content but below modals if any
    display: 'flex',
    justifyContent: 'flex-end', // Slide from right
  };

  const panelStyle: React.CSSProperties = {
    width: '300px', // Max width for the panel
    maxWidth: '80vw', // Ensure it's not too wide on small screens
    height: '100%',
    backgroundColor: '#FFFFFF', // Spec: Background #FFF
    boxShadow: '-2px 0 8px rgba(0,0,0,0.15)', // Spec: Shadow
    display: 'flex',
    flexDirection: 'column',
    padding: 'var(--global-padding, 16px)',
    fontFamily: 'var(--font-primary, Montserrat)',
    animation: 'slideInFromRight 0.3s ease-out forwards',
  };
  
  const panelHeaderStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    borderBottom: '1px solid var(--color-border-soft, #EEEEEE)',
    paddingBottom: '10px',
  };
  
  const panelTitleStyle: React.CSSProperties = {
    fontSize: '1.25rem', // Approx 20px
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-blue-primary, #0055A4)',
    margin: 0,
  };

  const filterSectionStyle: React.CSSProperties = {
    marginBottom: '20px',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px', // Spec: Montserrat 14px
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-text-secondary, #555555)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    borderRadius: 'var(--button-border-radius, 8px)',
    border: '1px solid #DDDDDD',
    fontSize: '14px',
    fontFamily: 'var(--font-primary, Montserrat)',
  };
  
  const buttonContainerStyle: React.CSSProperties = {
    marginTop: 'auto', // Push buttons to the bottom
    paddingTop: '20px',
    borderTop: '1px solid var(--color-border-soft, #EEEEEE)',
    display: 'flex',
    justifyContent: 'space-between', // Or 'flex-end' with gap
    gap: '10px',
  };


  return (
    <div style={panelOverlayStyle} onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="filter-panel-title">
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}> {/* Prevent clicks inside panel from closing it */}
        <div style={panelHeaderStyle}>
          <h3 id="filter-panel-title" style={panelTitleStyle}>Filtres</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
            <CloseIcon />
          </button>
        </div>

        {/* Filter Sections */}
        <div style={filterSectionStyle}>
          <label htmlFor="filter-type" style={labelStyle}>Type d'activité</label>
          <input 
            type="text" id="filter-type" style={inputStyle} value={type} 
            onChange={(e) => setType(e.target.value)} placeholder="e.g., Sport, Culture"
          />
          {/* Add validation error display for type if needed */}
        </div>

        {/* Age, MaxPrice, and Location filters are now directly on SearchPage.tsx */}
        {/* This panel could display their current values if desired, passed via currentFilters */}
        {/* Example: 
        {currentFilters.age && <p>Âge appliqué: {currentFilters.age}</p>}
        */}
        
        <div style={{marginTop: '20px', borderTop: '1px solid var(--color-border-soft, #EEEEEE)', paddingTop: '20px'}}>
            <p style={{fontSize: '0.9em', color: 'var(--color-text-secondary)'}}>
                Les filtres principaux (âge, tarif, localisation) sont accessibles directement sur la page de recherche.
            </p>
        </div>

        <div style={buttonContainerStyle}>
          <button onClick={handleReset} className="secondary" style={{ flexGrow: 1, backgroundColor: '#e0e0e0', color: '#333', borderColor: '#ccc' }}>Réinitialiser</button>
          <button onClick={handleApply} className="primary" style={{ flexGrow: 1 }}>Appliquer Filtres</button>
        </div>
      </div>
      <style>{`
        @keyframes slideInFromRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        .error-text-small { color: red; font-size: 0.8em; margin-top: 4px; } 
      `}</style>
    </div>
  );
};

export default FilterPanel;
