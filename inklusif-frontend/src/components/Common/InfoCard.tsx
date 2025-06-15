import React from 'react';

// Euro Icon Placeholder
const EuroIcon: React.FC<{ size?: string; color?: string; style?: React.CSSProperties }> = ({
  size = "24px",
  color = "var(--color-text-heading-dark, #2C3E50)",
  style,
}) => (
  <div style={{ width: size, height: size, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', ...style }}>
    <svg viewBox="0 0 24 24" fill="currentColor" width="100%" height="100%">
      <path d="M11.9999 1.75C6.33999 1.75 1.74999 6.34 1.74999 12C1.74999 17.66 6.33999 22.25 11.9999 22.25C17.6599 22.25 22.2499 17.66 22.2499 12C22.2499 6.34 17.6599 1.75 11.9999 1.75ZM11.9999 20.25C7.44999 20.25 3.74999 16.55 3.74999 12C3.74999 7.45 7.44999 3.75 11.9999 3.75C16.5499 3.75 20.2499 7.45 20.2499 12C20.2499 16.55 16.5499 20.25 11.9999 20.25Z M14.9399 15.27L13.5299 16.68C13.1399 17.07 12.5099 17.07 12.1199 16.68C11.7299 16.29 11.7299 15.66 12.1199 15.27L12.8299 14.56H8.99999C8.44999 14.56 7.99999 14.11 7.99999 13.56V12.56C7.99999 12.01 8.44999 11.56 8.99999 11.56H12.83L12.12 10.85C11.73 10.46 11.73 9.83 12.12 9.44L13.53 8.03C13.92 7.64 14.55 7.64 14.94 8.03C15.33 8.42 15.33 9.05 14.94 9.44L14.23 10.15H15C15.55 10.15 16 10.6 16 11.15V12.15C16 12.7 15.55 13.15 15 13.15H14.23L14.9399 13.86C15.3299 14.25 15.3299 14.88 14.9399 15.27Z"/>
    </svg>
  </div>
);

// Interface combinée supportant les deux modes
interface InfoCardProps {
  icon?: React.ReactNode;
  title: string;
  value?: string | number;
  description?: string;
  variant?: 'primary' | 'secondary';
  footerLink?: {
    text: string;
    url: string;
  };
  children?: React.ReactNode;
}

const InfoCard: React.FC<InfoCardProps> = ({ 
  icon, 
  title, 
  value, 
  description, 
  variant = 'primary',
  footerLink, 
  children 
}) => {
  // Détermine si on utilise le nouveau style (avec description) ou l'ancien (avec value)
  const useNewStyle = description !== undefined || children !== undefined || footerLink !== undefined;
  
  if (!useNewStyle) {
    // MODE ANCIEN (compatible avec AccueilPage actuel)
    const bgColor = variant === 'primary' ? '#0055A4' : '#EEEEEE';
    const textColor = variant === 'primary' ? '#FFFFFF' : '#333333';
    
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: bgColor,
          color: textColor,
          padding: '12px',
          borderRadius: '8px',
        }}
      >
        {icon && <span style={{ marginRight: '8px' }}>{icon}</span>}
        <div>
          <div style={{ fontSize: '14px', opacity: 0.8 }}>{title}</div>
          {value && <div style={{ fontSize: '24px', fontWeight: 'bold' }}>{value}</div>}
        </div>
      </div>
    );
  }
  
  // MODE NOUVEAU (nouveau design)
  return (
    <div style={{
      width: '100%',
      backgroundColor: 'var(--color-background-card, #FFFFFF)',
      border: '1px solid var(--color-border-soft, #EEEEEE)',
      borderRadius: 'var(--card-border-radius, 8px)',
      padding: 'var(--global-padding, 16px)',
      marginBottom: 'var(--global-padding, 16px)',
      boxShadow: 'var(--card-shadow, 0 2px 4px rgba(0,0,0,0.05))',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '16px',
      fontFamily: 'var(--font-primary, Montserrat)',
    }}>
      <div style={{ flexShrink: 0, marginTop: '2px' }}>
        {icon || <EuroIcon />}
      </div>
      <div style={{ flexGrow: 1 }}>
        <h4 style={{
          fontSize: '16px',
          fontWeight: 'var(--font-weight-semibold, 600)',
          color: 'var(--color-text-primary, #333333)',
          margin: '0 0 8px 0',
        }}>{title}</h4>
        
        {description && (
          <p style={{
            fontSize: '14px',
            lineHeight: '1.5',
            color: 'var(--color-text-secondary, #555555)',
            margin: '0',
            whiteSpace: 'pre-line',
          }}>{description}</p>
        )}
        
        {children}
        
        {footerLink && (
          <a 
            href={footerLink.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={{
              display: 'inline-block',
              marginTop: '12px',
              fontSize: '14px',
              fontWeight: 'var(--font-weight-semibold, 600)',
              color: 'var(--color-orange-primary, #FF6F61)',
              textDecoration: 'underline',
            }}
          >
            {footerLink.text}
          </a>
        )}
      </div>
    </div>
  );
};

export default InfoCard;