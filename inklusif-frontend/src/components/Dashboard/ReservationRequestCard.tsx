import React from 'react';
import { Link } from 'react-router-dom';
import { UserReservationRequest } from '../../services/reservationService';

interface ReservationRequestCardProps {
  request: UserReservationRequest;
}

const ReservationRequestCard: React.FC<ReservationRequestCardProps> = ({ request }) => {
  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      // hour: '2-digit', minute: '2-digit' // Optional: if time is needed
    }).format(new Date(dateString));
  };

  const getStatusStyle = (status: string): React.CSSProperties => {
    let backgroundColor = 'var(--color-status-default-bg, #e0e0e0)';
    let color = 'var(--color-status-default-text, #333)';

    switch (status.toLowerCase()) {
      case 'pending':
        backgroundColor = 'var(--color-status-pending-bg, #FFF9E6)'; // Light yellow
        color = 'var(--color-status-pending-text, #F39C12)'; // Orange
        break;
      case 'confirmed':
        backgroundColor = 'var(--color-status-confirmed-bg, #E7F5E8)'; // Light green
        color = 'var(--color-status-confirmed-text, #2ECC71)'; // Green
        break;
      case 'cancelled_by_user':
      case 'rejected_by_organizer':
        backgroundColor = 'var(--color-status-rejected-bg, #FDECEA)'; // Light red
        color = 'var(--color-status-rejected-text, #E74C3C)'; // Red
        break;
    }
    return {
      backgroundColor,
      color,
      padding: '4px 8px',
      borderRadius: 'var(--button-border-radius, 6px)',
      fontSize: '0.8rem',
      fontWeight: 'var(--font-weight-semibold, 600)',
      display: 'inline-block', // To allow padding and border-radius effectively
      textTransform: 'capitalize',
    };
  };
  
  const cardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-background-card, #FFFFFF)',
    borderRadius: 'var(--card-border-radius, 8px)',
    boxShadow: '0 2px 8px var(--color-shadow, rgba(0,0,0,0.08))',
    padding: 'var(--global-padding, 16px)',
    marginBottom: '1rem',
    display: 'flex',
    gap: '16px', // Gap between image and content
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  const imageStyle: React.CSSProperties = {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    borderRadius: 'var(--button-border-radius, 6px)', // Slightly smaller radius for image within card
    backgroundColor: 'var(--color-border-soft, #EEEEEE)', // Placeholder bg
  };
  
  const contentStyle: React.CSSProperties = {
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
  };

  const reservedForStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-blue-primary, #0055A4)', // Using blue for emphasis
    marginBottom: '6px',
    display: 'flex',
    alignItems: 'center',
  };
  
  const personIconStyle: React.CSSProperties = { // Simple person icon
      marginRight: '6px',
      fontSize: '1.1em', // Adjust size as needed
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '1.1rem',
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-blue-primary, #0055A4)',
    marginBottom: '8px',
    textDecoration: 'none',
  };

  const detailStyle: React.CSSProperties = {
    fontSize: '0.85rem',
    color: 'var(--color-text-secondary, #555555)',
    marginBottom: '4px',
  };

  return (
    <div style={cardStyle}>
      {request.activity_header_image_url ? (
        <img src={request.activity_header_image_url} alt={request.activity_title} style={imageStyle} />
      ) : (
        <div style={{...imageStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: '0.8rem'}}>Image<br/>Indisponible</div>
      )}
      <div style={contentStyle}>
        <Link to={`/activities/${request.activity_id}`} style={titleStyle} title={`Voir les détails de ${request.activity_title}`}>
          {request.activity_title}
        </Link>

        <div style={reservedForStyle}>
          <span style={personIconStyle} role="img" aria-label="Pour">👤</span> {/* Simple person emoji as icon */}
          {request.child_profile_id && request.child_first_name ? (
            <span>Pour : {request.child_first_name} {request.child_last_name || ''}</span>
          ) : (
            <span>Pour : Moi-même</span>
          )}
        </div>

        {request.activity_date_text && <p style={detailStyle}><strong>Quand:</strong> {request.activity_date_text}</p>}
        {(request.location_name || request.address_city) && (
          <p style={detailStyle}>
            <strong>Où:</strong> {request.location_name}{request.location_name && request.address_city ? ', ' : ''}{request.address_city}
          </p>
        )}
        <p style={detailStyle}><strong>Participants:</strong> {request.number_of_participants}</p>
        <p style={detailStyle}><strong>Demandé le:</strong> {formatDate(request.reservation_requested_at)}</p>
        <p style={{...detailStyle, marginTop: '8px'}}>
          <strong>Statut:</strong> <span style={getStatusStyle(request.reservation_status)}>{request.reservation_status.replace(/_/g, ' ')}</span>
        </p>
        {request.message_to_organizer && (
            <p style={{...detailStyle, marginTop: '8px', fontSize: '0.8rem', fontStyle: 'italic'}}>
                <strong>Votre message:</strong> "{request.message_to_organizer}"
            </p>
        )}
      </div>
    </div>
  );
};

export default ReservationRequestCard;

