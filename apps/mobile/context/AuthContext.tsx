import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState, AppStateStatus, View, Text, TouchableOpacity, Modal, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, SplashScreen } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { Ionicons } from '@expo/vector-icons';

type UserData = {
  id: string;
  name: string;
  email: string;
  jabatan?: string;
  is_field_team?: boolean;
  working_location?: string;
};

type AuthContextType = {
  userData: UserData | null;
  loading: boolean;
  setUserData: (user: UserData | null) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  userData: null,
  loading: true,
  setUserData: () => {},
  logout: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();

  const appState = useRef(AppState.currentState);
  const backgroundTime = useRef<number | null>(null);
  const TEN_HOURS_MS = 10 * 60 * 60 * 1000;
  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  useEffect(() => {
    checkUserSession();

    // AppState Listener for timeouts and biometric locks
    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App is resuming
        checkSessionExpiry();
        
        // Check 5-minute Biometric Lock
        const lockEnabled = await AsyncStorage.getItem('appLockEnabled');
        if (lockEnabled === 'true' && backgroundTime.current) {
          const elapsed = Date.now() - backgroundTime.current;
          if (elapsed > FIVE_MINUTES_MS && userData) {
            setIsLocked(true);
            promptBiometricUnlock();
          }
        }
        backgroundTime.current = null;
      } else if (appState.current === 'active' && nextAppState.match(/inactive|background/)) {
        // App is backgrounding
        backgroundTime.current = Date.now();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [userData]);

  const promptBiometricUnlock = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    
    if (hasHardware && isEnrolled) {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Buka WKN Mobile',
        fallbackLabel: 'Gunakan Sandi',
      });
      if (result.success) {
        setIsLocked(false);
      }
    } else {
      // If no hardware but locked somehow, fallback to unlock (edge case)
      setIsLocked(false);
    }
  };

  const handleManualUnlockFallback = () => {
    logout();
    setIsLocked(false);
  };

  const checkSessionExpiry = async () => {
    try {
      const loginTime = await AsyncStorage.getItem('loginTimestamp');
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        if (elapsed > TEN_HOURS_MS) {
          logout();
        }
      }
    } catch (e) {}
  };

  const checkUserSession = async () => {
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      const loginTime = await AsyncStorage.getItem('loginTimestamp');
      
      let isExpired = false;
      if (loginTime) {
        const elapsed = Date.now() - parseInt(loginTime, 10);
        if (elapsed > TEN_HOURS_MS) isExpired = true;
      } else {
        if (sessionStr) isExpired = true; // Force login if old session without timestamp
      }

      if (isExpired) {
        await AsyncStorage.removeItem('userSession');
        setUserData(null);
      } else if (sessionStr) {
        setUserData(JSON.parse(sessionStr));
      }
      
    } catch (error) {
      console.log('Error loading session:', error);
    } finally {
      setLoading(false);
      SplashScreen.hideAsync();
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      setUserData(null);
      router.replace('/login');
    } catch (error) {
      console.log('Error during logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ userData, loading, setUserData, logout }}>
      {children}
      
      {/* Biometric Lock Overlay */}
      <Modal visible={isLocked} animationType="fade" transparent={false}>
        <View style={styles.lockContainer}>
          <Ionicons name="lock-closed" size={64} color="#F97316" />
          <Text style={styles.lockTitle}>Aplikasi Terkunci</Text>
          <Text style={styles.lockDesc}>Sesi Anda dikunci demi keamanan karena tidak ada aktivitas lebih dari 5 menit.</Text>
          
          <TouchableOpacity style={styles.unlockBtn} onPress={promptBiometricUnlock}>
            <Ionicons name="finger-print" size={20} color="#fff" style={{marginRight: 8}} />
            <Text style={styles.unlockBtnText}>Buka Kunci</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.logoutBtn} onPress={handleManualUnlockFallback}>
            <Text style={styles.logoutBtnText}>Logout & Ganti Akun</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </AuthContext.Provider>
  );
};

const styles = StyleSheet.create({
  lockContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  lockTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  lockDesc: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 22,
  },
  unlockBtn: {
    backgroundColor: '#F97316',
    flexDirection: 'row',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
    justifyContent: 'center',
  },
  unlockBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  logoutBtn: {
    padding: 15,
  },
  logoutBtnText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  }
});
