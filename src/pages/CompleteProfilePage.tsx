import React from 'react';
import CompleteProfileForm from '../components/Profile/CompleteProfileForm';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';
import MultiStepProgressBar from '../components/Common/MultiStepProgressBar'; // Import the progress bar

const CompleteProfilePage: React.FC = () => {
  const currentUser = authService.getCurrentUser();

  // If profile is already complete, redirect to dashboard or home
  if (currentUser && currentUser.profile_complete) {
    // This check might be redundant if navigation to this page is already conditional
    // but good as a safeguard.
    console.log('Profile already complete, redirecting from CompleteProfilePage.');
    return <Navigate to="/" replace />;
  }
  
  const pageContainerStyle: React.CSSProperties = {
    maxWidth: '500px', // Slightly wider for profile form if needed
    margin: '2rem auto',
    padding: '2rem',
  };
  
  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'var(--color-blue-primary, #0055A4)',
    marginBottom: '24px',
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  return (
    <div style={pageContainerStyle}>
      <MultiStepProgressBar currentStep={2} totalSteps={2} />
      <h1 style={titleStyle}>Compléter Votre Profil</h1>
      <CompleteProfileForm />
    </div>
  );
};

export default CompleteProfilePage;