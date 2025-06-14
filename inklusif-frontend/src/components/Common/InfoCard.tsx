import React from 'react';

// Euro Icon Placeholder (as per Screen 8 spec: icône “€” 24 px #2C3E50)
const EuroIcon: React.FC<{ size?: string; color?: string; style?: React.CSSProperties }> = ({
  size = "24px",
  color = "var(--color-text-heading-dark, #2C3E50)", // Using a variable that can default to #2C3E50
  style,
}) => (
  <div style={{ width: size, height: size, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
      <path d="M11.9999 1.75C6.33999 1.75 1.74999 6.34 1.74999 12C1.74999 17.66 6.33999 22.25 11.9999 22.25C17.6599 22.25 22.2499 17.66 22.2499 12C22.2499 6.34 17.6599 1.75 11.9999 1.75ZM11.9999 20.25C7.44999 20.25 3.74999 16.55 3.74999 12C3.74999 7.45 7.44999 3.75 11.9999 3.75C16.5499 3.75 20.2499 7.45 20.2499 12C20.2499 16.55 16.5499 20.25 11.9999 20.25Z M14.9399 15.27L13.5299 16.68C13.1399 17.07 12.5099 17.07 12.1199 16.68C11.7299 16.29 11.7299 15.66 12.1199 15.27L12.8299 14.56H8.99999C8.44999 14.56 7.99999 14.11 7.99999 13.56V12.56C7.99999 12.01 8.44999 11.56 8.99999 11.56H12.83L12.12 10.85C11.73 10.46 11.73 9.83 12.12 9.44L13.53 8.03C13.92 7.64 14.55 7.64 14.94 8.03C15.33 8.42 15.33 9.05 14.94 9.44L14.23 10.15H15C15.55 10.15 16 10.6 16 11.15V12.15C16 12.7 15.55 13.15 15 13.15H14.23L14.9399 13.86C15.3299 14.25 15.3299 14.88 14.9399 15.27Z"/>
      {/* This is a generic "info in circle" icon. A proper Euro "€" might be better if available as SVG */}
      {/* A simple text "€" could also be used if SVG is an issue for the specific symbol */}
    </svg>
  </div>
);


interface InfoCardProps {
  icon?: JSX.Element;
  title: string;
  description: string;
  footerLink?: { // This prop might be replaced by passing children directly
    text: string;
    url: string;
  };
  children?: React.ReactNode; // To render additional content like eligibility and specific links
}

const InfoCard: React.FC<InfoCardProps> = ({ icon, title, description, footerLink, children }) => {
  const cardStyle: React.CSSProperties = {
    width: '100%', 
    backgroundColor: 'var(--color-background-card, #FFFFFF)', 
    border: '1px solid var(--color-border-soft, #EEEEEE)', // Soft border
    borderRadius: 'var(--card-border-radius, 8px)', // Consistent radius
    padding: 'var(--global-padding, 16px)',
    marginBottom: 'var(--global-padding, 16px)', // Space between cards
    boxShadow: 'var(--card-shadow, 0 2px 4px rgba(0,0,0,0.05))',
    display: 'flex',
    alignItems: 'flex-start', // Align icon to the top of the text content
    gap: '16px',
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  const iconContainerStyle: React.CSSProperties = {
    flexShrink: 0,
    marginTop: '2px', // Align icon slightly with title
  };

  const textContainerStyle: React.CSSProperties = {
    flexGrow: 1,
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '16px', // Spec: titre Montserrat Semi-Bold 16 px
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-text-primary, #333333)', // Spec for list items uses #333
    margin: '0 0 8px 0',
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: '14px', // Spec: description 14 px
    lineHeight: '1.5', // Standard line height for readability
    color: 'var(--color-text-secondary, #555555)',
    margin: '0',
    whiteSpace: 'pre-line', // Respect line breaks in description text
  };

  const footerLinkStyle: React.CSSProperties = {
    display: 'inline-block',
    marginTop: '12px',
    fontSize: '14px',
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-orange-primary, #FF6F61)',
    textDecoration: 'underline',
  };

  return (
    <div style={cardStyle}>
      <div style={iconContainerStyle}>
        {icon || <EuroIcon />} {/* Default to EuroIcon if no icon provided */}
      </div>
      <div style={textContainerStyle}>
        <h4 style={titleStyle}>{title}</h4>
        <p style={descriptionStyle}>{description}</p>
        {children} {/* Render children here for additional content */}
        {footerLink && ( // Kept for now, but children pattern might be preferred
          <a href={footerLink.url} target="_blank" rel="noopener noreferrer" style={footerLinkStyle}>
            {footerLink.text}
          </a>
        )}
      </div>
    </div>
  );
};

export default InfoCard;

