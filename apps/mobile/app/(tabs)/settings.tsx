import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Switch, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

export default function SettingsScreen() {
  const router = useRouter();
  const { theme, colors, toggleTheme, isDark } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [isBiometric, setIsBiometric] = useState(true);
  const [isNotification, setIsNotification] = useState(true);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [latency, setLatency] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await checkSession();
    runDiagnostics();
    setRefreshing(false);
  };

  useEffect(() => {
    checkSession();
    runDiagnostics();
    loadBiometricSetting();
  }, []);

  const runDiagnostics = () => {
    measureLatency();
    getGpsAccuracy();
  };

  const loadBiometricSetting = async () => {
    try {
      const lockEnabled = await AsyncStorage.getItem('appLockEnabled');
      setIsBiometric(lockEnabled === 'true');
    } catch (e) {}
  };

  const toggleBiometricSetting = async (value: boolean) => {
    setIsBiometric(value);
    await AsyncStorage.setItem('appLockEnabled', value ? 'true' : 'false');
  };

  const measureLatency = async () => {
    const start = Date.now();
    try {
      await supabase.from('employees').select('id').limit(1);
      setLatency(Date.now() - start);
    } catch (e) {
      setLatency(null);
    }
  };

  const getGpsAccuracy = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getLastKnownPositionAsync({});
      if (pos) setGpsAccuracy(Math.round(pos.coords.accuracy || 0));
    } catch (e) {
      setGpsAccuracy(null);
    }
  };

  const handleClearCache = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      // We keep userSession, but clear everything else
      const keys = await AsyncStorage.getAllKeys();
      const keysToRemove = keys.filter(k => k !== 'userSession');
      await AsyncStorage.multiRemove(keysToRemove);
      alert('Cache berhasil dibersihkan!');
    } catch (e) {
      console.log('Clear cache error:', e);
    }
  };

  const checkSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('userSession');
      if (sessionData) {
        const localUser = JSON.parse(sessionData);
        setUserData(localUser);

        // Sync with Supabase for latest data
        const { data, error } = await supabase
          .from('employees')
          .select('*, departments(name)')
          .eq('id', localUser.id)
          .single();

        if (data && !error) {
          const updatedUser = {
            ...localUser,
            name: data.name,
            jabatan: data.job_position,
            email: data.email,
            phone: data.phone || '-',
            join_date: data.join_date || '-',
            department: data.departments?.name || 'Wijaya KN',
            last_device_model: data.last_device_model
          };
          setUserData(updatedUser);
          await AsyncStorage.setItem('userSession', JSON.stringify(updatedUser));
        }
      }
    } catch (e) {
      console.log('Error syncing session with Supabase:', e);
    }
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await AsyncStorage.removeItem('userSession');
    router.replace('/login');
  };

  const SettingItem = ({ icon, title, value, type = 'chevron', color = '#1C1C1E', onPress }: any) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      activeOpacity={0.7} 
      onPress={onPress}
      disabled={type === 'switch'}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={[styles.settingTitle, { color: colors.text }]}>{title}</Text>
      {type === 'chevron' && <Ionicons name="chevron-forward" size={20} color="#C7C7CC" />}
      {type === 'switch' && (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: '#D1D1D6', true: '#34C759' }}
        />
      )}
      {type === 'text' && <Text style={styles.settingValue}>{value}</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pengaturan</Text>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContent, { backgroundColor: colors.background }]} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} tintColor="#F97316" />
        }
      >
        {/* Professional ID Card - Compact Horizontal */}
        <View style={[styles.idCardModern, { backgroundColor: colors.card }]}>
          <View style={styles.idCardHeader}>
            <View style={styles.logoCircleSmall}><Text style={styles.logoTextSmall}>WKN</Text></View>
            <Text style={styles.idCardSystemText}>EMPLOYEE IDENTITY SYSTEM</Text>
          </View>
          
          <View style={styles.idCardBody}>
            <View style={styles.idCardLeft}>
              <View style={[styles.avatarIdCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Text style={[styles.avatarTextId, { color: colors.text }]}>{userData?.name ? userData.name.substring(0, 1) : 'A'}</Text>
              </View>
            </View>
            <View style={styles.idCardRight}>
              <Text style={[styles.idCardName, { color: colors.text }]}>{userData?.name || 'User Name'}</Text>
              <Text style={styles.idCardRole}>{userData?.jabatan || 'Staff'}</Text>
              <View style={[styles.idCardDivider, { backgroundColor: colors.border }]} />
              <View style={styles.idCardMeta}>
                <View>
                  <Text style={styles.metaLabel}>SYSTEM ID</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>{userData?.id || 'WKN-0000'}</Text>
                </View>
                <View>
                  <Text style={styles.metaLabel}>UNIT</Text>
                  <Text style={[styles.metaValue, { color: colors.text }]}>{userData?.department || 'WKN'}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Personal Data has been removed to a secure auth screen */}

        <Text style={[styles.sectionTitleCompact, { color: colors.subText }]}>AKUN & KEAMANAN</Text>
        <View style={[styles.sectionCardCompact, { backgroundColor: colors.card }]}>
          <SettingItem icon="person-outline" title="Data Pribadi & Rekening" color="#3b82f6" onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/personal-data-auth' as any);
          }} />
          <SettingItem icon="finger-print-outline" title="Biometric Login" type="switch" value={isBiometric} onPress={toggleBiometricSetting} color="#10b981" />
          <SettingItem icon="create-outline" title="Tanda Tangan Elektronik" color="#F97316" onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/signature' as any);
          }} />
          <SettingItem icon="lock-closed-outline" title="Ubah Kata Sandi" color="#f59e0b" onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/change-password' as any);
          }} />
          <SettingItem icon="phone-portrait-outline" title="Perangkat Aktif" type="text" value={userData?.last_device_model || 'Memuat...'} color="#8b5cf6" onPress={() => {}} />
        </View>

        <Text style={[styles.sectionTitleCompact, { color: colors.subText }]}>PREFERENSI</Text>
        <View style={[styles.sectionCardCompact, { backgroundColor: colors.card }]}>
          <SettingItem icon="notifications-outline" title="Notifikasi" type="switch" value={isNotification} onPress={() => setIsNotification(!isNotification)} color="#ef4444" />
          <SettingItem icon="moon-outline" title="Mode Gelap" type="switch" value={isDark} onPress={toggleTheme} color="#6366f1" />
        </View>

        <Text style={[styles.sectionTitleCompact, { color: colors.subText }]}>TEKNIS & DIAGNOSTIK</Text>
        <View style={[styles.sectionCardCompact, { backgroundColor: colors.card }]}>
          <SettingItem icon="trash-outline" title="Bersihkan Cache" color="#8e8e93" onPress={handleClearCache} />
          <SettingItem icon="location-outline" title="Akurasi GPS" type="text" value={`${gpsAccuracy || '--'} meters`} color="#3b82f6" onPress={getGpsAccuracy} />
          <SettingItem icon="pulse-outline" title="Latensi Server" type="text" value={`${latency || '--'} ms`} color="#10b981" onPress={measureLatency} />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  scrollContent: {
    padding: 14,
  },
  idCardModern: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
    borderLeftWidth: 6,
    borderLeftColor: '#F97316',
  },
  idCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  logoCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTextSmall: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  idCardSystemText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1.5,
  },
  idCardBody: {
    flexDirection: 'row',
    gap: 12,
  },
  idCardLeft: {
    alignItems: 'center',
  },
  avatarIdCard: {
    width: 65,
    height: 65,
    borderRadius: 18,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  avatarTextId: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  idCardRight: {
    flex: 1,
  },
  idCardName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  idCardRole: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  idCardDivider: {
    height: 1,
    backgroundColor: '#F2F2F7',
    marginVertical: 12,
  },
  idCardMeta: {
    flexDirection: 'row',
    gap: 25,
  },
  metaLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#A0A0A0',
    letterSpacing: 0.5,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 2,
  },
  detailSection: {
    backgroundColor: '#F8F9FB',
    padding: 14,
    borderRadius: 14,
    marginBottom: 25,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F2F2F7',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 13,
    color: '#1C1C1E',
    fontWeight: '700',
  },
  sectionTitleCompact: {
    fontSize: 11,
    fontWeight: '800',
    color: '#A0A0A0',
    marginLeft: 5,
    marginBottom: 8,
    letterSpacing: 1,
  },
  sectionCardCompact: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingHorizontal: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 1,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F8F9FB',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTitle: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  settingValue: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    padding: 14,
    borderRadius: 12,
    gap: 10,
    marginTop: 5,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '700',
  }
});
