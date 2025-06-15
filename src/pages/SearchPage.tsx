import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import activityService, { Activity, ApiError, GetActivitiesParams } from '../services/activityService';
import geolocationService, { GeolocationError } from '../services/geolocationService';
import SearchBar from '../components/Search/SearchBar';
import FilterPanel from '../components/Search/FilterPanel';
import ActivityCard from '../components/Activity/ActivityCard';
import ActivityResultsMap from '../components/Map/ActivityResultsMap';

// --- Icons ---
const FunnelIcon: React.FC<{ size?: string, color?: string }> = ({ size = "20px", color = "var(--color-text-primary, #333)" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={size} height={size}><path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z"/></svg>
);
const TargetIcon: React.FC<{ size?: string, color?: string }> = ({ size = "20px", color = "var(--color-text-primary, #333)" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={size} height={size}><path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm0 6c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-10C6.48 4 2 8.48 2 14s4.48 10 10 10 10-4.48 10-10S17.52 4 12 4zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
);
const ListIcon: React.FC<{ size?: string, color?: string }> = ({ size = "20px", color = "var(--color-text-primary, #333)" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={size} height={size}><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zm0-8h14V7H7v2z"/></svg>
);
const MapViewIcon: React.FC<{ size?: string, color?: string }> = ({ size = "20px", color = "var(--color-text-primary, #333)" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={color} width={size} height={size}><path d="M20.5 3l-.16.03L15 5.1 9 3 3.36 4.9A1 1 0 003 5.82V21s0 .05.02.07l.14.07L9 18.9l6 2.1 5.64-1.9A1 1 0 0021 18.18V3s0-.05-.02-.07zM15 17.1l-6-2.1V5.1l6 2.1v9.9z"/></svg>
);
const FilterCountBadge: React.FC<{ count: number }> = ({ count }) => (
  <span style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'var(--color-orange-primary, #FF6F61)', color: 'white', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', border: '1px solid white' }}>{count}</span>
);
// --- End Icons ---

type ViewMode = 'list' | 'map';
type SortOrder = 'asc' | 'desc';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // State for search term from SearchBar
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  // State for all applied filters (prominent + advanced panel)
  const [appliedFilters, setAppliedFilters] = useState<GetActivitiesParams>(() => {
    const initial: GetActivitiesParams = {};
    if (searchParams.get('type')) initial.type = searchParams.get('type')!;
    if (searchParams.get('age')) initial.age = String(searchParams.get('age')!);
    if (searchParams.get('max_price')) initial.max_price = String(searchParams.get('max_price')!);
    if (searchParams.get('latitude')) initial.latitude = String(searchParams.get('latitude')!);
    if (searchParams.get('longitude')) initial.longitude = String(searchParams.get('longitude')!);
    if (searchParams.get('radius')) initial.radius = String(searchParams.get('radius')!);
    return initial;
  });

  // State for sorting
  const defaultSort = { sortBy: 'date', sortOrder: 'desc' as SortOrder };
  const [sortCriteria, setSortCriteria] = useState<NonNullable<Pick<GetActivitiesParams, 'sortBy' | 'sortOrder'>>>(() => {
    const initialSortBy = searchParams.get('sortBy') || defaultSort.sortBy;
    const initialSortOrder = (searchParams.get('sortOrder') === 'asc' || searchParams.get('sortOrder') === 'desc') 
                             ? searchParams.get('sortOrder') as SortOrder
                             : defaultSort.sortOrder;
    return { sortBy: initialSortBy, sortOrder: initialSortOrder };
  });

  // State for view mode
  const [viewMode, setViewMode] = useState<ViewMode>((searchParams.get('view') as ViewMode) || 'list');
  
  // Other states
  const [searchResults, setSearchResults] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [locationFetchError, setLocationFetchError] = useState<string | null>(null);
  const [prominentFilterErrors, setProminentFilterErrors] = useState<Record<string, string>>({});


  // Debounce search function
  const debouncedPerformSearch = useCallback(
    debounce((query: string, filters: GetActivitiesParams, sort: NonNullable<Pick<GetActivitiesParams, 'sortBy' | 'sortOrder'>>) => {
      performSearchActual(query, filters, sort);
    }, 500), // 500ms debounce
    [] // Dependencies for useCallback, will re-create if these change (should be stable)
  );
  
  // Actual search function
  const performSearchActual = async (query: string, filters: GetActivitiesParams, sort: NonNullable<Pick<GetActivitiesParams, 'sortBy' | 'sortOrder'>>) => {
    const currentSearchTerm = query.trim();
    const activeFilters = Object.fromEntries(Object.entries(filters).filter(([_, v]) => v !== undefined && v !== ''));

    if (!currentSearchTerm && Object.keys(activeFilters).length === 0) {
      setSearchResults([]);
      setHasSearched(false);
      setError(null);
      setSearchParams({}, { replace: true });
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);
    
    const searchParamsToApply: GetActivitiesParams = { 
      ...activeFilters, 
      ...(currentSearchTerm && { q: currentSearchTerm }),
      ...sort
    };
    
    const urlParams = new URLSearchParams();
    if (currentSearchTerm) urlParams.set('q', currentSearchTerm);
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') urlParams.set(key, String(value));
    });
    if (sort.sortBy) urlParams.set('sortBy', sort.sortBy);
    if (sort.sortOrder) urlParams.set('sortOrder', sort.sortOrder);
    urlParams.set('view', viewMode);
    setSearchParams(urlParams, { replace: true });

    try {
      // @ts-ignore
      const results = await activityService.getActivities(searchParamsToApply);
      setSearchResults(results);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Failed to fetch search results.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial load effect
  useEffect(() => {
    const initialFiltersFromUrl: GetActivitiesParams = {};
    searchParams.forEach((value, key) => {
      if (key !== 'q' && key !== 'sortBy' && key !== 'sortOrder' && key !== 'view') {
        initialFiltersFromUrl[key as keyof GetActivitiesParams] = value;
      }
    });
    setAppliedFilters(initialFiltersFromUrl);
    
    const initialSortBy = searchParams.get('sortBy') || defaultSort.sortBy;
    const initialSortOrder = (searchParams.get('sortOrder') as SortOrder) || defaultSort.sortOrder;
    setSortCriteria({ sortBy: initialSortBy, sortOrder: initialSortOrder });

    const initialViewMode = (searchParams.get('view') as ViewMode) || 'list';
    setViewMode(initialViewMode);

    if (searchTerm || Object.keys(initialFiltersFromUrl).length > 0) {
      performSearchActual(searchTerm, initialFiltersFromUrl, { sortBy: initialSortBy, sortOrder: initialSortOrder });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only on mount

  const handleSearch = (query: string) => {
    setSearchTerm(query); 
    debouncedPerformSearch(query, appliedFilters, sortCriteria);
  };

  const handleProminentFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const filterKey = name as keyof Pick<GetActivitiesParams, 'age' | 'max_price' | 'radius'>;
    
    let errorMsg = '';
    const numValue = Number(value);
    if (value !== '' && isNaN(numValue)) errorMsg = "Doit être un nombre.";
    else if (name === 'age' && numValue < 0) errorMsg = "Ne peut être négatif.";
    else if (name === 'max_price' && numValue < 0) errorMsg = "Ne peut être négatif.";
    else if (name === 'radius' && value !== '' && numValue <= 0) errorMsg = "Doit être positif.";
    
    setProminentFilterErrors(prev => ({...prev, [name]: errorMsg}));

    const newAppliedFilters = {
        ...appliedFilters,
        [filterKey]: value.trim() === '' ? undefined : (errorMsg ? appliedFilters[filterKey] : value.trim()), // Keep old value if new is invalid for now
    };

    if (filterKey === 'radius' && (value.trim() === '' || (numValue <= 0 && !errorMsg) || (!(newAppliedFilters.latitude && newAppliedFilters.longitude) && value.trim() !== '') )) {
        delete newAppliedFilters.radius;
        if(!(newAppliedFilters.latitude && newAppliedFilters.longitude) && value.trim() !== ''){
             setProminentFilterErrors(prev => ({...prev, radius: "Lat/Lon requis."}));
        }
    }
    
    setAppliedFilters(newAppliedFilters);
    if (!errorMsg) { // Only search if the current change is valid
        debouncedPerformSearch(searchTerm, newAppliedFilters, sortCriteria);
    }
  };

  const handleApplyFiltersFromPanel = (panelFilters: GetActivitiesParams) => {
    const newAppliedFilters = { ...appliedFilters, type: panelFilters.type || undefined };
    setAppliedFilters(newAppliedFilters);
    setIsFilterPanelOpen(false);
    performSearchActual(searchTerm, newAppliedFilters, sortCriteria); 
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    const newSortCriteria = { ...sortCriteria, [name]: value } as NonNullable<Pick<GetActivitiesParams, 'sortBy' | 'sortOrder'>>;
    setSortCriteria(newSortCriteria);
    performSearchActual(searchTerm, appliedFilters, newSortCriteria);
  };

  const handleSearchNearby = async () => {
    setIsFetchingLocation(true);
    setLocationFetchError(null);
    try {
      const position = await geolocationService.getCurrentPosition();
      const newFilters: GetActivitiesParams = {
        ...appliedFilters,
        latitude: position.latitude.toFixed(6),
        longitude: position.longitude.toFixed(6),
        radius: String(appliedFilters.radius || 10), 
      };
      setAppliedFilters(newFilters); 
      setIsFilterPanelOpen(false); 
      performSearchActual(searchTerm, newFilters, sortCriteria); 
    } catch (error) {
      const geoError = error as GeolocationError;
      setLocationFetchError(geoError.message || "Impossible d'obtenir la localisation actuelle.");
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleViewModeChange = (newMode: ViewMode) => {
    setViewMode(newMode);
    const currentUrlParams = new URLSearchParams(searchParams);
    currentUrlParams.set('view', newMode);
    setSearchParams(currentUrlParams, { replace: true }); 
  };
  
  const activeFilterCount = Object.values(appliedFilters).filter(value => value !== undefined && value !== '').length;

  return (
    <div className="search-page-container global-padding" style={{ paddingTop: 'var(--global-padding)' }}>
      <header style={{ marginBottom: '12px' }}>
        <h2 style={{ fontFamily: 'var(--font-primary)', color: 'var(--color-blue-primary)', marginBottom: '16px'}}>Rechercher une Activité</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'flex-start', marginBottom: '10px' }}>
          <div style={{ flexGrow: 1, minWidth: '200px', maxWidth: '350px' }}>
            <SearchBar initialSearchTerm={searchTerm} onSearch={handleSearch} isLoading={isLoading} />
          </div>
          <button onClick={handleSearchNearby} disabled={isFetchingLocation || isLoading} className="action-button" title="Rechercher autour de moi">
            <TargetIcon /> <span style={{marginLeft: '5px'}}>Autour de moi</span>
          </button>
          <button onClick={() => setIsFilterPanelOpen(true)} className="action-button" style={{ position: 'relative' }} aria-label="Ouvrir les filtres avancés">
            <FunnelIcon /> <span style={{marginLeft: '5px'}}>Filtres avancés</span>
            {activeFilterCount > 0 && <FilterCountBadge count={activeFilterCount} />}
          </button>
        </div>

        {/* Prominent Filters Section */}
        <div className="prominent-filters" style={{display: 'flex', gap: '10px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '10px', padding: '10px', backgroundColor: 'var(--color-background-page-alt, #f9f9f9)', borderRadius: 'var(--button-border-radius, 8px)'}}>
          <div className="form-group-inline">
            <label htmlFor="prominentAge" className="inline-label">Âge:</label>
            <input type="number" id="prominentAge" name="age" value={appliedFilters.age || ''} onChange={handleProminentFilterChange} placeholder="ex: 10" min="0" className="inline-input small-input" disabled={isLoading}/>
            {prominentFilterErrors.age && <p className="error-text-inline">{prominentFilterErrors.age}</p>}
          </div>
          <div className="form-group-inline">
            <label htmlFor="prominentMaxPrice" className="inline-label">Tarif Max (€):</label>
            <input type="number" id="prominentMaxPrice" name="max_price" value={appliedFilters.max_price || ''} onChange={handleProminentFilterChange} placeholder="ex: 0 (gratuit)" min="0" step="0.01" className="inline-input small-input" disabled={isLoading}/>
            {prominentFilterErrors.max_price && <p className="error-text-inline">{prominentFilterErrors.max_price}</p>}
          </div>
          <div className="form-group-inline">
            <label htmlFor="prominentRadius" className="inline-label">Rayon (km):</label>
            <input type="number" id="prominentRadius" name="radius" value={appliedFilters.radius || ''} onChange={handleProminentFilterChange} placeholder="ex: 5" min="1" className="inline-input small-input" disabled={isLoading || !(appliedFilters.latitude && appliedFilters.longitude)} title={!(appliedFilters.latitude && appliedFilters.longitude) ? "Nécessite une recherche 'Autour de moi' ou des filtres lat/lon actifs depuis le panneau avancé." : ""}/>
            {prominentFilterErrors.radius && <p className="error-text-inline">{prominentFilterErrors.radius}</p>}
            {prominentFilterErrors.location && <p className="error-text-inline">{prominentFilterErrors.location}</p>}
          </div>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '20px', justifyContent: 'flex-end' }}> {/* Changed to flex-end for sort/view */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', marginRight: 'auto' }}> {/* This pushes sort to left, view to right if space */}
             {/* Empty div for spacing or future elements if needed */}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <label htmlFor="sortBy" className="sort-label">Trier par:</label>
            <select name="sortBy" value={sortCriteria.sortBy} onChange={handleSortChange} disabled={isLoading} className="sort-select" aria-label="Trier par">
              <option value="date">Date</option>
              <option value="price">Prix</option>
              <option value="distance" disabled={!(appliedFilters.latitude && appliedFilters.longitude)}>Distance</option>
              <option value="popularity">Popularité</option>
            </select>
            <select name="sortOrder" value={sortCriteria.sortOrder} onChange={handleSortChange} disabled={isLoading} className="sort-select" aria-label="Ordre de tri">
              <option value="desc">Décroissant</option>
              <option value="asc">Croissant</option>
            </select>
          </div>
          <div className="view-mode-toggle">
            <button onClick={() => handleViewModeChange('list')} disabled={viewMode === 'list'} className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`} aria-label="Vue liste" title="Afficher en liste">
              <ListIcon color={viewMode === 'list' ? 'var(--color-orange-primary)' : 'var(--color-text-primary)'} /> <span className="view-mode-text">Liste</span>
            </button>
            <button onClick={() => handleViewModeChange('map')} disabled={viewMode === 'map'} className={`view-mode-btn ${viewMode === 'map' ? 'active' : ''}`} aria-label="Vue carte" title="Afficher sur la carte">
              <MapViewIcon color={viewMode === 'map' ? 'var(--color-orange-primary)' : 'var(--color-text-primary)'} /> <span className="view-mode-text">Carte</span>
            </button>
          </div>
        </div>
        {locationFetchError && <p style={{color: 'red', fontSize: '0.9em', textAlign: 'center', width: '100%'}}>{locationFetchError}</p>}
      </header>
      
      <FilterPanel isOpen={isFilterPanelOpen} onClose={() => setIsFilterPanelOpen(false)} currentFilters={appliedFilters} onApplyFilters={handleApplyFiltersFromPanel} />

      <section className="search-results-section">
        {isLoading && <p>Recherche en cours...</p>}
        {error && <p style={{ color: 'red', textAlign: 'center' }}>Erreur: {error}</p>}
        
        {!isLoading && !error && hasSearched && searchResults.length === 0 && (
          <p style={{ textAlign: 'center' }}>Aucune activité trouvée pour "{searchTerm}" avec les filtres actuels.</p>
        )}

        {!isLoading && !error && searchResults.length > 0 && (
          viewMode === 'list' ? (
            <div className="grid-container">
              {searchResults.map(activity => (
                <div key={activity.id} className="grid-col grid-col-12 grid-col-md-6 grid-col-lg-4 activity-card-item" style={{ display: 'flex' }}>
                  <ActivityCard activity={activity} />
                </div>
              ))}
            </div>
          ) : (
            <ActivityResultsMap activities={searchResults} center={appliedFilters.latitude && appliedFilters.longitude ? [Number(appliedFilters.latitude), Number(appliedFilters.longitude)] : undefined} />
          )
        )}
        
        {!isLoading && !error && !hasSearched && !initialQuery && Object.keys(appliedFilters).filter(k => appliedFilters[k as keyof GetActivitiesParams] !== undefined && appliedFilters[k as keyof GetActivitiesParams] !== '').length === 0 && (
            <p style={{textAlign: 'center', color: 'var(--color-text-secondary)'}}>Veuillez entrer un terme ou appliquer des filtres pour trouver des activités.</p>
        )}
      </section>
      <style>{`
        .search-page-container { max-width: 1200px; margin: 0 auto; }
        .activity-card-item { animation: fadeIn 0.5s ease-in-out forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .action-button, .sort-select, .view-mode-btn { 
          padding: 8px 12px; height: 40px; 
          border-radius: var(--button-border-radius, 8px); 
          border: 1px solid var(--color-border-soft, #DDDDDD); 
          background-color: var(--color-background-card, #FFF); 
          cursor: pointer; display: flex; 
          align-items: center; font-family: var(--font-primary); font-size: 0.85rem;
          transition: background-color 0.2s, box-shadow 0.2s;
          white-space: nowrap;
        }
        .action-button:hover, .sort-select:hover, .view-mode-btn:hover:not(.active) { 
          background-color: #f7f7f7; box-shadow: 0 1px 3px rgba(0,0,0,0.07); 
        }
        .action-button:disabled, .sort-select:disabled, .view-mode-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        
        .sort-label { font-size: 0.85rem; font-weight: 500; color: var(--color-text-secondary); margin-right: 5px; }
        .sort-select { appearance: none; -webkit-appearance: none; padding-right: 30px; background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23333333%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.4-12.8z%22/%3E%3C/svg%3E'); background-repeat: no-repeat; background-position: right 10px center; background-size: 8px 10px; }

        .view-mode-toggle { display: inline-flex; border: 1px solid var(--color-border-soft, #DDDDDD); border-radius: var(--button-border-radius, 8px); overflow: hidden;}
        .view-mode-toggle button { border-radius: 0; border: none; border-left: 1px solid var(--color-border-soft, #DDDDDD); margin-left: -1px; padding: 8px 10px; height: 36px;} /* Spec says 36x20, using height 36 */
        .view-mode-toggle button:first-child { border-left: none; margin-left: 0;}
        .view-mode-toggle button.active { background-color: var(--color-orange-light, #FFEADD); color: var(--color-orange-primary); font-weight: var(--font-weight-semibold); border-bottom: 2px solid var(--color-orange-primary); }
        .view-mode-text { margin-left: 5px; display: inline; } 

        .prominent-filters { border: 1px solid var(--color-border-soft, #EEE); padding: 10px; border-radius: var(--button-border-radius, 8px); background-color: var(--color-background-page-alt, #f9f9f9); }
        .form-group-inline { display: flex; flex-direction: column; gap: 2px; }
        .form-group-inline label.inline-label { font-size: 0.75rem; color: var(--color-text-secondary); margin-bottom: 1px; font-weight: 500;}
        .form-group-inline input.inline-input { 
            padding: 6px 8px; height: 36px; border-radius: 6px; border: 1px solid #ccc; 
            font-size: 0.85rem; width: 100px; /* Fixed width for prominent filters */
        }
        .error-text-inline { color: var(--color-error, #D32F2F); font-size: 0.7rem; margin-top: 2px; }

        @media (max-width: 992px) { 
            .search-page-container header > div:nth-of-type(2) { flex-direction: column; align-items: stretch; }
            .search-page-container header > div:nth-of-type(2) > div { width: 100%; justify-content: space-between; }
            .search-page-container header > div:nth-of-type(2) > div:last-child { margin-top: 10px; }
            .prominent-filters { justify-content: space-around; margin-bottom: 10px; width: 100%; flex-direction: row; }
             .form-group-inline { flex-grow:1; }
            .form-group-inline input.inline-input { width: auto; } 
        }
        @media (max-width: 768px) { 
          .search-page-container header > div:first-of-type { flex-direction: column; align-items: stretch; } /* Search bar + main action buttons */
          .search-page-container header > div:first-of-type > div { width: 100%; margin-bottom: 10px; }
          .search-page-container header > div:first-of-type > div:last-child { margin-bottom: 0; }
          .search-page-container header > div:nth-of-type(2) { flex-direction: column; align-items: stretch; } /* Prominent filters + sort/view */
          .search-page-container header > div:nth-of-type(2) > div { width: 100%; }
          .prominent-filters { flex-direction: column; align-items: stretch; }
          .form-group-inline input.inline-input { width: 100%; }
          .view-mode-toggle { align-self: flex-end; margin-top:10px; }
          .sort-label { margin-top: 10px; }
          .view-mode-text { display: none; } 
        }
      `}</style>
    </div>
  );
};

// Debounce helper
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<F>): Promise<ReturnType<F>> => {
    return new Promise(resolve => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
  };
}

export default SearchPage;