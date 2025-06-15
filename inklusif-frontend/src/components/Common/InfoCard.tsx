import React from 'react';

interface InfoCardProps {
  icon?: React.ReactNode;
  title: string;
  value?: string | number;
  description?: string;
  variant?: 'primary' | 'secondary';
}

const InfoCard: React.FC<InfoCardProps> = ({
  icon,
  title,
  value,
  description,
  variant = 'primary',
}) => {
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
        {description && <div style={{ fontSize: '14px', marginTop: '4px' }}>{description}</div>}
      </div>
    </div>
  );
};

export default InfoCard;
