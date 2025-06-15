import React from 'react';

interface ProfileProgressBarProps {
  isProfileComplete: boolean;
  // You could extend this with more granular progress if needed:
  // progressPercent?: number; // e.g., 0-100
}

const ProfileProgressBar: React.FC<ProfileProgressBarProps> = ({ isProfileComplete }) => {
  const progressPercent = isProfileComplete ? 100 : 50; // Simplified: 50% for initial, 100% for complete
  const barColor = isProfileComplete ? '#4CAF50' : '#FFC107'; // Green for complete, Amber for incomplete

  const containerStyles: React.CSSProperties = {
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    padding: '2px', // Slight padding for the border effect
    boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.2)',
  };

  const fillerStyles: React.CSSProperties = {
    height: '15px', // Adjust height as needed
    width: `${progressPercent}%`,
    backgroundColor: barColor,
    borderRadius: 'inherit',
    textAlign: 'right',
    transition: 'width 0.5s ease-in-out',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const labelStyles: React.CSSProperties = {
    padding: '5px',
    color: progressPercent > 60 || isProfileComplete ? 'white' : 'black', // Adjust text color for visibility
    fontWeight: 'bold',
    fontSize: '0.7rem',
  };

  return (
    <div style={{ marginBottom: '10px' }}>
      <small>Profile Completion:</small>
      <div style={containerStyles}>
        <div style={fillerStyles}>
          <span style={labelStyles}>{`${progressPercent}%`}</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileProgressBar;
