import React, { useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import { toast } from 'sonner';
import DashboardLayout from '../components/Layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';

const AuthenticatedApp = () => {
  const { logout, user } = useAuth();
  const timerRef = useRef(null);

  useEffect(() => {
    const INACTIVITY_LIMIT = 5 * 60 * 1000; // 5 minutes
    
    const handleLogout = () => {
      toast.error('Sesi Anda telah berakhir karena tidak ada aktivitas selama 5 menit.', {
        duration: 5000,
        position: 'top-center'
      });
      logout();
    };

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(handleLogout, INACTIVITY_LIMIT);
    };

    resetTimer();

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'wheel'];
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, handleActivity));
    };
  }, [logout]);
  
  return (
    <DashboardLayout onLogout={logout} user={user}>
      <Outlet />
    </DashboardLayout>
  );
};

export default AuthenticatedApp;
