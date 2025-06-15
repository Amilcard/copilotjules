import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import reservationService, { UserReservationRequest, ApiError as ReservationApiError } from '../services/reservationService';
import childProfileService, { ChildProfile, ApiError as ChildProfileApiError } from '../services/childProfileService'; // To fetch child's name
import ReservationRequestCard from '../components/Dashboard/ReservationRequestCard'; // Re-use the card
import { useToast } from '../context/ToastContext';

const ChildActivitiesPage: React.FC = () => {
  const { child_id } = useParams<{ child_id: string }>();
  const [childReservations, setChildReservations] = useState<UserReservationRequest[]>([]);
  const [childInfo, setChildInfo] = useState<Partial<ChildProfile>>({}); // Store child's first/last name
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchChildNameAndReservations = useCallback(async () => {
    if (!child_id) {
      setError("ID de l'enfant manquant.");
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      // Fetch child's reservations
      const reservationsData = await reservationService.getMyReservationRequests(child_id);
      setChildReservations(reservationsData);

      // Fetch child's name for the title - or pick from first reservation if available and consistent
      if (reservationsData.length > 0 && reservationsData[0].child_first_name) {
        setChildInfo({ 
            first_name: reservationsData[0].child_first_name, 
            last_name: reservationsData[0].child_last_name 
        });
      } else {
        // Fallback: if no reservations or reservations don't have child name (should not happen with current backend logic)
        // Try to fetch all child profiles and find the specific one.
        // This is less efficient if only one child's name is needed.
        // A dedicated getChildProfileById(id) in childProfileService would be better.
        // For now, if reservationsData[0] has the name, we use it. Otherwise, we might not have the name easily.
        // Let's assume for now the name will come with the reservation data.
        // If not, we'd need to fetch child profiles list here or pass child name via route state.
        const profiles = await childProfileService.getChildProfiles(); // Less ideal if many children
        const currentChild = profiles.find(p => p.id === parseInt(child_id, 10));
        if (currentChild) {
            setChildInfo({ first_name: currentChild.first_name, last_name: currentChild.last_name });
        } else {
            addToast("Impossible de trouver les détails de l'enfant.", "error");
        }
      }

    } catch (err) {
      const apiError = err as ReservationApiError | ChildProfileApiError; // Can be from either service
      const message = apiError.message || "Erreur lors de la récupération des informations.";
      setError(message);
      addToast(message, "error");
      console.error("Error fetching child activities/info:", apiError);
    } finally {
      setIsLoading(false);
    }
  }, [child_id, addToast]);

  useEffect(() => {
    fetchChildNameAndReservations();
  }, [fetchChildNameAndReservations]);

  // Styles
  const pageContainerStyle: React.CSSProperties = { maxWidth: '800px', margin: '2rem auto', padding: 'var(--global-padding, 16px)', fontFamily: 'var(--font-primary, Montserrat)' };
  const titleStyle: React.CSSProperties = { color: 'var(--color-blue-primary, #0055A4)', marginBottom: '1.5rem', textAlign: 'center' };
  const loadingErrorStyle: React.CSSProperties = { textAlign: 'center', fontSize: '1rem', padding: '20px', color: 'var(--color-text-secondary, #555)' };

  const childName = childInfo.first_name ? `${childInfo.first_name} ${childInfo.last_name || ''}`.trim() : `l'enfant (ID: ${child_id})`;

  return (
    <div style={pageContainerStyle}>
      <h1 style={titleStyle}>Activités pour {childName}</h1>
      
      <Link to="/dashboard/my-children" style={{ display: 'inline-block', marginBottom: '1.5rem', color: 'var(--color-blue-primary)' }}>
        &larr; Retour à la gestion des enfants
      </Link>

      {isLoading && <p style={loadingErrorStyle}>Chargement des activités...</p>}
      {error && <p style={{ ...loadingErrorStyle, color: 'var(--color-error, red)' }}>Erreur: {error}</p>}
      
      {!isLoading && !error && childReservations.length === 0 && (
        <div style={{...loadingErrorStyle, border: '1px dashed var(--color-border-soft, #ddd)', padding: '30px', borderRadius: 'var(--card-border-radius)'}}>
          <p>Aucune activité réservée ou en attente pour {childName}.</p>
          <Link to="/search" className="button-link primary" style={{marginTop: '1rem', textDecoration: 'none'}}>
            Explorer les activités
          </Link>
        </div>
      )}

      {!isLoading && !error && childReservations.length > 0 && (
        <div>
          {childReservations.map(request => (
            <ReservationRequestCard key={request.reservation_id} request={request} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ChildActivitiesPage;
