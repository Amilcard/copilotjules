import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { mockNotificationsData, MockNotification, NotificationType } from '../../data/mockNotifications';

// --- Icons (Placeholders - adjust size and color as needed via props) ---
const AlertIcon: React.FC<{ color?: string, size?: string }> = ({ color = "var(--color-alert-icon, #E67E22)", size = "20px" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 16c-.55 0-1-.45-1-1v-4c0-.55.45-1 1-1s1 .45 1 1v4c0 .55-.45 1-1 1zm1-8h-2V6h2v4z"/>
  </svg>
);
const InfoIconStyled: React.FC<{ color?: string, size?: string }> = ({ color = "var(--color-info-icon, #3498DB)", size = "20px" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 20 20" fill="none">
    <path fillRule="evenodd" clipRule="evenodd" d="M9.99935 0.833313C4.93651 0.833313 0.832672 4.93715 0.832672 10C0.832672 15.0628 4.93651 19.1666 9.99935 19.1666C15.0622 19.1666 19.166 15.0628 19.166 10C19.166 4.93715 15.0622 0.833313 9.99935 0.833313ZM8.74935 6.25C8.74935 5.83579 9.08514 5.5 9.49935 5.5H10.4993C10.9136 5.5 11.2493 5.83579 11.2493 6.25V6.66665C11.2493 7.08086 10.9136 7.41665 10.4993 7.41665H9.49935C9.08514 7.41665 8.74935 7.08086 8.74935 6.66665V6.25ZM8.74935 9.16665C8.74935 8.75244 9.08514 8.41665 9.49935 8.41665H10.4993C10.9136 8.41665 11.2493 8.75244 11.2493 9.16665V13.3333C11.2493 13.7475 10.9136 14.0833 10.4993 14.0833H9.49935C9.08514 14.0833 8.74935 13.7475 8.74935 13.3333V9.16665Z" fill={color}/>
  </svg>
);
const ReminderBellIcon: React.FC<{ color?: string, size?: string }> = ({ color = "var(--color-reminder-icon, #9B59B6)", size = "20px" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
  </svg>
);
// --- End Icons ---

// Notification Item Component (Internal to this page for now)
interface NotificationItemProps {
  notification: MockNotification;
}
const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const formatDate = (date: Date) => new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'alert': return <AlertIcon />;
      case 'info': return <InfoIconStyled />;
      case 'reminder': return <ReminderBellIcon />;
      default: return <InfoIconStyled />; // Default icon
    }
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-background-card, #FFFFFF)', // Spec: background #FFF
    border: '1px solid var(--color-border-soft, #EEEEEE)', // Spec: bord 1 px #EEEEEE
    borderRadius: 'var(--card-border-radius, 8px)',
    padding: '12px 16px', // Slightly less padding than global for denser list
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'flex-start', // Align icon with top of text
    gap: '12px',
    boxShadow: 'var(--card-shadow-light, 0 1px 3px rgba(0,0,0,0.04))',
    position: 'relative', // For unread dot
  };

  const unreadDotStyle: React.CSSProperties = {
    position: 'absolute',
    top: '12px',
    left: '-5px', // Position slightly outside the card border
    width: '10px', // Spec: dot 10x10 px
    height: '10px',
    borderRadius: '50%',
    backgroundColor: 'var(--color-orange-primary, #FF6F61)', // Spec: #FF6F61
  };
  
  const titleStyle: React.CSSProperties = { fontWeight: 'var(--font-weight-semibold, 600)', fontSize: '16px', color: 'var(--color-text-primary, #333)', margin: '0 0 4px 0' };
  const messageStyle: React.CSSProperties = { fontSize: '14px', color: 'var(--color-text-secondary, #555)', margin: '0 0 8px 0', lineHeight: 1.5 };
  const dateStyle: React.CSSProperties = { fontSize: '12px', color: '#777', margin: '0 0 8px 0' };
  const linkStyle: React.CSSProperties = { fontSize: '14px', fontWeight: 'var(--font-weight-semibold)', color: 'var(--color-orange-primary)', textDecoration: 'underline' };

  return (
    <div style={cardStyle}>
      {!notification.is_read && <span style={unreadDotStyle} title="Non lu"></span>}
      <div style={{flexShrink: 0, marginTop: '2px'}}>{getIcon(notification.type)}</div>
      <div style={{flexGrow: 1}}>
        <h4 style={titleStyle}>{notification.title}</h4>
        <p style={dateStyle}>{formatDate(notification.date)}</p>
        <p style={messageStyle}>{notification.message}</p>
        {notification.link_to && <Link to={notification.link_to} style={linkStyle}>Voir détails</Link>}
      </div>
    </div>
  );
};


const NotificationsRappelsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<MockNotification[]>([]);
  
  useEffect(() => {
    // Simulate fetching data
    setNotifications(mockNotificationsData.sort((a, b) => b.date.getTime() - a.date.getTime())); // Sort by most recent
  }, []);

  const pageContainerStyle: React.CSSProperties = { maxWidth: '700px', margin: '2rem auto', padding: 'var(--global-padding, 16px)', fontFamily: 'var(--font-primary, Montserrat)' };
  const titleStyle: React.CSSProperties = { color: 'var(--color-blue-primary, #0055A4)', marginBottom: '0.5rem' };
  const subTitleStyle: React.CSSProperties = { color: 'var(--color-text-secondary, #555)', marginBottom: '1rem', fontSize: '0.9rem' };
  const frequencySettingStyle: React.CSSProperties = { fontSize: '0.9rem', color: 'var(--color-text-secondary)', padding: '10px', backgroundColor: 'var(--color-background-page-alt, #f0f0f0)', borderRadius: '6px', marginBottom: '2rem', textAlign: 'center' };
  const bannerReminderStyle: React.CSSProperties = { backgroundColor: 'var(--color-banner-background, #FFF9E6)', border: '1px solid var(--color-banner-border, #FCEBC4)', borderRadius: 'var(--button-border-radius, 8px)', padding: '16px', margin: '32px 0', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '14px', color: '#333' };

  return (
    <div style={pageContainerStyle}>
      <h1 style={titleStyle}>Notifications et Rappels</h1>
      <p style={subTitleStyle}>Retrouvez ici vos notifications importantes et rappels.</p>
      
      <div style={frequencySettingStyle}>
        Préférences de fréquence : (À configurer bientôt)
      </div>

      {notifications.length === 0 ? (
        <p style={{textAlign: 'center'}}>Aucune notification pour le moment.</p>
      ) : (
        <div>
          {/* Example of a grouped section title - for future dynamic grouping */}
          {/* <h3 style={{color: 'var(--color-text-secondary)', fontSize: '1.1rem', marginTop: '1.5rem', marginBottom: '0.8rem'}}>Aujourd'hui</h3> */}
          {notifications.map(notif => (
            <NotificationItem key={notif.id} notification={notif} />
          ))}
        </div>
      )}

      {/* Example Banner Reminder - Static for now */}
      <div style={bannerReminderStyle}>
        <InfoIconStyled color="#F39C12" /> {/* Using info icon from Screen 9 */}
        <div>
            <h5 style={{margin: '0 0 5px 0', fontWeight: 'var(--font-weight-semibold)'}}>N'oubliez pas de compléter votre profil !</h5>
            <p style={{margin:0, fontSize: '0.85rem'}}>Cela vous permettra d'accéder à plus de fonctionnalités et d'aides personnalisées.</p>
            <Link to="/complete-profile" style={{fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--color-orange-primary)', textDecoration: 'underline', marginTop: '5px', display: 'inline-block'}}>Compléter maintenant</Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationsRappelsPage;