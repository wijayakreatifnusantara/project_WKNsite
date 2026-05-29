import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/apiClient';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const AuthContext = createContext({});

// Konfigurasi API tersentralisasi di apiClient.js

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for saved session in localStorage
    const savedUser = localStorage.getItem('wkn_auth_user');
    const savedToken = localStorage.getItem('wkn_auth_token');
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (err) {
        console.error('Failed to restore auth session:', err);
        localStorage.removeItem('wkn_auth_user');
        localStorage.removeItem('wkn_auth_token');
      }
    } else {
      // Bersihkan jika salah satu hilang untuk mencegah desinkronisasi sesi
      localStorage.removeItem('wkn_auth_user');
      localStorage.removeItem('wkn_auth_token');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await apiClient.post(`/api/auth/login`, {
        username: email,
        password: password
      });

      if (response.data.status === 'success') {
        const rawUser = response.data.user;
        const token = response.data.token;
        
        // Map backend Uppercase keys to lowercase for frontend compatibility
        const userData = {
          username: rawUser.Username,
          fullName: rawUser['Full Name'],
          role: rawUser.Role,
          permissions: rawUser.permissions || [],
          status: rawUser.Status,
          employee_id: rawUser.employee_id,
          is_field_team: rawUser.is_field_team
        };
        
        setUser(userData);
        localStorage.setItem('wkn_auth_user', JSON.stringify(userData));
        localStorage.setItem('wkn_auth_token', token); // Simpan JWT Token dengan aman
        
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
    localStorage.removeItem('wkn_auth_token'); // Hapus token saat logout
  };

  const can = (permission) => {
    if (!user) return false;
    if (user.role?.toLowerCase() === 'owner') return true;
    return hasPermission(user, permission);
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
      PERMISSIONS: PERMISSIONS 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
