import React from 'react';
import ActivityForm from '../components/Activity/ActivityForm';
import { useNavigate } from 'react-router-dom';

const CreateActivityPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div>
      <h1>Create New Activity</h1>
      <ActivityForm 
        onSave={(savedActivity) => {
          // After creating, navigate to the new activity's detail page
          navigate(`/activities/${savedActivity.id}`);
        }} 
      />
    </div>
  );
};

export default CreateActivityPage;
