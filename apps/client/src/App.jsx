import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login/Login';
import Employees from './pages/Employees/Employees';
import AttendanceHub from './pages/Attendance/AttendanceHub';
import AttendanceReport from './pages/Attendance/AttendanceReport';
import AttendanceRecap from './pages/Attendance/AttendanceRecap';
import AdminHub from './pages/Admin/AdminHub';
import DashboardLayout from './components/Layout/DashboardLayout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'sonner';

const AuthenticatedApp = () => {
  const { logout } = useAuth();
  
  return (
    <DashboardLayout onLogout={logout}>
      <Outlet />
    </DashboardLayout>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/employees" replace />;
  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          
          {/* Protected Routes with Dashboard Layout */}
          <Route element={
            <ProtectedRoute>
              <AuthenticatedApp />
            </ProtectedRoute>
          }>
            <Route path="/" element={<Navigate to="/employees" replace />} />
            <Route path="/dashboard" element={<Navigate to="/employees" replace />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/attendance" element={<AttendanceHub />} />
            <Route path="/attendance/report" element={<AttendanceReport />} />
            <Route path="/attendance/recap" element={<AttendanceRecap />} />
            <Route path="/admin" element={<AdminHub />} />
            
            {/* Fallback for other routes */}
            <Route path="*" element={
              <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
                <div className="text-center">
                  <h1 className="text-4xl font-black text-slate-800">404</h1>
                  <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Page Under Development</p>
                </div>
              </div>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/employees" replace />} />
        </Routes>
        <Toaster position="top-right" expand={true} richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
