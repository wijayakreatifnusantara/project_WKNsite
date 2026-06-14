import React from 'react';
import { useNavigate } from 'react-router-dom';
import LocationManager from './components/LocationManager';

const LocationManagerPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex-1 overflow-y-auto p-3 bg-transparent custom-scrollbar animate-fade-in">
      <div className="w-full mx-auto space-y-3">
        <LocationManager onBack={() => navigate('/attendance')} />
      </div>
    </div>
  );
};

export default LocationManagerPage;
