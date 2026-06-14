import React from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Login from '../features/Login/pages/Login';
import Employees from '../features/Employees/pages/Employees';
import EmployeeForm from '../features/Employees/pages/EmployeeForm';
import AttendanceHub from '../features/Attendance/pages/AttendanceHub';
import AttendanceReport from '../features/Attendance/pages/AttendanceReport';
import AttendanceRecap from '../features/Attendance/pages/AttendanceRecap';
import AttendanceCalendar from '../features/Attendance/pages/AttendanceCalendar';
import ScheduleManager from '../features/Attendance/pages/ScheduleManager';
import AttendanceCorrection from '../features/Attendance/pages/AttendanceCorrection';
import AdminHub from '../features/Admin/pages/AdminHub';
import Overview from '../features/Overview/pages/Overview';
import DivisionManager from '../features/Master/pages/DivisionManager';
import ShiftManager from '../features/Master/pages/ShiftManager';
import MasterDataHub from '../features/Master/pages/MasterDataHub';
import LeaveManagementHub from '../features/Leave/pages/LeaveManagementHub';
import Payroll from '../features/Payroll/pages/Payroll';
import Expenses from '../features/Finance/pages/Expenses';
import PerformanceHub from '../features/Performance/pages/PerformanceHub';
import GamificationAdmin from '../features/Performance/pages/GamificationAdmin';
import AssetInventory from '../features/Assets/pages/AssetInventory';
import Consumables from '../features/Assets/pages/Consumables';
import QuotationBuilder from '../features/CRM/pages/QuotationBuilder';
import Recruitment from '../features/Recruitment/pages/Recruitment';
import Academy from '../features/Academy/pages/Academy';
import DocumentHub from '../features/Documents/pages/DocumentHub';
import CompanyOrgChart from '../features/Company/pages/OrgChart';
import Timesheet from '../features/Company/pages/Timesheet';
import Wellness from '../features/Company/pages/Wellness';
import Surveys from '../features/Company/pages/Surveys';
import Grievance from '../features/Company/pages/Grievance';
import Announcements from '../features/Company/pages/Announcements';
import Wiki from '../features/Company/pages/Wiki';
import Succession from '../features/Company/pages/Succession';
import Offboarding from '../features/Company/pages/Offboarding';
import OnboardingPage from '../features/Employees/pages/OnboardingPage';
import LocationManagerPage from '../features/Attendance/pages/LocationManagerPage';
import OvertimeManagementPage from '../features/Attendance/pages/OvertimeManagementPage';
import LiveTracking from '../features/Tracking/LiveTracking';
import CareerPortal from '../features/Careers/pages/CareerPortal';
import ReportBuilder from '../features/Reports/pages/ReportBuilder';
import AuthenticatedApp from '../layouts/AuthenticatedApp';
import ProtectedRoute from '../components/Auth/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import WABroadcast from '../features/Company/pages/WABroadcast';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/overview" replace />;
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/careers" element={<CareerPortal />} />
      
      {/* Protected Routes with Dashboard Layout */}
      <Route element={
        <ProtectedRoute>
          <AuthenticatedApp />
        </ProtectedRoute>
      }>
        <Route path="/" element={<Navigate to="/overview" replace />} />
        <Route path="/dashboard" element={<Navigate to="/overview" replace />} />
        <Route path="/overview" element={<Overview />} />
        
        {/* Strictly Protected Routes (Owner, Admin, HR) */}
        <Route element={<ProtectedRoute roles={['owner', 'admin', 'hr']}><Outlet /></ProtectedRoute>}>
          <Route path="/master/employees" element={<Employees />} />
          <Route path="/master/dictionary" element={<MasterDataHub />} />
          <Route path="/master/divisions" element={<Navigate to="/master/dictionary" replace />} />
          <Route path="/master/shifts" element={<Navigate to="/master/dictionary" replace />} />
          <Route path="/master/employees/create" element={<EmployeeForm />} />
          <Route path="/master/employees/edit/:id" element={<EmployeeForm />} />
          <Route path="/payroll" element={<Payroll />} />
          <Route path="/admin" element={<AdminHub />} />
        </Route>

        <Route path="/employees/onboarding" element={<OnboardingPage />} />
        <Route path="/attendance" element={<AttendanceHub />} />
        <Route path="/attendance/calendar" element={<AttendanceCalendar />} />
        <Route path="/attendance/schedule" element={<ScheduleManager />} />
        <Route path="/attendance/correction" element={<AttendanceCorrection />} />
        <Route path="/attendance/location" element={<LocationManagerPage />} />
        <Route path="/attendance/tracking" element={<LiveTracking />} />
        <Route path="/attendance/report" element={<AttendanceReport />} />
        <Route path="/attendance/recap" element={<AttendanceRecap />} />
        <Route path="/attendance/overtime" element={<OvertimeManagementPage />} />
        <Route path="/leave" element={<LeaveManagementHub />} />
        <Route path="/finance/reimburse" element={<Expenses />} />
        {/* Performance & Rewards */}
        <Route path="/performance" element={<PerformanceHub />} />
        <Route path="/gamification" element={<GamificationAdmin />} />
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
        <Route path="/company/announcements" element={<Announcements />} />
        <Route path="/company/broadcast" element={<WABroadcast />} />
        <Route path="/company/grievance" element={<Grievance />} />
        <Route path="/company/wiki" element={<Wiki />} />
        <Route path="/company/succession" element={<Succession />} />
        <Route path="/company/offboarding" element={<Offboarding />} />
        <Route path="/reports/builder" element={<ReportBuilder />} />
        
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
      <Route path="*" element={<Navigate to="/overview" replace />} />
    </Routes>
  );
};

export default AppRoutes;
