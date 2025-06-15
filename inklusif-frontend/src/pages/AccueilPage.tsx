import React, { useEffect, useState } from 'react';
import InfoCard from '../components/Common/InfoCard';
import MultiStepProgressBar from '../components/Common/MultiStepProgressBar';
import activityService, { Activity } from '../services/activityService';
import geolocationService, { AppGeolocationCoordinates, GeolocationError } from '../services/geolocationService';
import territorySubscriptionService, { TerritorySubscriptionResponse } from '../services/territorySubscriptionService';
import ActivityCard from '../components/Activity/ActivityCard';
import DetailedOnboardingFlow from '../components/Onboarding/DetailedOnboardingFlow';
import RegistrationPrompt from '../components/Common/RegistrationPrompt';
import authService from '../services/authService';

// --- Icons (Simple SVGs for now) ---
const LogoPlaceholder: React.FC<{ size?: string }> = ({ size = "32px" }) => (
    <div style={{ width: size, height: size, backgroundColor: '#0055A4', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFFFFF', fontWeight: 'bold', fontSize: `calc(${size} * 0.6)` }}>IK</div>
);

const MapPinIcon: React.FC<{ size?: string, color?: string }> = ({ size = "24px", color = "#4A90E2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={size} height={size}>
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
    </svg>
);

const NotificationBadge: React.FC<{ children?: React.ReactNode, color?: string }> = ({ children, color = 'red' }) => (
    <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: color, color: 'white', borderRadius: '50%', padding: children ? '2px 5px' : '0', minWidth: children ? 'auto' : '10px', height: children ? 'auto' : '10px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid white' }}>
        {children || ''}
    </span>
);
// --- End Icons ---

interface TerritoryStatus {
  isCovered: boolean;
  territoryName: string;
  message: string;
  iconBadge?: '!' | '?'; 
}

// Simulated territory coverage logic
interface CheckTerritoryParams {
    latitude?: number;
    longitude?: number;
    postalCode?: string;
    source: 'geolocation' | 'postalcode';
}

const checkTerritoryCoverage = (params: CheckTerritoryParams): TerritoryStatus => {
  const { latitude, longitude, postalCode, source } = params;

  if (source === 'geolocation') {
    if (latitude === undefined || longitude === undefined) {
      return { isCovered: false, territoryName: "Inconnue (géoloc.)", message: "Nous n'avons pas pu déterminer votre localisation actuelle. Certaines fonctionnalités peuvent être limitées. Vous pouvez explorer les activités nationales ou vérifier un code postal.", iconBadge: '?' };
    }
    // Example: "Territoire Alpha" is covered by geo
    if (latitude >= 40 && latitude <= 50 && longitude >= 0 && longitude <= 10) {
      return { isCovered: true, territoryName: "Territoire Alpha (Géolocalisé)", message: "Bienvenue dans le Territoire Alpha (détecté par géolocalisation) ! Profitez de toutes nos fonctionnalités." };
    } else {
      return { isCovered: false, territoryName: "Hors Couverture (géoloc.)", message: "Votre localisation actuelle n'est pas encore couverte. Vous pouvez consulter les activités disponibles, ou vérifier un code postal ci-dessous.", iconBadge: '!' };
    }
  } else if (source === 'postalcode') {
    if (!postalCode || postalCode.trim().length === 0) {
        return { isCovered: false, territoryName: "Code Postal Invalide", message: "Veuillez entrer un code postal valide.", iconBadge: '?' };
    }
    const trimmedPostalCode = postalCode.trim();
    // Simulate coverage based on postal code prefixes
    if (trimmedPostalCode.startsWith("75")) { // Paris
      return { isCovered: true, territoryName: `Zone de Paris (${trimmedPostalCode})`, message: `Bonne nouvelle ! La zone du code postal ${trimmedPostalCode} (Paris) est couverte. Explorez les activités !` };
    } else if (trimmedPostalCode.startsWith("13")) { // Marseille
      return { isCovered: true, territoryName: `Zone de Marseille (${trimmedPostalCode})`, message: `Bonne nouvelle ! La zone du code postal ${trimmedPostalCode} (Marseille) est couverte.` };
    } else if (trimmedPostalCode.startsWith("69")) { // Lyon (example of not covered by this simulation)
      return { isCovered: false, territoryName: `Zone de Lyon (${trimmedPostalCode})`, message: `La zone du code postal ${trimmedPostalCode} (Lyon) n'est pas encore couverte. Laissez-nous votre email pour être notifié !`, iconBadge: '!' };
    } else {
      return { isCovered: false, territoryName: `Zone ${trimmedPostalCode}`, message: `La zone du code postal ${trimmedPostalCode} n'est pas encore couverte. Vous pouvez vous inscrire aux notifications pour cette zone.`, iconBadge: '!' };
    }
  }
  // Fallback, should not be reached if source is always provided
  return { isCovered: false, territoryName: "Inconnue", message: "Impossible de vérifier la couverture pour le moment.", iconBadge: '?' };
};


const AccueilPage: React.FC = () => {
  const [allActivities, setAllActivities] = useState<Activity[]>([]); // Store all fetched activities
  const [displayedActivities, setDisplayedActivities] = useState<Activity[]>([]); // Subset for display
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  
  const [userLocation, setUserLocation] = useState<AppGeolocationCoordinates | null>(null);
  const [locationError, setLocationError] = useState<GeolocationError | null>(null);
  const [territoryStatus, setTerritoryStatus] = useState<TerritoryStatus | null>(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true); // For geolocation
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false); // For postal code check

  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // State for territory subscription form
  const [subscriptionEmail, setSubscriptionEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [subscriptionMessage, setSubscriptionMessage] = useState<string | null>(null);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // State for postal code input
  const [postalCodeInput, setPostalCodeInput] = useState('');
  const [postalCodeStatusMessage, setPostalCodeStatusMessage] = useState<string | null>(null);


  const [showRegistrationPrompt, setShowRegistrationPrompt] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    // Check for DETAILED onboarding tutorial flag
    const hasSeenDetailedOnboarding = localStorage.getItem('hasSeenDetailedOnboarding');
    if (hasSeenDetailedOnboarding !== 'true' && !isAuthenticated) { 
      setShowOnboarding(true);
    }

    // Determine if registration prompt should be shown (only for guests)
    if (!isAuthenticated) {
        // Check session storage for dismissal for this session
        const dismissedThisSession = sessionStorage.getItem('registrationPromptDismissed');
        if (dismissedThisSession !== 'true') {
            setShowRegistrationPrompt(true);
        }
    }


    // Fetch Activities
    const fetchActivities = async () => {
      setIsLoadingActivities(true);
      setActivitiesError(null);
      try {
        const data = await activityService.getAllActivities();
        setAllActivities(data); // Store all activities
        setDisplayedActivities(selectRandomActivities(data, 6)); // Display initial random set (e.g., 6)
      } catch (err) {
        const apiError = err as any; // Using 'any' to avoid TypeScript error
        setActivitiesError(apiError.message || 'Failed to fetch activities.');
        console.error('Fetch activities error:', apiError);
      } finally {
        setIsLoadingActivities(false);
      }
    };

    // Fetch Geolocation and then check territory
    const fetchLocationAndTerritory = async () => {
        setIsLoadingLocation(true);
        try {
            const position = await geolocationService.getCurrentPosition();
            setUserLocation(position);
            setLocationError(null); // Clear previous location errors
            setTerritoryStatus(checkTerritoryCoverage({ latitude: position.latitude, longitude: position.longitude, source: 'geolocation' }));
        } catch (error) {
            const geoError = error as GeolocationError;
            setLocationError(geoError);
            console.warn('Geolocation error on AccueilPage:', geoError.message);
            setTerritoryStatus(checkTerritoryCoverage({ source: 'geolocation' })); // Geolocation failed
        } finally {
            setIsLoadingLocation(false);
        }
    };

    fetchActivities();
    fetchLocationAndTerritory();
  }, []);

  // Helper function to select random activities
  const selectRandomActivities = (activities: Activity[], count: number): Activity[] => {
    if (!activities || activities.length === 0) return [];
    const shuffled = [...activities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, shuffled.length));
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenDetailedOnboarding', 'true'); // Use new flag
    setShowOnboarding(false);
  };

  const handleSubscriptionEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSubscriptionEmail(e.target.value);
    if (subscriptionMessage) setSubscriptionMessage(null);
    if (subscriptionError) setSubscriptionError(null);
  };

  const handleTerritorySubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscriptionEmail.trim()) { setSubscriptionError("L'adresse e-mail est requise."); return; }
    if (!/\S+@\S+\.\S+/.test(subscriptionEmail)) { setSubscriptionError("Veuillez entrer une adresse e-mail valide."); return; }
    if (!territoryStatus || !territoryStatus.territoryName || territoryStatus.isCovered) { setSubscriptionError("Impossible de s'abonner pour ce territoire."); return; }

    setIsSubscribing(true);
    setSubscriptionMessage(null);
    setSubscriptionError(null);
    try {
      const identifier = territoryStatus.territoryName.includes("Inconnue") ? postalCodeInput.trim() || "localisation_inconnue" : territoryStatus.territoryName;
      const response = await territorySubscriptionService.subscribe(subscriptionEmail, identifier);
      setSubscriptionMessage(response.message || "Merci ! Nous vous informerons si votre territoire devient couvert.");
      setSubscriptionEmail('');
    } catch (err) {
      const apiErr = err as any;
      setSubscriptionError(apiErr.message || "Erreur lors de l'inscription. Veuillez réessayer.");
    } finally {
      setIsSubscribing(false);
    }
  };
  
  const handlePostalCodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPostalCodeInput(e.target.value);
    if (postalCodeStatusMessage) setPostalCodeStatusMessage(null); // Clear message on new input
  };

  const handlePostalCodeCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    const pc = postalCodeInput.trim();
    if (!pc) {
      setPostalCodeStatusMessage("Veuillez entrer un code postal.");
      return;
    }
    // Basic French postal code format (5 digits) - can be enhanced
    if (!/^\d{5}$/.test(pc)) {
        setPostalCodeStatusMessage("Format de code postal invalide (attendu: 5 chiffres).");
        return;
    }

    setIsLoadingPostalCode(true); // Indicate loading for postal code check
    setPostalCodeStatusMessage(`Vérification pour ${pc}...`);
    // Simulate network delay for postal code check
    await new Promise(resolve => setTimeout(resolve, 500));

    const newTerritoryStatus = checkTerritoryCoverage({ postalCode: pc, source: 'postalcode' });
    setTerritoryStatus(newTerritoryStatus); // Update main territory status
    setIsLoadingPostalCode(false);
    if (newTerritoryStatus.isCovered) {
        setPostalCodeStatusMessage(null); // Clear message if now covered
        // Clear subscription form fields as it might disappear or be irrelevant
        setSubscriptionEmail('');
        setSubscriptionError(null);
        setSubscriptionMessage(null);
    } else {
        setPostalCodeStatusMessage(null); // Let main territory message bar show the status
    }
  };


  const handleExplorerPlusClick = () => {
    setDisplayedActivities(selectRandomActivities(allActivities, 6)); 
  };

  // CSS for fade-in animation (can be moved to a CSS file)
  const animationStyles = `
    .activity-card-item {
      animation: fadeIn 0.5s ease-in-out forwards;
      opacity: 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .accueil-container {
      max-width: 1200px;
      margin: 0 auto;
    }
  `;

  return (
    <div className="accueil-container global-padding" style={{ paddingTop: 'var(--global-padding)' }}>
      <style>{animationStyles}</style>
      
      <DetailedOnboardingFlow 
        isVisible={showOnboarding} 
        onComplete={handleOnboardingComplete} 
      />
      
      {/* Header Section */}
      <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <LogoPlaceholder size="32px" />
            <h1 style={{ 
              fontFamily: 'var(--font-primary)', 
              fontSize: '24px', 
              fontWeight: 'var(--font-weight-semibold)', 
              color: '#0055A4',
              marginLeft: '12px',
              marginBlock: '0px'
            }}>
              InKlusif
            </h1>
        </div>
        <div style={{ position: 'relative', cursor: 'pointer' }} title={territoryStatus?.territoryName || (locationError?.message || 'Fetching location...')}>
            <MapPinIcon />
            {territoryStatus?.iconBadge && (
                 <NotificationBadge>{territoryStatus.iconBadge}</NotificationBadge>
            )}
        </div>
      </header>

      {/* Progress Bar */}
      <div style={{ margin: '16px 0' }}>
        <MultiStepProgressBar currentStep={2} totalSteps={5} />
      </div>

      {/* Territory Message Section & Subscription Form */}
      {!isLoadingLocation && territoryStatus && (
        <div className="territory-info-bar" style={{ 
            padding: '15px', marginBottom: '24px', borderRadius: '8px', 
            backgroundColor: territoryStatus.isCovered ? '#E7F3FF' : '#FFF0E9',
            color: territoryStatus.isCovered ? '#0055A4' : '#D95B4E',
            border: `1px solid ${territoryStatus.isCovered ? '#B3D4FF' : '#FFD1C8'}`,
            textAlign: 'center',
        }}>
            <p style={{margin:'0 0 15px 0'}}>{territoryStatus.message}</p>
            
            {/* Subscription form for non-covered but known (geo or postal) territories */}
            {!territoryStatus.isCovered && !territoryStatus.territoryName.toLowerCase().includes("inconnue") && !territoryStatus.territoryName.toLowerCase().includes("invalide") && (
              <form onSubmit={handleTerritorySubscription} className="subscription-form" style={{marginBottom: '15px'}}>
                <p style={{fontSize: '0.9em', marginBottom: '8px'}}>Soyez notifié quand nous couvrirons le territoire : <strong>{territoryStatus.territoryName}</strong></p>
                <input type="email" value={subscriptionEmail} onChange={handleSubscriptionEmailChange} placeholder="Votre adresse e-mail" disabled={isSubscribing} style={{ padding: '8px 10px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '8px', minWidth: '220px', fontSize: '0.9rem' }} />
                <button type="submit" disabled={isSubscribing} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', backgroundColor: '#CCCCCC', color: '#333333', cursor: isSubscribing ? 'wait' : 'pointer', fontSize: '0.9rem' }}>
                  {isSubscribing ? 'Envoi...' : 'Me notifier'}
                </button>
                {subscriptionMessage && <p style={{ color: 'green', fontSize: '0.85em', marginTop: '5px' }}>{subscriptionMessage}</p>}
                {subscriptionError && <p style={{ color: 'red', fontSize: '0.85em', marginTop: '5px' }}>{subscriptionError}</p>}
              </form>
            )}

            {/* Postal Code Check Form - Show if geoloc failed OR if territory is not covered */}
            {(territoryStatus.territoryName.toLowerCase().includes("inconnue") || !territoryStatus.isCovered) && (
                 <form onSubmit={handlePostalCodeCheck} className="postal-code-form" style={{ borderTop: '1px solid #ddd', paddingTop: '15px', marginTop: !territoryStatus.isCovered && !territoryStatus.territoryName.toLowerCase().includes("inconnue") ? '15px' : '0' }}>
                    <label htmlFor="postalCodeInput" style={{display: 'block', marginBottom: '8px', fontSize: '0.9em', fontWeight: 600}}>
                        Ou vérifiez la couverture pour un code postal :
                    </label>
                    <input 
                        type="text" 
                        id="postalCodeInput"
                        value={postalCodeInput}
                        onChange={handlePostalCodeInputChange}
                        placeholder="Entrez un code postal (ex: 75001)"
                        disabled={isLoadingPostalCode}
                        style={{ padding: '10px 12px', borderRadius: '8px', border: '1px solid #DDDDDD', marginRight: '8px', width: '180px', height: '44px', fontSize: '0.9rem' }}
                    />
                    <button 
                        type="submit" 
                        disabled={isLoadingPostalCode}
                        className="primary"
                        style={{ height: '44px', padding: '10px 20px', fontSize: '0.9rem' }}
                    >
                        {isLoadingPostalCode ? 'Vérification...' : 'Vérifier'}
                    </button>
                    {postalCodeStatusMessage && <p style={{ color: '#666', fontSize: '0.85em', marginTop: '5px' }}>{postalCodeStatusMessage}</p>}
                 </form>
            )}
        </div>
      )}
      
      {/* Explorer Button Section */}
      <div style={{ marginBottom: '32px', padding: '0' }}> 
        <button 
          onClick={handleExplorerPlusClick}
          className="primary explorer-plus-btn" 
          style={{
            width: 'calc(100% - 32px)', 
            maxWidth: '600px', 
            height: '48px',
            fontSize: '16px',
            fontWeight: 700,
            display: 'block', 
            margin: '0 auto', 
          }}
        >
          Découvrir d'autres activités
        </button>
      </div>

      {/* Info Cards Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <InfoCard title="Utilisateurs inscrits" value={1234} icon={<span>👥</span>} />
        <InfoCard
          title="Activités disponibles"
          value={56}
          variant="secondary"
          icon={<span>🏃‍♂️</span>}
        />
      </div>

      {/* Activities Grid Section */}
      {isLoadingActivities && <p>Loading activities...</p>}
      {activitiesError && <p style={{ color: 'red', textAlign: 'center' }}>Error fetching activities: {activitiesError}</p>}
      {!isLoadingActivities && !activitiesError && displayedActivities.length === 0 && allActivities.length > 0 && (
         <p style={{ textAlign: 'center' }}>No more activities to display in this random set. Try again!</p>
      )}
      {!isLoadingActivities && !activitiesError && allActivities.length === 0 && (
        <p style={{ textAlign: 'center' }}>No activities available at the moment. Please check back later!</p>
      )}
      {!isLoadingActivities && !activitiesError && displayedActivities.length > 0 && (
        <div className="grid-container">
          {displayedActivities.map((activity, index) => (
            <div 
              key={activity.id + '-' + index} 
              className="grid-col grid-col-12 grid-col-md-6 grid-col-lg-4 activity-card-item" 
              style={{ display: 'flex' }}
            >
              <ActivityCard activity={activity} />
            </div>
          ))}
        </div>
      )}

      {/* Registration Prompt for Guests */}
      <RegistrationPrompt 
        isVisible={showRegistrationPrompt && !isAuthenticated} 
        onDismiss={() => {
          setShowRegistrationPrompt(false);
          sessionStorage.setItem('registrationPromptDismissed', 'true');
        }} 
      />
    </div>
  );
};

export default AccueilPage;