import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authService, { User } from '../services/authService'; // Assuming User interface is exported

const SocialAuthCallbackPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(true);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get('token');
    const userParam = queryParams.get('user');

    if (token && userParam) {
      try {
        const user = JSON.parse(decodeURIComponent(userParam)) as User;

        // Store token and user details
        localStorage.setItem('authToken', token);
        // authService.storeUserInfo(user); // This function is not exported directly by default from my authService structure
        // Instead, authService.getCurrentUser() will re-parse from localStorage after token is set.
        // Or, update authService to have a dedicated setUserInfo(user: User, token: string)
        // For now, directly set user info if needed, or rely on App.tsx to update via event
        localStorage.setItem('currentUser', JSON.stringify(user));


        // Dispatch authChange event to update App state (e.g., loggedIn status, currentUser)
        window.dispatchEvent(new CustomEvent('authChange', { detail: user }));
        
        // Redirect based on profile completion status
        if (user.profile_complete) {
          navigate('/'); // Navigate to dashboard or home
        } else {
          navigate('/complete-profile'); // Navigate to profile completion page
        }
      } catch (e) {
        console.error("Error processing social login callback:", e);
        setError('Failed to process authentication details. Invalid data received.');
        setProcessing(false);
      }
    } else {
      setError('Authentication failed. Token or user details missing from callback.');
      setProcessing(false);
    }
    // No explicit setProcessing(false) here if navigation occurs, as component will unmount.
  }, [location, navigate]);

  if (processing && !error) {
    return <p>Processing authentication...</p>;
  }

  if (error) {
    return (
      <div>
        <h2>Authentication Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Please try logging in again. <a href="/login">Go to Login</a></p>
      </div>
    );
  }

  // Should ideally not reach here if navigation is successful
  return <p>Redirecting...</p>; 
};

export default SocialAuthCallbackPage;
