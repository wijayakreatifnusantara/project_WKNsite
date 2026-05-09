import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login';
import DashboardLayout from './components/Layout/DashboardLayout';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useIsMobile } from './hooks/useIsMobile';
import MobileLayout from './components/Layout/MobileLayout';
import { Toaster } from 'sonner';

const Overview = React.lazy(() => import('./pages/Overview/Overview'));
const Employees = React.lazy(() => import('./pages/Employees/Employees'));
const Payroll = React.lazy(() => import('./pages/Payroll/Payroll'));
const AttendanceHub = React.lazy(() => import('./pages/Attendance/AttendanceHub'));
const InvoicingSystem = React.lazy(() => import('./pages/Finance/InvoicingSystem'));
const QuotationBuilder = React.lazy(() => import('./pages/CRM/QuotationBuilder'));
const RBACManager = React.lazy(() => import('./pages/Admin/RBACManager'));
const UserManager = React.lazy(() => import('./pages/Admin/UserManager'));
const Settings = React.lazy(() => import('./pages/Admin/Settings'));
const DocumentHub = React.lazy(() => import('./pages/Documents/DocumentHub'));
const AssetInventory = React.lazy(() => import('./pages/Assets/AssetInventory'));
const PerformanceHub = React.lazy(() => import('./pages/Performance/PerformanceHub'));
const AuditTrail = React.lazy(() => import('./pages/Admin/AuditTrail'));
const LeaveManagementHub = React.lazy(() => import('./pages/Leave/LeaveManagementHub'));
const AttendanceReport = React.lazy(() => import('./pages/Attendance/AttendanceReport'));
const AttendanceRecap = React.lazy(() => import('./pages/Attendance/AttendanceRecap'));

const Academy = React.lazy(() => import('./pages/Academy/Academy'));
const Recruitment = React.lazy(() => import('./pages/Recruitment/Recruitment'));
const Expenses = React.lazy(() => import('./pages/Finance/Expenses'));
const OrgChart = React.lazy(() => import('./pages/Company/OrgChart'));
const Consumables = React.lazy(() => import('./pages/Assets/Consumables'));
const Wiki = React.lazy(() => import('./pages/Company/Wiki'));
const Wellness = React.lazy(() => import('./pages/Company/Wellness'));
const Surveys = React.lazy(() => import('./pages/Company/Surveys'));
const Offboarding = React.lazy(() => import('./pages/Company/Offboarding'));
const Timesheet = React.lazy(() => import('./pages/Company/Timesheet'));
const Succession = React.lazy(() => import('./pages/Company/Succession'));
const Grievance = React.lazy(() => import('./pages/Company/Grievance'));

const UnderDevelopment = React.lazy(() => import('./pages/UnderDevelopment/UnderDevelopment'));

