import React, { useEffect, useState, useMemo } from 'react';
import reservationService, { UserReservationRequest, ApiError } from '../services/reservationService';
import ReservationRequestCard from '../components/Dashboard/ReservationRequestCard';
import DashboardSidebar from '../components/Dashboard/DashboardSidebar';
import { Link } from 'react-router-dom';

const ParentDashboardPage: React.FC = () => {
  const [reservations, setReservations] = useState<UserReservationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReservations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await reservationService.getMyReservationRequests();
        setReservations(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || "Erreur lors de la récupération de vos demandes de réservation.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReservations();
  }, []);

  const activeReservationsCount = useMemo(() => {
    return reservations.filter(r => r.reservation_status === 'confirmed' || r.reservation_status === 'pending').length;
  }, [reservations]);

  // Styles
  const dashboardLayoutSyle: React.CSSProperties = {
    display: 'flex',
    minHeight: 'calc(100vh - var(--header-height, 60px))', 
    fontFamily: 'var(--font-primary, Montserrat)',
    backgroundColor: 'var(--color-background-page, #F5F5F5)',
  };

  const mainContentStyle: React.CSSProperties = {
    flexGrow: 1,
    padding: 'var(--global-padding, 24px)',
    overflowY: 'auto',
  };
  
  const pageTitleStyle: React.CSSProperties = {
    color: 'var(--color-blue-primary, #0055A4)',
    fontSize: '1.8rem', 
    marginBottom: '1.5rem',
  };

  const summaryCardsContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--global-padding, 16px)',
    marginBottom: '2rem',
  };

  const summaryCardStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-background-card, #FFFFFF)',
    borderRadius: 'var(--card-border-radius, 8px)',
    boxShadow: '0 2px 4px var(--color-shadow, rgba(0,0,0,0.05))', // Softer shadow as per Screen 6
    padding: 'var(--global-padding, 16px)',
    flex: '1 1 200px', 
    minWidth: '180px',
    height: '120px', // Spec: approx 200x120px
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  };
  
  const summaryCardTitleStyle: React.CSSProperties = {
    fontSize: '1rem', // Approx 16px
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-text-primary, #333)', // Darker text for title
    marginBottom: '0.5rem',
  };
  
  const summaryCardContentStyle: React.CSSProperties = {
    fontSize: '1.8rem', // Larger for numbers
    fontWeight: 'var(--font-weight-bold, 700)',
    color: 'var(--color-blue-primary, #0055A4)',
    textAlign: 'right',
  };
  
  const summaryCardLinkStyle: React.CSSProperties = {
    fontSize: '0.9rem',
    fontWeight: 'var(--font-weight-semibold, 600)',
    color: 'var(--color-orange-primary, #FF6F61)',
    textDecoration: 'underline',
    display: 'block',
    textAlign: 'right',
    marginTop: '8px',
  };

  const sectionTitleStyle: React.CSSProperties = {
    color: 'var(--color-blue-primary, #0055A4)',
    fontSize: '1.5rem',
    marginTop: '1rem',
    marginBottom: '1rem',
    borderBottom: '2px solid var(--color-orange-primary, #FF6F61)',
    paddingBottom: '0.5rem',
  };

  const loadingErrorStyle: React.CSSProperties = {
    textAlign: 'center',
    fontSize: '1rem',
    padding: '20px',
    color: 'var(--color-text-secondary, #555)',
  };

  return (
    <div style={dashboardLayoutSyle}>
      <DashboardSidebar />
      <main style={mainContentStyle}>
        <h1 style={pageTitleStyle}>Mon Tableau de Bord Parent</h1>

        <section style={summaryCardsContainerStyle}>
          <div style={summaryCardStyle}>
            <h3 style={summaryCardTitleStyle}>Mes Activités</h3>
            {isLoading ? (
              <p style={summaryCardContentStyle}>...</p>
            ) : (
              <p style={summaryCardContentStyle}>{activeReservationsCount}</p>
            )}
            <span style={{fontSize: '0.85rem', color: 'var(--color-text-secondary)', textAlign: 'right'}}>activité(s) & demande(s)</span>
          </div>
          <div style={summaryCardStyle}>
            <h3 style={summaryCardTitleStyle}>Aides Financières</h3>
            <p style={{...summaryCardContentStyle, fontSize: '1.2rem', color: 'var(--color-text-secondary)'}}>Consultez vos options</p>
            <Link to="/dashboard/aides-financieres" style={summaryCardLinkStyle}>
              Voir les aides
            </Link>
          </div>
          <div style={summaryCardStyle}>
            <h3 style={summaryCardTitleStyle}>Notifications</h3>
            <p style={{...summaryCardContentStyle, fontSize: '1.2rem', color: 'var(--color-text-secondary)'}}>Aucun rappel important</p> {/* Placeholder */}
            <Link to="/dashboard/notifications-rappels" style={summaryCardLinkStyle}>
              Voir les notifications
            </Link>
          </div>
        </section>

        <section>
          <h2 style={sectionTitleStyle}>Mes Demandes d'Inscription aux Activités</h2>
          {isLoading && <p style={loadingErrorStyle}>Chargement de vos demandes...</p>}
          {error && <p style={{ ...loadingErrorStyle, color: 'var(--color-error, red)' }}>Erreur: {error}</p>}
          
          {!isLoading && !error && reservations.length === 0 && (
            <div style={{...loadingErrorStyle, border: '1px dashed var(--color-border-soft, #ddd)', padding: '30px', borderRadius: 'var(--card-border-radius)'}}>
              <p>Vous n'avez aucune demande d'inscription pour le moment.</p>
              <Link to="/search" className="button-link primary" style={{marginTop: '1rem', textDecoration: 'none'}}>
                Explorer les activités
              </Link>
            </div>
          )}

          {!isLoading && !error && reservations.length > 0 && (
            <div>
              {reservations.map(request => (
                <ReservationRequestCard key={request.reservation_id} request={request} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default ParentDashboardPage;