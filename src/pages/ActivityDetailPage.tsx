import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import activityService, { Activity, ApiError as ActivityApiError } from '../services/activityService';
import reservationService, { CreateReservationPayload, ApiError as ReservationApiError } from '../services/reservationService';
import childProfileService, { ChildProfile, ApiError as ChildProfileApiError } from '../services/childProfileService';
import authService from '../services/authService';
import { useToast } from '../context/ToastContext';
import SimpleMapDisplay from '../components/Map/SimpleMapDisplay';

// Helper to render text or a fallback
const TextDisplay: React.FC<{ label?: string; value: string | number | null | undefined; fallback?: string; isHtml?: boolean }> = 
  ({ label, value, fallback = "Non spécifié", isHtml = false }) => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return (
      <div className="detail-item">
        {label && <span className="detail-label">{label}: </span>}
        <span className="detail-value fallback">{fallback}</span>
      </div>
    );
  }
  if (isHtml) {
    return (
         <div className="detail-item">
            {label && <p><strong className="detail-label">{label}:</strong></p>}
            <div className="detail-value" dangerouslySetInnerHTML={{ __html: String(value) }} />
        </div>
    );
  }
  return (
    <div className="detail-item">
      {label && <strong className="detail-label">{label}: </strong>}
      <span className="detail-value">{String(value)}</span>
    </div>
  );
};

const ActivityDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [reservationStatusMessage, setReservationStatusMessage] = useState<string | null>(null);
  
  const [childProfiles, setChildProfiles] = useState<ChildProfile[]>([]);
  const [isLoadingChildProfiles, setIsLoadingChildProfiles] = useState(false);
  const [reservationFor, setReservationFor] = useState<'self' | string>('self'); // 'self' or child_id as string

  const currentUser = authService.getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useToast();

  const fetchActivityDetails = useCallback(async () => {
    if (!id) {
      setError('Activity ID is missing.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await activityService.getActivityById(id);
      setActivity(data);
    } catch (err) {
      const apiError = err as ActivityApiError;
      setError(apiError.message || 'Failed to fetch activity details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  const fetchChildProfilesForParent = useCallback(async () => {
    if (currentUser && (currentUser.role === 'parent' || authService.isAuthenticated())) { // Assume any logged-in user might be a parent
      setIsLoadingChildProfiles(true);
      try {
        const profiles = await childProfileService.getChildProfiles();
        setChildProfiles(profiles);
      } catch (err) {
        const apiError = err as ChildProfileApiError;
        console.error("Failed to fetch child profiles:", apiError.message);
        // Non-critical, don't set main page error, just log or show small toast
        addToast("Impossible de charger les profils enfants.", "info");
      } finally {
        setIsLoadingChildProfiles(false);
      }
    }
  }, [currentUser, addToast]);

  useEffect(() => {
    fetchActivityDetails();
    fetchChildProfilesForParent();
  }, [fetchActivityDetails, fetchChildProfilesForParent]);


  const handleDelete = async () => {
    if (!activity || !window.confirm('Are you sure you want to delete this activity?')) return;
    try {
      await activityService.deleteActivity(String(activity.id));
      addToast("Activité supprimée avec succès.", "success");
      navigate('/activities'); 
    } catch (err) {
      const apiError = err as ActivityApiError;
      setError(`Failed to delete activity: ${apiError.message}`);
      addToast(apiError.message || "Erreur lors de la suppression.", "error");
    }
  };

  const handleRequestReservation = async () => {
    if (!currentUser) {
      addToast("Veuillez vous connecter pour demander une réservation.", "info");
      navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
      return;
    }
    if (!activity) return;

    const payload: CreateReservationPayload = {
      activity_id: activity.id,
      number_of_participants: 1, // Defaulting to 1 for now
    };

    if (reservationFor !== 'self') {
      payload.child_profile_id = parseInt(reservationFor, 10);
    }

    setIsSubmittingReservation(true);
    setReservationStatusMessage(null); 
    try {
      await reservationService.createReservationRequest(payload);
      addToast("Votre demande de réservation a été envoyée avec succès !", 'success');
      setReservationStatusMessage("Demande envoyée ! L'organisateur vous contactera.");
    } catch (err) {
      const resError = err as ReservationApiError;
      if (resError.message && resError.message.includes("excède les places disponibles")) {
        addToast("Désolé, il n'y a plus de places disponibles ou votre demande excède la capacité.", 'error');
      } else {
        addToast(resError.message || "Erreur lors de l'envoi de la demande. Veuillez réessayer.", 'error');
      }
      setReservationStatusMessage(resError.message || "Erreur lors de la demande.");
    } finally {
      setIsSubmittingReservation(false);
    }
  };

  if (isLoading) return <div className="page-container"><p>Chargement des détails de l'activité...</p></div>;
  if (error && !activity) return <div className="page-container"><p style={{ color: 'red' }}>Erreur: {error}</p></div>;
  if (!activity) return <div className="page-container"><p>Activité non trouvée.</p></div>;

  const fullAddress = [activity.address_street, activity.address_postal_code, activity.address_city].filter(Boolean).join(', ');
  const availableSpots = (activity.max_participants != null && activity.current_participants != null) 
    ? activity.max_participants - activity.current_participants 
    : activity.max_participants;

  return (
    <div className="page-container activity-detail-page global-padding">
      {activity.header_image_url ? (
        <img src={activity.header_image_url} alt={activity.title} className="activity-header-image" />
      ) : (
        <div className="activity-header-placeholder"><span>Image d'en-tête à venir</span></div>
      )}

      <div className="activity-content-card">
        <div className="main-info-section">
            <h1 className="activity-title">{activity.title}</h1>
            <TextDisplay label="Quand" value={activity.activity_date_text} fallback="Date et heure à venir" />
            {activity.type && <TextDisplay label="Type" value={activity.type} />}
            
            {currentUser && currentUser.id === activity.user_id && (
                <div className="admin-actions">
                    <Link to={`/activities/${activity.id}/edit`} className="button-link edit">Modifier</Link>
                    <button onClick={handleDelete} className="button-link delete">Supprimer</button>
                </div>
            )}
             {error && !activity && <p style={{ color: 'red' }}>Erreur: {error}</p>} {/* Only show general error if activity failed to load */}

            <TextDisplay label="Description" value={activity.description} isHtml={true} />

            <div className="reservation-section">
                {currentUser && childProfiles.length > 0 && (
                    <div className="form-group reservation-for-selector">
                        <label htmlFor="reservationFor">Réserver pour :</label>
                        <select 
                            id="reservationFor" 
                            value={reservationFor} 
                            onChange={(e) => setReservationFor(e.target.value)}
                            disabled={isSubmittingReservation || isLoadingChildProfiles}
                        >
                            <option value="self">Moi-même ({currentUser.username})</option>
                            {childProfiles.map(child => (
                                <option key={child.id} value={String(child.id)}>
                                    {child.first_name} {child.last_name}
                                </option>
                            ))}
                        </select>
                        {isLoadingChildProfiles && <small> Chargement des profils enfants...</small>}
                    </div>
                )}
                <button 
                    onClick={handleRequestReservation} 
                    disabled={isSubmittingReservation || (availableSpots !== undefined && availableSpots <= 0)}
                    className="button-link primary reservation-button"
                >
                    {isSubmittingReservation ? "Envoi en cours..." : "Demander une réservation"}
                </button>
                {availableSpots !== undefined && availableSpots <= 0 && <p className="spots-unavailable-message">Plus de places disponibles.</p>}
                {reservationStatusMessage && <p className={`reservation-status-message ${reservationStatusMessage.startsWith("Erreur") ? 'error' : 'success'}`}>{reservationStatusMessage}</p>}
            </div>
        </div>

        <div className="details-grid">
            <section className="detail-section">
                <h3><span role="img" aria-label="Lieu">📍</span> Lieu</h3>
                <TextDisplay label="Nom du lieu" value={activity.location_name} />
                <TextDisplay label="Adresse" value={fullAddress} />
                {activity.latitude != null && activity.longitude != null && (
                    <div style={{ height: '250px', marginTop: '1rem', borderRadius: 'var(--card-border-radius)' }}>
                    <SimpleMapDisplay latitude={Number(activity.latitude)} longitude={Number(activity.longitude)} markerText={activity.location_name || activity.title} />
                    </div>
                )}
            </section>
            <section className="detail-section">
                <h3><span role="img" aria-label="Public">🎯</span> Public Cible</h3>
                <TextDisplay value={activity.target_audience_text} fallback="Détails du public à préciser." />
                {(activity.min_age != null || activity.max_age != null) && (
                    <p className="detail-item detail-value">Âge: {activity.min_age ?? 'Non spécifié'} - {activity.max_age ?? 'Non spécifié'} ans</p>
                )}
            </section>
            <section className="detail-section">
                <h3><span role="img" aria-label="Horaires">⏰</span> Créneaux Horaires</h3>
                <TextDisplay value={activity.schedule_text} fallback="Informations sur les créneaux à venir." />
            </section>
            <section className="detail-section">
                <h3><span role="img" aria-label="Tarif">💶</span> Tarif</h3>
                <TextDisplay label="Prix" value={activity.price != null ? `${Number(activity.price).toFixed(2)} €` : null} fallback="Prix non spécifié ou gratuit" />
                <TextDisplay label="Modalités de paiement" value={activity.payment_options} />
            </section>
            <section className="detail-section">
                <h3><span role="img" aria-label="Aides financières">💰</span> Aides Financières</h3>
                 <TextDisplay value={activity.financial_aid_text} fallback={activity.accepts_financial_aid ? "Cet organisme accepte certaines aides financières." : "Informations sur les aides non spécifiées."} />
            </section>
            <section className="detail-section">
                <h3><span role="img" aria-label="Participants">👥</span> Participants</h3>
                {activity.max_participants != null ? (
                    <TextDisplay label="Places" value={`${activity.current_participants ?? 0} / ${activity.max_participants}`} />
                ) : ( <TextDisplay label="Participants actuels" value={activity.current_participants} fallback="Information non disponible"/> )}
                 {availableSpots !== undefined && availableSpots > 0 && activity.max_participants != null && <p className="detail-value fallback">Places restantes: {availableSpots}</p>}
            </section>
            <section className="detail-section">
                <h3><span role="img" aria-label="Accessibilité">♿</span> Accessibilité</h3>
                <TextDisplay value={activity.accessibility_info} fallback="Information sur l'accessibilité non spécifiée." />
            </section>
            <section className="detail-section">
                <h3><span role="img" aria-label="Éco-mobilité">🚲</span> Éco-Mobilité</h3>
                <TextDisplay value={activity.eco_mobility_text} fallback="Informations sur l'éco-mobilité à venir." />
            </section>
            <section className="detail-section">
                <h3><span role="img" aria-label="Contact">📞</span> Contact</h3>
                {activity.contact_email && <p className="detail-item"><a href={`mailto:${activity.contact_email}`}>{activity.contact_email}</a></p>}
                {activity.contact_phone && <p className="detail-item"><a href={`tel:${activity.contact_phone}`}>{activity.contact_phone}</a></p>}
                {!activity.contact_email && !activity.contact_phone && <p className="detail-value fallback">Contact non spécifié.</p>}
            </section>
            {activity.additional_info_text && (
                <section className="detail-section detail-section-full-width">
                    <h3><span role="img" aria-label="Informations supplémentaires">ℹ️</span> Informations Supplémentaires</h3>
                    <TextDisplay value={activity.additional_info_text} />
                </section>
            )}
        </div>
        <Link to="/search" className="button-link" style={{marginTop: '2rem', display: 'inline-block'}}>Retour à la recherche</Link>
      </div>
      <style jsx global>{`
        /* ... existing styles ... */
        .reservation-section { margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--color-border-soft); }
        .reservation-button { padding: 0.8em 1.5em; font-size: 1.1rem; }
        .reservation-button:disabled { background-color: #ccc; cursor: not-allowed; }
        .spots-unavailable-message { color: var(--color-error, #E74C3C); font-weight: bold; margin-top: 0.5rem; }
        .reservation-status-message { margin-top: 0.5rem; font-size: 0.9rem; font-weight: var(--font-weight-semibold); }
        .reservation-status-message.error { color: var(--color-error, #E74C3C); }
        .reservation-status-message.success { color: var(--color-success, #2ECC71); } /* Added success class */
        .reservation-for-selector { margin-bottom: 1rem; }
        .reservation-for-selector label { display: block; margin-bottom: 0.3rem; font-weight: var(--font-weight-semibold); font-size: 0.9rem; }
        .reservation-for-selector select { 
            padding: 8px 10px; 
            border-radius: var(--button-border-radius, 6px); 
            border: 1px solid var(--color-border-soft, #ccc);
            font-family: var(--font-primary);
            font-size: 0.9rem;
            min-width: 200px;
        }

        /* Existing styles from previous diff, ensure they are included */
        .activity-detail-page { max-width: 900px; margin: 1rem auto; }
        .activity-header-image { width: 100%; height: 300px; object-fit: cover; border-radius: var(--card-border-radius); margin-bottom: 1.5rem; background-color: var(--color-border-soft); }
        .activity-header-placeholder { width: 100%; height: 300px; background-color: var(--color-blue-primary-light, #E7F3FF); border-radius: var(--card-border-radius); margin-bottom: 1.5rem; display:flex; align-items:center; justify-content:center; color: var(--color-blue-primary); font-style:italic;}
        .activity-content-card { background-color: var(--color-background-card, #FFF); padding: 1.5rem; border-radius: var(--card-border-radius); box-shadow: 0 4px 15px var(--color-shadow, rgba(0,0,0,0.1));}
        .activity-title { font-size: 2.2rem; color: var(--color-blue-primary); margin-bottom: 0.75rem; }
        .main-info-section { margin-bottom: 1rem; }
        .admin-actions { margin: 0.75rem 0; display: flex; gap: 1rem; }
        .admin-actions .button-link.edit { color: var(--color-blue-primary); }
        .admin-actions .button-link.delete { color: var(--color-error, #E74C3C); background: none; border: none; padding:0; text-decoration: underline; font-size: 0.9rem; }
        .details-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .detail-section { margin-bottom: 1rem; }
        .detail-section h3 { font-size: 1.2rem; color: var(--color-blue-primary); margin-bottom: 0.75rem; border-bottom: 1px solid var(--color-border-soft); padding-bottom: 0.5rem; display: flex; align-items: center;}
        .detail-section h3 span[role="img"] { margin-right: 0.5rem; font-size: 1.3rem;}
        .detail-item { margin-bottom: 0.5rem; }
        .detail-label { font-weight: var(--font-weight-semibold); color: var(--color-text-primary); }
        .detail-value { color: var(--color-text-secondary); white-space: pre-wrap; }
        .detail-value.fallback { font-style: italic; }
        .detail-section-full-width { grid-column: 1 / -1; } 
      `}</style>
    </div>
  );
};

export default ActivityDetailPage;
