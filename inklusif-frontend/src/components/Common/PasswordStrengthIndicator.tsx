import React from 'react';
import zxcvbn from 'zxcvbn';

interface PasswordStrengthIndicatorProps {
  password?: string; // Optional: if no password, show nothing or a default state
}

interface Strength {
  score: number; // 0-4 from zxcvbn
  text: string;
  color: string;
  widthPercentage: string;
}

const getPasswordStrengthDetails = (password: string | undefined): Strength | null => {
  if (!password) {
    return null; // Or a default "empty" state if preferred
  }

  const result = zxcvbn(password);
  const score = result.score;

  let text = '';
  let color = 'var(--color-strength-very-weak, #E74C3C)'; // Default to very weak
  let widthPercentage = '0%'; // Default to 0% for empty or very weak with no input

  if (password) { // Only show colors/text if there's a password
    switch (score) {
      case 0:
        text = 'Très Faible';
        color = 'var(--color-strength-very-weak, #E74C3C)'; // Red
        widthPercentage = '20%';
        break;
      case 1:
        text = 'Faible';
        color = 'var(--color-strength-weak, #FF8C00)'; // Orange (was E74C3C, changed to orange for distinction)
        widthPercentage = '40%';
        break;
      case 2:
        text = 'Moyen';
        color = 'var(--color-strength-fair, #FFD700)'; // Gold/Yellow
        widthPercentage = '60%';
        break;
      case 3:
        text = 'Fort';
        color = 'var(--color-strength-good, #90EE90)'; // LightGreen
        widthPercentage = '80%';
        break;
      case 4:
        text = 'Très Fort';
        color = 'var(--color-strength-strong, #2ECC71)'; // Green
        widthPercentage = '100%';
        break;
      default: // Should not happen with zxcvbn
        text = '';
        widthPercentage = '0%';
        break;
    }
  }


  return { score, text, color, widthPercentage };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const strengthDetails = getPasswordStrengthDetails(password);

  if (!password || !strengthDetails) { // Don't render if no password or if strengthDetails is null (e.g. password just became empty)
    return (
        <div style={{ height: '26px', marginTop: '5px' }}> {/* Reserve space to prevent layout shift */}
             {/* Optionally, show an empty state or minimal bar */}
            <div style={{
                width: '100px', height: '6px', backgroundColor: 'var(--color-border-soft, #EEEEEE)',
                borderRadius: '3px', marginTop: '4px'
            }}>
                 <div style={{ height: '100%', width: '0%', backgroundColor: 'transparent', borderRadius: 'inherit' }} />
            </div>
        </div>
    );
  }

  const indicatorContainerStyle: React.CSSProperties = {
    marginTop: '5px', // Space above the indicator
    display: 'flex',
    alignItems: 'center',
    height: '26px', // To align with text and prevent layout shifts
  };

  const barTrackStyle: React.CSSProperties = {
    width: '100px', // Spec: barre 100x6px
    height: '6px',  // Spec: barre 100x6px
    backgroundColor: 'var(--color-border-soft, #EEEEEE)', // Track color
    borderRadius: '3px',
    overflow: 'hidden',
    marginRight: '8px', // Space between bar and text
  };

  const strengthBarStyle: React.CSSProperties = {
    width: strengthDetails.widthPercentage,
    height: '100%',
    backgroundColor: strengthDetails.color,
    borderRadius: 'inherit', // Ensure inner bar also has rounded corners if track does
    transition: 'width 0.3s ease-in-out, background-color 0.3s ease-in-out',
  };

  const strengthTextStyle: React.CSSProperties = {
    fontSize: '12px', // Spec: small text
    color: strengthDetails.color, // Text color matches bar color for emphasis
    fontWeight: 'var(--font-weight-semibold, 600)',
    whiteSpace: 'nowrap',
  };

  return (
    <div style={indicatorContainerStyle}>
      <div style={barTrackStyle}>
        <div style={strengthBarStyle} />
      </div>
      <span style={strengthTextStyle}>{strengthDetails.text}</span>
    </div>
  );
};

export default PasswordStrengthIndicator;