const ProtectedRoute = ({ children, permission }) => {
  const { profile, loading, can } = useAuth();

  if (loading) return null;
  if (!profile) return <Navigate to="/login" replace />;

  if (permission && !can(permission)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const MobileHome = React.lazy(() => import('./pages/ESS/MobileHome'));
const MobilePayslip = React.lazy(() => import('./pages/ESS/MobilePayslip'));
const DigitalCard = React.lazy(() => import('./pages/ESS/DigitalCard'));

const AppContent = () => {
  const { profile, loading, logout, PERMISSIONS } = useAuth();
  const isMobile = useIsMobile();
  const Layout = isMobile ? MobileLayout : DashboardLayout;

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#f0f2f5]">
        <div className="flex flex-col items-center gap-6">
          <div className="h-20 w-20 bg-white shadow-[8px_8px_16px_#d1d9e6,-8px_-8px_16px_#ffffff] rounded-[2.5rem] flex items-center justify-center border-4 border-white">
            <div className="h-10 w-10 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin"></div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Initializing Security Protocol...</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/login" 
        element={!profile ? <Login /> : <Navigate to="/dashboard" replace />} 
      />

      <Route
        path="/*"
        element={
          profile ? (
            <Layout user={profile} onLogout={logout}>
              <React.Suspense fallback={
                <div className="flex-1 flex items-center justify-center bg-[#f0f2f5]">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-[#E31E24] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Loading Module...</p>
                  </div>
                </div>
              }>
                <Routes>
                  {/* Strategic Dashboard */}
                  <Route path="/dashboard" element={isMobile ? <MobileHome user={profile} /> : <Overview user={profile} />} />

                  {/* Human Capital */}
                  <Route path="/employees/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><Employees /></ProtectedRoute>} />
                  <Route path="/attendance/report" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><AttendanceReport /></ProtectedRoute>} />
                  <Route path="/attendance/recap" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><AttendanceRecap /></ProtectedRoute>} />
                  <Route path="/attendance" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><AttendanceHub /></ProtectedRoute>} />
                  <Route path="/leave/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><LeaveManagementHub /></ProtectedRoute>} />
                  <Route path="/documents/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><DocumentHub /></ProtectedRoute>} />
                  <Route path="/performance/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><PerformanceHub /></ProtectedRoute>} />
                  <Route path="/recruitment/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><Recruitment /></ProtectedRoute>} />
                  <Route path="/academy/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><Academy /></ProtectedRoute>} />
                  <Route path="/succession/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><Succession /></ProtectedRoute>} />

                  {/* Company Hub */}
                  <Route path="/org-chart/*" element={<OrgChart />} />
                  <Route path="/wiki/*" element={<Wiki />} />
                  <Route path="/wellness/*" element={<Wellness />} />
                  <Route path="/surveys/*" element={<Surveys />} />
                  <Route path="/timesheet/*" element={<Timesheet />} />
                  <Route path="/offboarding/*" element={<Offboarding />} />
                  <Route path="/grievance/*" element={<Grievance />} />

                  {/* ESS Mobile Specific */}
                  <Route path="/me/card/*" element={<DigitalCard user={profile} />} />

                  {/* Assets */}
                  <Route path="/assets/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><AssetInventory /></ProtectedRoute>} />
                  <Route path="/consumables/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_WORKFORCE}><Consumables /></ProtectedRoute>} />

                  {/* Treasury & Finance */}
                  <Route path="/payroll/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_PAYROLL}>{isMobile ? <MobilePayslip user={profile} /> : <Payroll user={profile} />}</ProtectedRoute>} />
                  <Route path="/expenses/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_TREASURY}><Expenses /></ProtectedRoute>} />
                  <Route path="/finance/invoices/*" element={<ProtectedRoute permission={PERMISSIONS.VIEW_REVENUE}><InvoicingSystem /></ProtectedRoute>} />

                  {/* CRM */}
                  <Route path="/crm/quotations" element={<ProtectedRoute permission={PERMISSIONS.VIEW_CRM}><QuotationBuilder /></ProtectedRoute>} />
                  <Route path="/crm/pipeline" element={<ProtectedRoute permission={PERMISSIONS.VIEW_CRM}><UnderDevelopment moduleName="Sales Pipeline" /></ProtectedRoute>} />
                  <Route path="/crm/clients" element={<ProtectedRoute permission={PERMISSIONS.VIEW_CRM}><UnderDevelopment moduleName="Customer Portfolio" /></ProtectedRoute>} />

                  {/* Admin Only */}
                  <Route path="/settings" element={<ProtectedRoute permission={PERMISSIONS.MANAGE_SYSTEM_SETTINGS}><Settings /></ProtectedRoute>} />
                  <Route path="/admin/rbac" element={<ProtectedRoute permission={PERMISSIONS.MANAGE_RBAC}><RBACManager /></ProtectedRoute>} />
                  <Route path="/admin/users" element={<ProtectedRoute permission={PERMISSIONS.MANAGE_USERS}><UserManager /></ProtectedRoute>} />
                  <Route path="/admin/audit-trail" element={<ProtectedRoute permission={PERMISSIONS.MANAGE_SYSTEM_SETTINGS}><AuditTrail /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
              </React.Suspense>
            </Layout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
