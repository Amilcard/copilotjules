import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { useToast } from '../../context/ToastContext';

// Placeholder icons (simple text for now)
const IconPlaceholder: React.FC<{ icon: string }> = ({ icon }) => (
  <span style={{ marginRight: '10px', width: '24px', display: 'inline-block', textAlign: 'center' }}>{icon}</span>
);

const DashboardSidebar: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const handleLogout = () => {
    authService.logout();
    addToast("Vous avez été déconnecté.", "info");
    navigate('/login');
    window.dispatchEvent(new CustomEvent('authChange')); // Ensure App.tsx updates nav
  };

  const sidebarStyle: React.CSSProperties = {
    width: '240px', // Spec: Fixed width
    minWidth: '240px',
    height: 'calc(100vh - var(--header-height, 60px))', // Assuming a global header height variable or fixed value
    backgroundColor: 'var(--color-background-card, #FFFFFF)', // Spec: #FFFFFF
    borderRight: '1px solid var(--color-border-soft, #EEEEEE)', // Spec: 1px #EEEEEE
    paddingTop: '24px', // Spec: Padding top 24px
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  const navLinkStyle = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    textDecoration: 'none',
    fontSize: '16px', // Spec: Montserrat Medium 16px
    fontWeight: isActive ? 'var(--font-weight-semibold, 600)' : 'var(--font-weight-medium, 500)',
    color: isActive ? 'var(--color-blue-primary, #0055A4)' : 'var(--color-text-primary, #333333)',
    backgroundColor: isActive ? 'var(--color-blue-primary-light, #E8F5FF)' : 'transparent',
    borderRight: isActive ? `4px solid var(--color-blue-primary, #0055A4)` : '4px solid transparent',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    marginBottom: '4px', // Space between items
  });
  
  const logoutButtonStyle: React.CSSProperties = {
    ...navLinkStyle(false), // Inherit base style but not active state
    marginTop: 'auto', // Push to bottom
    marginBottom: '24px', // Space from bottom
    cursor: 'pointer',
    color: 'var(--color-text-secondary, #555555)',
  };


  return (
    <div style={sidebarStyle}>
      <nav>
        <ul>
          <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <NavLink 
              to="/dashboard" 
              end // 'end' prop ensures it's active only for exact path
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <IconPlaceholder icon="🏠" /> Mes Activités {/* Placeholder Icon */}
            </NavLink>
          </li>
          <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <NavLink 
              to="/dashboard/my-children"
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <IconPlaceholder icon="👶" /> Mes Enfants
            </NavLink>
          </li>
          <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <NavLink 
              to="/dashboard/aides-financieres" 
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <IconPlaceholder icon="💰" /> Mes Aides Financières
            </NavLink>
          </li>
          <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <NavLink 
              to="/dashboard/notifications-rappels" 
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <IconPlaceholder icon="🔔" /> Notifications & Rappels
            </NavLink>
          </li>
          <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <NavLink 
              to={currentUser?.profile_complete ? "/profile/view" : "/complete-profile"} // Example: /profile/view for view, /profile/edit for edit
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <IconPlaceholder icon="👤" /> Mon Profil
            </NavLink>
          </li>
          <li style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
            <NavLink 
              to="/settings" // Placeholder
              style={({ isActive }) => navLinkStyle(isActive)}
            >
              <IconPlaceholder icon="⚙️" /> Paramètres
            </NavLink>
          </li>
        </ul>
      </nav>
      <div 
        onClick={handleLogout} 
        style={logoutButtonStyle}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--color-background-page, #F5F5F5)'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') handleLogout();}}
      >
        <IconPlaceholder icon="🚪" /> Déconnexion
      </div>
    </div>
  );
};

export default DashboardSidebar;
