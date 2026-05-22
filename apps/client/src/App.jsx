import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from './pages/Login/Login';
import Employees from './pages/Employees/Employees';
import AttendanceHub from './pages/Attendance/AttendanceHub';
import AttendanceReport from './pages/Attendance/AttendanceReport';
import AttendanceRecap from './pages/Attendance/AttendanceRecap';
import AttendanceCalendar from './pages/Attendance/AttendanceCalendar';
import AdminHub from './pages/Admin/AdminHub';
import Overview from './pages/Overview/Overview';
import LeaveManagementHub from './pages/Leave/LeaveManagementHub';
import Payroll from './pages/Payroll/Payroll';
import PerformanceHub from './pages/Performance/PerformanceHub';
import AssetInventory from './pages/Assets/AssetInventory';
import Consumables from './pages/Assets/Consumables';
import QuotationBuilder from './pages/CRM/QuotationBuilder';
import Recruitment from './pages/Recruitment/Recruitment';
import Academy from './pages/Academy/Academy';
import DocumentHub from './pages/Documents/DocumentHub';
import CompanyOrgChart from './pages/Company/OrgChart';
import Timesheet from './pages/Company/Timesheet';
import Wellness from './pages/Company/Wellness';
import Surveys from './pages/Company/Surveys';
import Grievance from './pages/Company/Grievance';
import Wiki from './pages/Company/Wiki';
import Succession from './pages/Company/Succession';
import Offboarding from './pages/Company/Offboarding';
import OnboardingPage from './pages/Employees/OnboardingPage';
import DashboardLayout from './components/Layout/DashboardLayout';
import MobileLayout from './components/Layout/MobileLayout';
import MobileHome from './pages/ESS/MobileHome';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useIsMobile } from './hooks/useIsMobile';
import { Toaster } from 'sonner';

const AuthenticatedApp = () => {
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();
  
  if (isMobile) {
    return (
      <MobileLayout onLogout={logout} user={user}>
        <Outlet />
      </MobileLayout>
    );
  }
  
  return (
    <DashboardLayout onLogout={logout} user={user}>
      <Outlet />
    </DashboardLayout>
  );
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const isMobile = useIsMobile();
  if (loading) return null;
  if (user) return <Navigate to={isMobile ? "/attendance" : "/overview"} replace />;
  return children;
};

function App() {
  const isMobile = useIsMobile();
  
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
            <Route path="/" element={<Navigate to={isMobile ? "/attendance" : "/overview"} replace />} />
            <Route path="/dashboard" element={<Navigate to={isMobile ? "/attendance" : "/overview"} replace />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/employees" element={<Employees />} />
            <Route path="/employees/onboarding" element={<OnboardingPage />} />
            <Route path="/attendance" element={isMobile ? <MobileHome /> : <AttendanceHub />} />
            <Route path="/attendance/calendar" element={<AttendanceCalendar />} />
            <Route path="/attendance/report" element={<AttendanceReport />} />
            <Route path="/attendance/recap" element={<AttendanceRecap />} />
            <Route path="/leave" element={<LeaveManagementHub />} />
            <Route path="/payroll" element={<Payroll />} />
            <Route path="/performance" element={<PerformanceHub />} />
            <Route path="/documents" element={<DocumentHub />} />
            <Route path="/assets" element={<AssetInventory />} />
            <Route path="/assets/consumables" element={<Consumables />} />
            <Route path="/crm" element={<QuotationBuilder />} />
            <Route path="/recruitment" element={<Recruitment />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/company/org-chart" element={<CompanyOrgChart />} />
            <Route path="/company/timesheet" element={<Timesheet />} />
            <Route path="/company/wellness" element={<Wellness />} />
            <Route path="/company/surveys" element={<Surveys />} />
            <Route path="/company/grievance" element={<Grievance />} />
            <Route path="/company/wiki" element={<Wiki />} />
            <Route path="/company/succession" element={<Succession />} />
            <Route path="/company/offboarding" element={<Offboarding />} />
            <Route path="/admin" element={<AdminHub />} />
            
            {/* Fallback for other routes */}
            <Route path="*" element={
              <div className="flex-1 flex items-center justify-center bg-slate-50">
                <div className="text-center">
                  <h1 className="text-4xl font-black text-slate-800">404</h1>
                  <p className="text-slate-400 font-bold uppercase tracking-widest mt-2">Page Under Development</p>
                </div>
              </div>
            } />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to={isMobile ? "/attendance" : "/overview"} replace />} />
        </Routes>
        <Toaster position="top-right" expand={true} richColors />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
