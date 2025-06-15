import React, { useEffect, useState } from 'react';
import { useParams, useNavigate }_from 'react-router-dom';
import ActivityForm from '../components/Activity/ActivityForm';
import activityService, { Activity, ApiError } from '../services/activityService';
import authService from '../services/authService';

const EditActivityPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activity, setActivity] = useState<Activity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    if (!id) {
      setError('Activity ID is missing.');
      setIsLoading(false);
      return;
    }

    const fetchActivityToEdit = async () => {
      setIsLoading(true);
      try {
        const data = await activityService.getActivityById(id);
        setActivity(data);
        // Authorization check: Does the current user own this activity?
        if (!currentUser || currentUser.id !== data.user_id) {
          setError('You are not authorized to edit this activity.');
          // Optionally navigate away, or disable form
          // navigate('/activities'); 
        }
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Failed to fetch activity for editing.');
        console.error('Fetch activity for edit error:', apiError);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivityToEdit();
  }, [id, currentUser, navigate]);

  if (isLoading) {
    return <p>Loading activity data for editing...</p>;
  }

  if (error && !activity) { // If there's an error and no activity data (e.g. not found, initial auth error)
    return <p style={{ color: 'red' }}>Error: {error}</p>;
  }
  
  // If activity loaded but user is not authorized (error was set in useEffect)
  if (activity && currentUser && currentUser.id !== activity.user_id) {
      return (
          <div>
              <h1>Edit Activity</h1>
              <p style={{ color: 'red' }}>Error: You are not authorized to edit this activity.</p>
              <button onClick={() => navigate(`/activities/${activity.id}`)}>Back to Detail Page</button>
              <span style={{margin: "0 5px"}}>|</span>
              <button onClick={() => navigate('/activities')}>Back to Activities List</button>
          </div>
      );
  }


  if (!activity) { // Should be covered by previous error states, but as a fallback
    return <p>Activity not found or cannot be edited.</p>;
  }
  
  return (
    <div>
      <h1>Edit Activity</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>} 
      <ActivityForm
        activity={activity}
        onSave={(updatedActivity) => {
          // After updating, navigate to the activity's detail page
          navigate(`/activities/${updatedActivity.id}`);
        }}
      />
    </div>
  );
};

export default EditActivityPage;