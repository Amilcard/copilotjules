import React from 'react';
import { Link } from 'react-router-dom'; // For links to edit profile etc.
import authService from '../services/authService';

const UserProfileViewPage: React.FC = () => {
  const currentUser = authService.getCurrentUser();

  const pageStyle: React.CSSProperties = {
    padding: 'var(--global-padding, 16px)',
    fontFamily: 'var(--font-primary, Montserrat)',
    maxWidth: '600px',
    margin: '2rem auto',
  };
  const titleStyle: React.CSSProperties = {
    color: 'var(--color-blue-primary, #0055A4)',
    marginBottom: '1.5rem',
  };
  const detailItemStyle: React.CSSProperties = {
    marginBottom: '0.8rem',
    fontSize: '1rem',
  };
  const labelStyle: React.CSSProperties = {
    fontWeight: 'var(--font-weight-semibold, 600)',
    marginRight: '8px',
  };

  if (!currentUser) {
    return (
      <div style={pageStyle}>
        <h1 style={titleStyle}>Mon Profil</h1>
        <p>Impossible de charger les informations utilisateur. Veuillez vous reconnecter.</p>
        <Link to="/login">Se connecter</Link>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Mon Profil</h1>
      <div style={detailItemStyle}><span style={labelStyle}>Prénom:</span> {currentUser.first_name || 'Non spécifié'}</div>
      <div style={detailItemStyle}><span style={labelStyle}>Nom:</span> {currentUser.last_name || 'Non spécifié'}</div>
      <div style={detailItemStyle}><span style={labelStyle}>Nom d'utilisateur:</span> {currentUser.username}</div>
      <div style={detailItemStyle}><span style={labelStyle}>Email:</span> {currentUser.email}</div>
      <hr style={{margin: '1.5rem 0'}}/>
      <h2 style={{...titleStyle, fontSize: '1.5rem'}}>Informations Complémentaires</h2>
      <div style={detailItemStyle}><span style={labelStyle}>Adresse Postale:</span> {currentUser.address_postal || 'Non spécifié'}</div>
      <div style={detailItemStyle}><span style={labelStyle}>Quotient Familial:</span> {currentUser.quotient_familial || 'Non spécifié'}</div>
      <div style={detailItemStyle}><span style={labelStyle}>Nombre d'enfants:</span> {currentUser.nombre_enfants ?? 'Non spécifié'}</div>
      <div style={detailItemStyle}>
        <span style={labelStyle}>Profil Complet:</span> 
        {currentUser.profile_complete ? <span style={{color: 'green'}}>Oui</span> : <span style={{color: 'orange'}}>Non</span>}
      </div>
      
      {!currentUser.profile_complete && (
        <div style={{marginTop: '1.5rem'}}>
            <Link to="/complete-profile" className="button-link primary">
                Compléter mon profil
            </Link>
        </div>
      )}
      {/* Add a link to an "Edit Profile" page later */}
      {/* <Link to="/profile/edit" className="button-link secondary" style={{marginTop: '1rem'}}>Modifier mon profil</Link> */}

    </div>
  );
};

export default UserProfileViewPage;
