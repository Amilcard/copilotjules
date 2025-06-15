import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import activityService, { Activity, ApiError } from '../../services/activityService';
import authService from '../../services/authService'; // To get current user for ownership check

const ActivityList: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true);
      try {
        const data = await activityService.getAllActivities();
        setActivities(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to fetch activities.');
        console.error('Fetch activities error:', apiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this activity?')) {
      return;
    }
    try {
      await activityService.deleteActivity(id);
      setActivities(activities.filter(activity => String(activity.id) !== id));
    } catch (err) {
      const apiError = err as ApiError;
      alert(`Failed to delete activity: ${apiError.message}`); // Simple alert for delete error
      console.error('Delete activity error:', apiError);
    }
  };

  if (isLoading) {
    return <p>Loading activities...</p>;
  }

  if (error) {
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }

  if (activities.length === 0) {
    return <p>No activities found. <Link to="/activities/new">Create one?</Link></p>;
  }

  return (
    <div>
      <h2>Activities</h2>
      <Link to="/activities/new">Create New Activity</Link>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {activities.map(activity => (
          <li key={activity.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '10px' }}>
            <h3>{activity.title}</h3>
            <p>{activity.description?.substring(0, 100)}{activity.description && activity.description.length > 100 ? '...' : ''}</p>
            <p><small>Location: Lat: {activity.latitude}, Lon: {activity.longitude}</small></p>
            {/* Optional: Display username if backend provides it 
            {activity.username && <p><small>Created by: {activity.username}</small></p>} 
            */}
            <Link to={`/activities/${activity.id}`}>View Details</Link>
            {currentUser && currentUser.id === activity.user_id && (
              <>
                {' | '}
                <Link to={`/activities/${activity.id}/edit`}>Edit</Link>
                {' | '}
                <button 
                  onClick={() => handleDelete(String(activity.id))} 
                  style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer', padding: 0, fontSize:'1em' }}
                >
                  Delete
                </button>
              </>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ActivityList;