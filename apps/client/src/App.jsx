import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

import Login from './components/Login';
import Dashboard from './components/Dashboard';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check authentication status on app load
    const authStatus = localStorage.getItem('WNKsite_Auth');
    const userName = localStorage.getItem('WNKsite_UserName');
    
    if (authStatus === 'true' && userName) {
      setIsAuthenticated(true);
      setUser({
        name: userName,
        role: localStorage.getItem('WNKsite_Role') || 'Staff',
        username: localStorage.getItem('WNKsite_Username') || '',
        employeeId: localStorage.getItem('WNKsite_EmployeeId') || ''
      });
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('WNKsite_Auth');
    localStorage.removeItem('WNKsite_UserId');
    localStorage.removeItem('WNKsite_UserName');
    localStorage.removeItem('WNKsite_Role');
    localStorage.removeItem('WNKsite_Email');
    localStorage.removeItem('WNKsite_Username');
    localStorage.removeItem('WNKsite_EmployeeId');
    setUser(null);
    setIsAuthenticated(false);
  };

  // If not authenticated, show login page
  if (!isAuthenticated) {
    return (
      <BrowserRouter>
        <Routes>
          <Route path="*" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        </Routes>
      </BrowserRouter>
    );
  }

  // If authenticated, show main app
  return (
    <BrowserRouter>
      <Routes>
        <Route
          element={
            <div className="min-h-screen bg-gray-50">
              <div className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-3xl font-bold text-gray-900">WKNsite Dashboard</h1>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                      Welcome, {user?.name}
                    </span>
                    <button 
                      onClick={handleLogout}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h2 className="text-xl font-semibold mb-4">Dashboard Overview</h2>
                  <p className="text-gray-600 mb-4">Welcome to WKNsite Corporate Management System</p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-blue-900 mb-2">Employees</h3>
                      <p className="text-blue-700">Manage employee data and information</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-green-900 mb-2">Attendance</h3>
                      <p className="text-green-700">Track employee attendance and schedules</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-purple-900 mb-2">Reports</h3>
                      <p className="text-purple-700">Generate and view various reports</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          <Route path="/employees" element={<div>Employee Management</div>} />
          <Route path="/attendance" element={<div>Attendance Tracking</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
