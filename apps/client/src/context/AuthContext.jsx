import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Inisialisasi Sesi & User
  useEffect(() => {
    const initSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          loadUserData(session.user);
        } else {
          // Cek local storage untuk legacy session
          const stored = localStorage.getItem('wkn_user');
          if (stored) {
            const parsed = JSON.parse(stored);
            setProfile(parsed);
          }
        }
      } catch (err) {
        console.error('Session Init Error:', err);
      } finally {
        // Beri jeda sedikit agar UI tidak kaget
        setTimeout(() => setLoading(false), 500);
      }
    };

    initSession();

    // Listener Perubahan Status Login
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
        setUser(session?.user ?? null);
        if (session?.user) loadUserData(session.user);
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setPermissions([]);
        localStorage.removeItem('wkn_user');
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. Fungsi Pengambil Data Profil & Izin (Running in Background)
  const loadUserData = async (authUser) => {
    try {
      // Ambil Profil
      const { data: prof } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', authUser.email)
        .maybeSingle();

      if (prof) {
        setProfile(prof);
        localStorage.setItem('wkn_user', JSON.stringify(prof));
        
        // Ambil Izin (RBAC Sync)
        const { data: perms } = await supabase
          .from('role_permissions')
          .select('permission_name')
          .eq('role_name', prof.role?.toLowerCase());

        if (perms && perms.length > 0) {
          setPermissions(perms.map(p => p.permission_name));
        }
      }
    } catch (err) {
      console.error('Data Sync Error:', err);
    }
  };

  // 3. Fungsi Login Utama (Fast & Reliable)
  const login = async (email, password) => {
    // Jalankan login ke Supabase
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      // Coba jalur legacy jika Auth belum siap
      const { data: legProf, error: legErr } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', email)
        .eq('password', password)
        .maybeSingle();

      if (legErr || !legProf) throw new Error(error.message || 'Invalid credentials');
      
      // 🛡️ SECURITY CHECK: Blocking inactive users
      if (legProf.is_active === false) {
        throw new Error('Your account has been disabled. Please contact the system administrator.');
      }

      setProfile(legProf);
      localStorage.setItem('wkn_user', JSON.stringify(legProf));
      return legProf;
    }

    // 🛡️ SECURITY CHECK: Blocking inactive users after successful login
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', email)
      .maybeSingle();

    if (profileData && profileData.is_active === false) {
      await supabase.auth.signOut();
      throw new Error('Your account has been disabled. Please contact the system administrator.');
    }

    return data.user;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const can = (permission) => {
    if (permissions.length > 0) return permissions.includes(permission);
    return hasPermission(profile?.role, permission);
  };

  const isAdmin = () => ['owner', 'admin'].includes(profile?.role);
  const isManager = () => ['owner', 'admin', 'manager'].includes(profile?.role);

  return (
    <AuthContext.Provider value={{ 
      user, profile, permissions, loading, 
      login, logout, can, isAdmin, isManager, PERMISSIONS 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
