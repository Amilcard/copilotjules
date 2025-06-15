import React from 'react';
import RegisterForm from '../components/Auth/RegisterForm';
import MultiStepProgressBar from '../components/Common/MultiStepProgressBar'; // Import the progress bar

const RegisterPage: React.FC = () => {
  const pageContainerStyle: React.CSSProperties = {
    maxWidth: '450px', // Consistent with auth form containers
    margin: '2rem auto',
    padding: '2rem',
    // border: '1px solid var(--color-border-soft, #eee)', // Optional container border
    // borderRadius: 'var(--card-border-radius, 8px)',
    // boxShadow: '0 4px 12px var(--color-shadow, rgba(0,0,0,0.08))',
    // backgroundColor: 'var(--color-background-card, #fff)', // Optional container background
  };
  
  const titleStyle: React.CSSProperties = {
    textAlign: 'center',
    color: 'var(--color-blue-primary, #0055A4)',
    marginBottom: '24px', // Increased margin
    fontFamily: 'var(--font-primary, Montserrat)',
  };

  return (
    <div style={pageContainerStyle}>
      <MultiStepProgressBar currentStep={1} totalSteps={2} />
      <h1 style={titleStyle}>Créer votre compte</h1> {/* Changed title slightly for context */}
      <RegisterForm />
    </div>
  );
};

export default RegisterPage;