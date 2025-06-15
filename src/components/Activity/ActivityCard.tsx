import React from 'react';
import { Link } from 'react-router-dom';
import { Activity } from '../../services/activityService'; // Assuming Activity type is exported

interface ActivityCardProps {
  activity: Activity;
}

const cardStyle: React.CSSProperties = {
  backgroundColor: 'var(--color-background-card, #FFFFFF)',
  borderRadius: 'var(--card-border-radius, 16px)',
  boxShadow: '0 4px 12px var(--color-shadow, rgba(0,0,0,0.08))',
  padding: 'var(--global-padding, 16px)',
  display: 'flex',
  flexDirection: 'column',
  height: '100%', // Ensure cards in a grid take same height if container allows
};

const titleStyle: React.CSSProperties = {
  fontFamily: 'var(--font-primary, Montserrat)',
  fontSize: '1.25rem', // Approx 20px
  fontWeight: 'var(--font-weight-semibold, 600)',
  color: 'var(--color-blue-primary, #0055A4)',
  marginBottom: '8px',
  // Text overflow handling for long titles
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};

const descriptionStyle: React.CSSProperties = {
  fontFamily: 'var(--font-primary, Montserrat)',
  fontSize: '0.9rem', // Approx 14px
  color: 'var(--color-text-secondary, #555555)',
  marginBottom: '16px',
  flexGrow: 1, // Allows description to take available space
  // Text overflow for multi-line
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 3, // Show 3 lines of text
  WebkitBoxOrient: 'vertical',
};

const locationStyle: React.CSSProperties = {
    fontFamily: 'var(--font-primary, Montserrat)',
    fontSize: '0.8rem',
    color: 'var(--color-text-secondary, #777777)',
    marginBottom: '16px',
};

const buttonStyle: React.CSSProperties = {
  // Using classes defined in index.css for consistency if possible
  // Or define specific styles here
  fontFamily: 'var(--font-primary, Montserrat)',
  fontWeight: 'var(--font-weight-semibold, 600)',
  fontSize: '0.9rem',
  padding: '8px 16px',
  borderRadius: 'var(--button-border-radius, 8px)',
  backgroundColor: 'var(--color-orange-primary, #FF6F61)',
  color: 'var(--color-text-light, #FFFFFF)',
  textAlign: 'center',
  textDecoration: 'none',
  border: 'none',
  cursor: 'pointer',
  marginTop: 'auto', // Pushes button to the bottom of the card
  alignSelf: 'flex-start', // Align button to the left
};


const ActivityCard: React.FC<ActivityCardProps> = ({ activity }) => {
  // Simple way to get a "city/area" if lat/lon are known, or use a dedicated location field if backend provides it
  const locationDisplay = `Lat: ${activity.latitude.toFixed(2)}, Lon: ${activity.longitude.toFixed(2)}`;

  return (
    <div style={cardStyle}>
      <h3 style={titleStyle} title={activity.title}>{activity.title}</h3>
      <p style={descriptionStyle}>
        {activity.description || 'No description available.'}
      </p>
      <p style={locationStyle}>Location: {locationDisplay}</p>
      <Link to={`/activities/${activity.id}`} style={buttonStyle} className="button-link primary">
        View Details
      </Link>
    </div>
  );
};

export default ActivityCard;