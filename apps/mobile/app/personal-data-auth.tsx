import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Animated, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

export default function PersonalDataAuthScreen() {
  const { userData } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start();
    
    checkBiometric();
  }, []);

  const checkBiometric = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(hasHardware && isEnrolled);
  };

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Verifikasi Akses Data Pribadi',
      fallbackLabel: 'Gunakan Password',
    });

    if (result.success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/personal-data');
    }
  };

  const handleVerify = async () => {
    if (!password) {
      setErrorMsg('Masukkan password Anda');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const hashedPass = CryptoJS.SHA256(password).toString();
      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000/api';
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await fetch(`${apiUrl}/auth/employee/verify-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email: userData?.email || '', password: hashedPass }),
      });
      
      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Password salah');
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace('/personal-data');
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
        </View>

        <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="shield-checkmark" size={40} color="#10B981" />
          </View>
          
          <Text style={styles.title}>Verifikasi Keamanan</Text>
          <Text style={styles.subtitle}>Sesuai standar keamanan, masukkan password Anda untuk melihat atau mengubah Data Pribadi & Rekening.</Text>

          {errorMsg ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={16} color="#ef4444" />
              <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password Aplikasi"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoFocus
            />
          </View>

          <TouchableOpacity style={styles.btnPrimary} onPress={handleVerify} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnTextPrimary}>VERIFIKASI</Text>}
          </TouchableOpacity>

          {isBiometricAvailable && (
            <TouchableOpacity style={styles.btnBiometric} onPress={handleBiometric}>
              <Ionicons name="finger-print" size={20} color="#F97316" />
              <Text style={styles.btnTextBiometric}>Gunakan Sidik Jari / Face ID</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  keyboardView: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  content: { flex: 1, paddingHorizontal: 25, paddingTop: 40, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#D1FAE5', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '800', color: '#1C1C1E', marginBottom: 10 },
  subtitle: { fontSize: 13, color: '#8E8E93', textAlign: 'center', marginBottom: 30, lineHeight: 20, paddingHorizontal: 10 },
  errorBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', padding: 12, borderRadius: 12, marginBottom: 20, width: '100%' },
  errorText: { color: '#ef4444', fontSize: 12, fontWeight: '600', marginLeft: 8 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, height: 56, paddingHorizontal: 16, width: '100%', marginBottom: 20, borderWidth: 1, borderColor: '#F2F2F7' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 15, color: '#1C1C1E', fontWeight: '600' },
  btnPrimary: { backgroundColor: '#F97316', width: '100%', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginBottom: 15 },
  btnTextPrimary: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  btnBiometric: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF7ED', width: '100%', height: 56, borderRadius: 16, borderWidth: 1, borderColor: '#FFEDD5' },
  btnTextBiometric: { color: '#F97316', fontSize: 14, fontWeight: '700', marginLeft: 10 },
});
