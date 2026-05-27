import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar, ScrollView, Image, Alert, Animated, Easing, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Device from 'expo-device';
import { supabase } from '../lib/supabaseClient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const { setUserData } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  
  // High-End Animation States
  const logoFade = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const cardFade = useRef(new Animated.Value(0)).current;
  const cardSlide = useRef(new Animated.Value(40)).current;
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const footerFade = useRef(new Animated.Value(0)).current;

  // Focus States
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  useEffect(() => {
    checkBiometricStatus();
    loadRememberMe();
    startEntranceAnimation();
    
    // Auto-trigger Biometric Auth if enabled
    setTimeout(async () => {
      const lockEnabled = await AsyncStorage.getItem('appLockEnabled');
      const saved = await AsyncStorage.getItem('savedCredentials');
      if (lockEnabled === 'true' && saved) {
        handleBiometricAuth();
      }
    }, 1000); // Small delay to allow entrance animation to start
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setErrorMsg('');
    
    // Reset Animations
    logoFade.setValue(0);
    logoScale.setValue(0.8);
    cardFade.setValue(0);
    cardSlide.setValue(40);
    cardScale.setValue(0.96);
    footerFade.setValue(0);
    
    startEntranceAnimation();

    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  }, []);

  const startEntranceAnimation = () => {
    Animated.sequence([
      // 1. Logo Animation
      Animated.parallel([
        Animated.timing(logoFade, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 8, tension: 40, useNativeDriver: true }),
      ]),
      // 2. Card Animation (Staggered)
      Animated.stagger(100, [
        Animated.parallel([
          Animated.timing(cardFade, { toValue: 1, duration: 800, useNativeDriver: true }),
          Animated.timing(cardSlide, { toValue: 0, duration: 1000, easing: Easing.bezier(0.23, 1, 0.32, 1), useNativeDriver: true }),
          Animated.spring(cardScale, { toValue: 1, friction: 9, tension: 35, useNativeDriver: true }),
        ]),
        // 3. Footer Animation
        Animated.timing(footerFade, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ]).start();
  };

  const checkBiometricStatus = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    setIsBiometricAvailable(hasHardware && isEnrolled);
  };

  const loadRememberMe = async () => {
    try {
      const savedEmail = await AsyncStorage.getItem('rememberedEmail');
      const savedRememberMe = await AsyncStorage.getItem('rememberMe');
      
      if (savedEmail) setEmail(savedEmail);
      if (savedRememberMe === 'true') setRememberMe(true);
    } catch (e) {}
  };

  const handleBiometricAuth = async () => {
    const saved = await AsyncStorage.getItem('savedCredentials');
    if (!saved) {
      Alert.alert('Aktivasi Diperlukan', 'Silakan login manual sekali untuk mengaktifkan fitur ini.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Konfirmasi Identitas Anda',
      fallbackLabel: 'Gunakan Password',
    });

    if (result.success) {
      const { email: savedEmail, password: savedPassword } = JSON.parse(saved);
      performManualLogin(savedEmail, savedPassword);
    }
  };

  const performManualLogin = async (inputEmail: string, inputPass: string) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, email, mobile_password, status, is_resigned, job_position, is_field_team, working_location')
        .ilike('email', inputEmail.trim())
        .single();

      if (error || !data) throw new Error('Email tidak terdaftar');
      if (data.is_resigned || data.status === 'RESIGNED') throw new Error('Akun dinonaktifkan');
      if (data.mobile_password !== inputPass) throw new Error('Password salah');

      const userSessionData = {
        id: data.id,
        name: data.name,
        email: data.email,
        jabatan: data.job_position || 'Staff',
        is_field_team: data.is_field_team || false,
        working_location: data.working_location || 'Head Office'
      };
      
      await AsyncStorage.setItem('userSession', JSON.stringify(userSessionData));
      setUserData(userSessionData);

      // Track Device Info for Advanced Security
      try {
        const deviceBrand = Device.brand || Device.manufacturer || 'Unknown';
        const deviceModel = Device.modelName || 'Unknown';
        const deviceOs = `${Platform.OS} ${Platform.Version}`;
        
        await supabase
          .from('employees')
          .update({
            last_device_brand: deviceBrand,
            last_device_model: deviceModel,
            last_device_os: deviceOs
          })
          .eq('id', data.id);
      } catch (deviceError) {
        console.log('Failed to track device info', deviceError);
      }

      if (rememberMe) {
        await AsyncStorage.setItem('rememberedEmail', inputEmail);
        await AsyncStorage.setItem('rememberMe', 'true');
      } else {
        await AsyncStorage.removeItem('rememberedEmail');
        await AsyncStorage.setItem('rememberMe', 'false');
      }

      await AsyncStorage.setItem('savedCredentials', JSON.stringify({
        email: inputEmail,
        password: inputPass
      }));

      router.replace('/(tabs)');
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  const handleHelp = () => {
    Alert.alert(
      'Pusat Bantuan WKNsite',
      'Butuh bantuan untuk masuk ke sistem? Silakan pilih opsi dukungan di bawah ini:',
      [
        {
          text: 'Lupa Password / Akun',
          onPress: () => Alert.alert('Informasi', 'Silakan hubungi admin HR di kantor pusat untuk melakukan reset password atau aktivasi akun email baru.'),
        },
        {
          text: 'Hubungi IT Support (WA)',
          onPress: () => Alert.alert('WhatsApp IT', 'Mengarahkan ke WhatsApp Support... (Fitur ini dapat dihubungkan ke nomor WA IT WKN)'),
        },
        {
          text: 'Tutup',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleLogin = () => {
    if (!email || !password) {
      setErrorMsg('Harap lengkapi semua data');
      return;
    }
    performManualLogin(email, password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          showsVerticalScrollIndicator={false}
          bounces={true}
          refreshControl={
            <RefreshControl 
              refreshing={refreshing} 
              onRefresh={onRefresh} 
              colors={['#F97316']} 
              tintColor={'#F97316'} 
            />
          }
        >
          <View style={styles.innerContent}>
            {/* Background Decorative Circles */}
            <View style={styles.circle1} />
            <View style={styles.circle2} />

            {/* Center Content Group */}
            <View style={styles.centerGroup}>
              {/* 1. Animated Logo / Header */}
              <Animated.View style={[
                styles.header, 
                { opacity: logoFade, transform: [{ scale: logoScale }] }
              ]}>
                <View style={styles.logoWrapper}>
                  <View style={styles.logoContainer}>
                    <Image 
                      source={require('../assets/wkn_logo.png')} 
                      style={styles.wknLogo} 
                      resizeMode="contain"
                    />
                  </View>
                  <View style={styles.logoBadge}>
                    <Ionicons name="shield-checkmark" size={16} color="#ffffff" />
                  </View>
                </View>
                <Text style={styles.titleText}>WKNsite<Text style={{color: '#F97316'}}>.mobile</Text></Text>
                <Text style={styles.subtitleText}>Enterprise Personnel Gateway</Text>
              </Animated.View>

              {/* 2. Animated Form Card */}
              <Animated.View style={[
                styles.formCard, 
                { 
                  opacity: cardFade, 
                  transform: [
                    { translateY: cardSlide },
                    { scale: cardScale }
                  ] 
                }
              ]}>
                {errorMsg ? (
                  <View style={styles.errorBox}>
                    <Ionicons name="alert-circle" size={18} color="#e11d48" />
                    <Text style={styles.errorText}>{errorMsg}</Text>
                  </View>
                ) : null}

                {/* Email Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isEmailFocused && { color: '#F97316' }]}>EMAIL PERUSAHAAN</Text>
                  <View style={[styles.inputWrapper, isEmailFocused && styles.inputWrapperFocused]}>
                    <Ionicons name="mail" size={18} color={isEmailFocused ? "#F97316" : "#94a3b8"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="nama@wijayakn.com"
                      placeholderTextColor="#94a3b8"
                      value={email}
                      onChangeText={setEmail}
                      onFocus={() => setIsEmailFocused(true)}
                      onBlur={() => setIsEmailFocused(false)}
                      autoCapitalize="none"
                      keyboardType="email-address"
                      autoCorrect={false}
                    />
                  </View>
                </View>

                {/* Password Input */}
                <View style={styles.inputGroup}>
                  <Text style={[styles.label, isPasswordFocused && { color: '#F97316' }]}>PASSWORD</Text>
                  <View style={[styles.inputWrapper, isPasswordFocused && styles.inputWrapperFocused]}>
                    <Ionicons name="lock-closed" size={18} color={isPasswordFocused ? "#F97316" : "#94a3b8"} style={styles.inputIcon} />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      value={password}
                      onChangeText={setPassword}
                      onFocus={() => setIsPasswordFocused(true)}
                      onBlur={() => setIsPasswordFocused(false)}
                      secureTextEntry={!showPassword}
                      autoCorrect={false}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.showPasswordBtn}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color="#94a3b8" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remember Me & Forgot Password Row */}
                <View style={styles.rowActions}>
                  <TouchableOpacity 
                    style={styles.rememberMeContainer}
                    onPress={() => setRememberMe(!rememberMe)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                      {rememberMe && <Ionicons name="checkmark" size={14} color="#ffffff" />}
                    </View>
                    <Text style={styles.rememberMeText}>Ingat Saya</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={handleHelp} activeOpacity={0.7}>
                    <Text style={styles.forgotPassText}>Bantuan?</Text>
                  </TouchableOpacity>
                </View>

                {/* Login Button Row */}
                <View style={styles.loginActionRow}>
                  <TouchableOpacity 
                    style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
                    onPress={handleLogin}
                    disabled={loading}
                    activeOpacity={0.9}
                  >
                    {loading ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <>
                        <Text style={styles.loginBtnText}>MASUK KE SISTEM</Text>
                        <View style={styles.btnIconContainer}>
                          <Ionicons name="arrow-forward" size={18} color="#F97316" />
                        </View>
                      </>
                    )}
                  </TouchableOpacity>

                  {isBiometricAvailable && (
                    <TouchableOpacity 
                      onPress={handleBiometricAuth}
                      style={styles.biometricQuickBtn}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="finger-print" size={32} color="#F97316" />
                    </TouchableOpacity>
                  )}
                </View>

                <Text style={styles.termsText}>
                  Dengan masuk ke sistem, Anda menyatakan setuju atas <Text style={{fontWeight: '900', color: '#475569'}}>Syarat & Ketentuan</Text> serta <Text style={{fontWeight: '900', color: '#475569'}}>Kebijakan Privasi</Text> yang berlaku sesuai regulasi Perlindungan Data Pribadi di Indonesia.
                </Text>
              </Animated.View>
            </View>

            {/* 3. Animated Footer */}
            <Animated.View style={[
              styles.footerContainer, 
              { opacity: footerFade }
            ]}>
              {/* Security Badges Row */}
              <View style={styles.securityRow}>
                <View style={styles.securityItem}>
                  <Ionicons name="shield-outline" size={12} color="#f87171" />
                  <Text style={styles.securityText}>SECURE SSL</Text>
                </View>
                <View style={styles.securityDivider} />
                <View style={styles.securityItem}>
                  <Ionicons name="checkmark-circle-outline" size={12} color="#34d399" />
                  <Text style={styles.securityText}>ENCRYPTED</Text>
                </View>
              </View>

              <Text style={styles.copyrightText}>© 2026 PT WIJAYA KREATIF NUSANTARA</Text>
              <Text style={styles.versionText}>v1.0.4 - ENTERPRISE PERSONEL GATEWAY</Text>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  keyboardView: {
    flex: 1,
  },
  innerContent: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  centerGroup: {
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 20,
  },
  circle1: {
    position: 'absolute',
    top: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#fff1f2',
    zIndex: -1,
  },
  circle2: {
    position: 'absolute',
    bottom: -60,
    left: -100,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#f1f5f9',
    zIndex: -1,
  },
  header: {
    alignItems: 'center',
    marginBottom: 25, // Dikurangi dari 35
  },
  logoWrapper: {
    position: 'relative',
    marginBottom: 16,
  },
  logoContainer: {
    width: 90,
    height: 90,
    backgroundColor: '#ffffff',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1.5,
    borderColor: '#fee2e2',
  },
  wknLogo: {
    width: 60,
    height: 60,
  },
  logoBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#10b981',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f8fafc',
    elevation: 6,
  },
  titleText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0f172a',
    letterSpacing: -1.8,
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 30,
    padding: 16,
    shadowColor: '#0f172a',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.08,
    shadowRadius: 35,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  formHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  loginActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
    gap: 12,
  },
  biometricQuickBtn: {
    width: 60,
    height: 60,
    backgroundColor: '#fff1f2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fee2e2',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1e293b',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '600',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff1f2',
    padding: 12,
    borderRadius: 14,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#fecdd3',
  },
  errorText: {
    color: '#e11d48',
    fontSize: 11,
    fontWeight: '800',
    marginLeft: 8,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#64748b',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#f1f5f9',
    height: 56,
    paddingHorizontal: 16,
  },
  inputWrapperFocused: {
    borderColor: '#F97316',
    backgroundColor: '#ffffff',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  showPasswordBtn: {
    padding: 8,
  },
  rowActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: '#ffffff',
  },
  checkboxChecked: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  rememberMeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#F97316',
  },
  loginBtn: {
    flex: 1,
    backgroundColor: '#F97316',
    height: 60,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  loginBtnDisabled: {
    backgroundColor: '#cbd5e1',
    shadowOpacity: 0.1,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  termsText: {
    fontSize: 10,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 14,
    lineHeight: 15,
    paddingHorizontal: 10,
  },
  btnIconContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    width: 28,
    height: 28,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 15,
  },
  footerContainer: {
    marginTop: 'auto',
    paddingTop: 30,
    paddingBottom: 20,
    alignItems: 'center',
  },
  securityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'rgba(241, 245, 249, 0.5)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 14,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  securityText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 1,
  },
  securityDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#cbd5e1',
    marginHorizontal: 10,
  },
  copyrightText: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  versionText: {
    fontSize: 8,
    color: '#cbd5e1',
    fontWeight: '700',
    textTransform: 'uppercase',
  }
});
