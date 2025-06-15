import React, { useState, useEffect } from 'react';
import { useNavigate }
from 'react-router-dom';
import activityService, { Activity, ActivityData, ApiError } from '../../services/activityService';
import geolocationService, { GeolocationError } from '../../services/geolocationService';
import SimpleMapDisplay from '../Map/SimpleMapDisplay'; // For map preview

interface ActivityFormProps {
  activity?: Activity; // If provided, form is in "edit" mode
  onSave?: (activity: Activity) => void; // Optional callback after saving
}

const ActivityForm: React.FC<ActivityFormProps> = ({ activity, onSave }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState<number | ''>('');
  const [longitude, setLongitude] = useState<number | ''>('');
  
  const [formError, setFormError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    if (activity) {
      setTitle(activity.title);
      setDescription(activity.description || '');
      setLatitude(activity.latitude);
      setLongitude(activity.longitude);
    } else {
      // Optionally set default location or leave blank for new activity
      // handleGetCurrentLocation(false); // Auto-fetch location for new forms, false to not show error initially
    }
  }, [activity]);

  const handleGetCurrentLocation = async (showError = true) => {
    setIsFetchingLocation(true);
    if (showError) setLocationError(null);
    try {
      const position = await geolocationService.getCurrentPosition();
      setLatitude(position.latitude);
      setLongitude(position.longitude);
    } catch (error) {
      const geoError = error as GeolocationError;
      console.error('Geolocation error:', geoError);
      if (showError) setLocationError(`Error fetching location: ${geoError.message}`);
      // Do not clear lat/lon if they were manually entered or from an existing activity
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!title || latitude === '' || longitude === '') {
      setFormError('Title, latitude, and longitude are required.');
      return;
    }

    setIsLoading(true);
    const activityData: ActivityData = {
      title,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
    };

    try {
      let savedActivity: Activity;
      if (activity && activity.id) {
        savedActivity = await activityService.updateActivity(String(activity.id), activityData);
      } else {
        savedActivity = await activityService.createActivity(activityData);
      }
      console.log('Activity saved:', savedActivity);
      if (onSave) {
        onSave(savedActivity);
      } else {
        // Default navigation if no callback is provided
        navigate(`/activities/${savedActivity.id}`); // Navigate to detail page
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setFormError(apiErr.message || 'Failed to save activity.');
      console.error('Activity save error:', apiErr);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{activity ? 'Edit Activity' : 'Create New Activity'}</h3>
      {formError && <p style={{ color: 'red' }}>{formError}</p>}

      <div>
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <div>
        <label htmlFor="description">Description:</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </div>
      <div>
        <label htmlFor="latitude">Latitude:</label>
        <input
          type="number"
          step="any"
          id="latitude"
          value={latitude}
          onChange={(e) => setLatitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
          disabled={isLoading}
          required
        />
      </div>
      <div>
        <label htmlFor="longitude">Longitude:</label>
        <input
          type="number"
          step="any"
          id="longitude"
          value={longitude}
          onChange={(e) => setLongitude(e.target.value === '' ? '' : parseFloat(e.target.value))}
          disabled={isLoading}
          required
        />
      </div>
      <button type="button" onClick={() => handleGetCurrentLocation()} disabled={isFetchingLocation || isLoading}>
        {isFetchingLocation ? 'Fetching...' : 'Use Current Location'}
      </button>
      {locationError && <p style={{ color: 'red', fontSize: '0.9em' }}>{locationError}</p>}

      <div style={{ margin: '20px 0' }}>
        <h4>Map Preview:</h4>
        {(latitude !== '' && longitude !== '') ? (
          <SimpleMapDisplay latitude={Number(latitude)} longitude={Number(longitude)} markerText={title || "Activity Location"} />
        ) : (
          <p>Enter coordinates or use current location to see map preview.</p>
        )}
      </div>

      <button type="submit" disabled={isLoading || isFetchingLocation}>
        {isLoading ? 'Saving...' : (activity ? 'Update Activity' : 'Create Activity')}
      </button>
      {activity && (
          <button type="button" onClick={() => navigate(-1)} disabled={isLoading} style={{marginLeft: '10px'}}>
              Cancel
          </button>
      )}
    </form>
  );
};

export default ActivityForm;