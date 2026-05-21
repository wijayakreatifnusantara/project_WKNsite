import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

// Fallback to localhost if env is missing
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session in localStorage
    const savedUser = localStorage.getItem('wkn_auth_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        localStorage.removeItem('wkn_auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        username: email,
        password: password
      });

      if (response.data.status === 'success') {
        const rawUser = response.data.user;
        // Map backend Uppercase keys to lowercase for frontend compatibility
        const userData = {
          username: rawUser.Username,
          fullName: rawUser['Full Name'],
          role: rawUser.Role,
          status: rawUser.Status
        };
        setUser(userData);
        localStorage.setItem('wkn_auth_user', JSON.stringify(userData));
        return userData;
      } else {
        throw new Error(response.data.message || 'Username atau password salah.');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Terjadi kesalahan koneksi ke server.';
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('wkn_auth_user');
  };

  const can = (permission) => {
    if (!user) return false;
    // Owners have full access
    if (user.role?.toLowerCase() === 'owner') return true;
    // Default allowed for now to maintain system usability
    return true;
  };

  const hasRole = (roles) => {
    if (!user) return false;
    if (!roles) return true;
    const requiredRoles = Array.isArray(roles) ? roles : [roles];
    return requiredRoles.map(r => r.toLowerCase()).includes(user.role?.toLowerCase());
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile: user, 
      loading, 
      login, 
      logout,
      can,
      hasRole,
      isAdmin: () => user?.role?.toLowerCase() === 'owner' || user?.role?.toLowerCase() === 'admin',
      PERMISSIONS: {} 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
