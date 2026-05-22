import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView, 
  Image, 
  ScrollView, 
  Platform, 
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AttendanceCamera from '../../components/AttendanceCamera';
import { supabase } from '../../lib/supabaseClient';
import { useTheme } from '../../context/ThemeContext';

import * as Location from 'expo-location';
import * as Network from 'expo-network';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { colors, isDark } = useTheme();
  const [showCamera, setShowCamera] = useState(false);
  const [cameraType, setCameraType] = useState<'IN' | 'OUT'>('IN');
  const [userData, setUserData] = useState<{id: string, name: string, jabatan?: string} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<{temp: number, condition: string, city: string} | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('Mencari lokasi...');
  const [notificationCount, setNotificationCount] = useState(3);
  const [networkState, setNetworkState] = useState<{type: string, isConnected: boolean}>({ type: 'NONE', isConnected: false });
  const [showBanner, setShowBanner] = useState(true);
  const [pendingAttendance, setPendingAttendance] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Micro-Interaction States
  const inScale = useRef(new Animated.Value(1)).current;
  const outScale = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkSession();
    getLocationAndWeather();
    getNetworkStatus();
    startPulse();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const netTimer = setInterval(() => getNetworkStatus(), 5000); // Update network every 5s
    loadPendingAttendance();
    return () => {
      clearInterval(timer);
      clearInterval(netTimer);
    };
  }, []);

  const getNetworkStatus = async () => {
    try {
      const state = await Network.getNetworkStateAsync();
      let typeStr = 'NONE';
      if (state.type === Network.NetworkStateType.WIFI) typeStr = 'WIFI';
      if (state.type === Network.NetworkStateType.CELLULAR) typeStr = 'CELL';
      
      setNetworkState({
        type: typeStr,
        isConnected: state.isConnected ?? false
      });
    } catch (e) {
      console.log('Net info error:', e);
    }
  };

  const startPulse = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.2, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  };

  const onPressIn = (anim: Animated.Value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(anim, { toValue: 0.94, useNativeDriver: true }).start();
  };

  const onPressOut = (anim: Animated.Value) => {
    Animated.spring(anim, { toValue: 1, friction: 3, tension: 40, useNativeDriver: true }).start();
  };

  const getDynamicStyles = () => {
    const hour = currentTime.getHours();
    if (hour >= 6 && hour < 11) return { bg: '#F0F9FF', label: 'Selamat Pagi' }; // Pagi
    if (hour >= 11 && hour < 15) return { bg: '#F2F2F7', label: 'Selamat Siang' }; // Siang
    if (hour >= 15 && hour < 18) return { bg: '#FFF7ED', label: 'Selamat Sore' }; // Sore
    return { bg: '#F5F3FF', label: 'Selamat Malam' }; // Malam
  };

  const dynamic = getDynamicStyles();

  const getLocationAndWeather = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

      let location = await Location.getCurrentPositionAsync({});
      
      // Get readable address
      const reverse = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (reverse.length > 0) {
        const addr = reverse[0];
        const formattedAddr = `${addr.street || ''}, ${addr.city || addr.subregion || ''}`;
        setCurrentAddress(formattedAddr || 'Lokasi tidak dikenal');
        
        setWeather({
          temp: 31,
          condition: 'Cerah Berawan',
          city: addr.city || addr.subregion || 'Jakarta'
        });
      }
    } catch (error) {
      console.log('Error getting weather:', error);
    }
  };

  const checkSession = async () => {
    const sessionStr = await AsyncStorage.getItem('userSession');
    if (!sessionStr) {
      router.replace('/login');
    } else {
      setUserData(JSON.parse(sessionStr));
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    checkSession();
    getLocationAndWeather();
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userSession');
    router.replace('/login');
  };

  const handleClockIn = () => {
    setCameraType('IN');
    setShowCamera(true);
  };

  const handleClockOut = () => {
    setCameraType('OUT');
    setShowCamera(true);
  };

  const loadPendingAttendance = async () => {
    try {
      const stored = await AsyncStorage.getItem('pending_attendance');
      if (stored) setPendingAttendance(JSON.parse(stored));
    } catch (e) {}
  };

  const syncOfflineData = async () => {
    if (isSyncing || pendingAttendance.length === 0 || !networkState.isConnected) return;
    
    setIsSyncing(true);
    const queue = [...pendingAttendance];
    const failed = [];

    for (const item of queue) {
      try {
        const response = await fetch(item.uri);
        const blob = await response.blob();
        const fileName = `attendance_${item.employee_id}_${item.timestamp}.jpg`;
        
        const { error: uploadError } = await supabase.storage
          .from('attendance_proofs')
          .upload(fileName, blob, { contentType: 'image/jpeg' });
          
        if (uploadError) throw uploadError;
        
        const { data: publicUrlData } = supabase.storage
          .from('attendance_proofs')
          .getPublicUrl(fileName);
          
        const { error: dbError } = await supabase
          .from('attendance')
          .insert([{
            employee_id: item.employee_id,
            status: item.status,
            clock_in_time: item.status === 'IN' ? new Date(item.timestamp).toISOString() : null,
            clock_out_time: item.status === 'OUT' ? new Date(item.timestamp).toISOString() : null,
            location: item.location,
            proof_url: publicUrlData.publicUrl
          }]);
          
        if (dbError) throw dbError;
      } catch (error) {
        console.log('Sync failed for item:', error);
        failed.push(item);
      }
    }

    setPendingAttendance(failed);
    await AsyncStorage.setItem('pending_attendance', JSON.stringify(failed));
    setIsSyncing(false);
    if (failed.length === 0) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sinkronisasi Berhasil', 'Semua data absensi offline telah diunggah.');
    }
  };

  useEffect(() => {
    if (networkState.isConnected && pendingAttendance.length > 0) {
      syncOfflineData();
    }
  }, [networkState.isConnected]);

  const handleCaptureComplete = async (uri: string) => {
    try {
      if (!networkState.isConnected) {
        // Offline Mode: Queue it
        const newItem = {
          uri,
          employee_id: userData?.id,
          status: cameraType,
          location: currentAddress,
          timestamp: Date.now()
        };
        const newQueue = [...pendingAttendance, newItem];
        setPendingAttendance(newQueue);
        await AsyncStorage.setItem('pending_attendance', JSON.stringify(newQueue));
        Alert.alert('Mode Offline', 'Koneksi internet tidak tersedia. Absensi Anda telah disimpan di HP dan akan diunggah otomatis saat Anda online.');
        setShowCamera(false);
        return;
      }

      // Online Mode: Proceed as usual
      const response = await fetch(uri);
      const blob = await response.blob();
      const fileName = `attendance_${userData?.id}_${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('attendance_proofs')
        .upload(fileName, blob, { contentType: 'image/jpeg' });
        
      if (uploadError) throw uploadError;
      
      const { data: publicUrlData } = supabase.storage
        .from('attendance_proofs')
        .getPublicUrl(fileName);
        
      const { error: dbError } = await supabase
        .from('attendance')
        .insert([{
          employee_id: userData?.id,
          status: cameraType,
          clock_in_time: cameraType === 'IN' ? new Date().toISOString() : null,
          clock_out_time: cameraType === 'OUT' ? new Date().toISOString() : null,
          location: currentAddress,
          proof_url: publicUrlData.publicUrl
        }]);
        
      if (dbError) throw dbError;
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('Sukses', `Berhasil absen ${cameraType === 'IN' ? 'masuk' : 'keluar'}`);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan');
    } finally {
      setShowCamera(false);
    }
  };

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <AttendanceCamera type={cameraType} onCaptureComplete={handleCaptureComplete} />
        <TouchableOpacity style={styles.closeCameraBtn} onPress={() => setShowCamera(false)}>
          <Ionicons name="close" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* New Header Structure - Based on Reference Image */}
      <View style={[styles.headerWrapper, { backgroundColor: colors.card }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTopLeft}>
            <Text style={styles.dateLabelImage}>{currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</Text>
            <View style={styles.clockRowImage}>
              <Text style={[styles.clockTextImage, { color: colors.text }]}>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</Text>
              <View style={[styles.liveBadge, { backgroundColor: isDark ? '#1F1F1F' : '#F2F2F7' }]}>
                <Ionicons 
                  name={networkState.type === 'WIFI' ? "wifi" : "cellular"} 
                  size={10} 
                  color={networkState.isConnected ? "#10B981" : "#EF4444"} 
                />
                <View style={[styles.liveDot, { backgroundColor: networkState.isConnected ? '#10B981' : '#EF4444' }]} />
                <Text style={[styles.liveText, { color: networkState.isConnected ? "#10B981" : "#EF4444" }]}>
                  {networkState.isConnected ? 'LIVE' : 'OFFLINE'}
                </Text>
              </View>
            </View>
            
            {/* Weather Sync Row */}
            {weather && (
              <View style={styles.weatherSyncRow}>
                <Ionicons name="sunny" size={12} color="#D97706" />
                <Text style={styles.weatherTextHeader}>{weather.temp}°C • {weather.condition}</Text>
                <View style={styles.syncDot} />
                <Text style={styles.weatherCityText}>{weather.city}</Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerActionBtns}>
            <TouchableOpacity style={[styles.squareBtn, { backgroundColor: isDark ? '#1F1F1F' : '#F2F2F7' }]} onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}>
              <Ionicons name="notifications" size={20} color={colors.text} />
              {notificationCount > 0 && <View style={styles.btnDotBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSectionImage}>
          <View style={[styles.avatarCircleImage, { backgroundColor: isDark ? '#2C2C2E' : '#EEF2FF' }]}>
            <Text style={[styles.avatarTextImage, { color: isDark ? '#FFF' : '#4F46E5' }]}>{userData?.name ? userData.name.substring(0, 1) : 'A'}</Text>
          </View>
          <View style={styles.profileInfoImage}>
            <Text style={[styles.profileNameImage, { color: colors.text }]}>{userData?.name || 'User Name'}</Text>
            <Text style={styles.profileRoleImage}>{userData?.jabatan || 'Staff'} • Wijaya KN</Text>
            <Text style={styles.profileIdImage}>ID: {userData?.id || 'WKN-0000'}</Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContentCompact, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.tint} />}
      >
        {/* Compact Attendance Action Bar */}
        <View style={[styles.attendanceBar, { backgroundColor: colors.card }]}>
          <View style={styles.actionRowCompact}>
            <TouchableOpacity onPress={handleClockIn} onPressIn={() => onPressIn(inScale)} onPressOut={() => onPressOut(inScale)} style={styles.flex1} activeOpacity={1}>
              <Animated.View style={[styles.btnCompact, {backgroundColor: '#10b981', transform: [{scale: inScale}], flexDirection: 'row', gap: 8}]}>
                <Ionicons name="log-in" size={18} color="#fff" />
                <Text style={styles.btnTextCompact}>ABSEN MASUK</Text>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleClockOut} onPressIn={() => onPressIn(outScale)} onPressOut={() => onPressOut(outScale)} style={styles.flex1} activeOpacity={1}>
              <Animated.View style={[styles.btnCompact, {backgroundColor: '#f43f5e', transform: [{scale: outScale}], flexDirection: 'row', gap: 8}]}>
                <Ionicons name="log-out" size={18} color="#fff" />
                <Text style={styles.btnTextCompact}>ABSEN PULANG</Text>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Work Schedule Preview Card */}
        <View style={[styles.scheduleCard, { backgroundColor: colors.card }]}>
          <View style={styles.scheduleHeader}>
            <View style={styles.shiftBadge}>
              <Text style={styles.shiftBadgeText}>SHIFT NORMAL</Text>
            </View>
            <Text style={styles.scheduleDate}>Hari Ini</Text>
          </View>
          <View style={styles.scheduleTimeRow}>
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>JAM MASUK</Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>08:00</Text>
            </View>
            <View style={styles.timeDivider} />
            <View style={styles.timeItem}>
              <Text style={styles.timeLabel}>JAM PULANG</Text>
              <Text style={[styles.timeValue, { color: colors.text }]}>17:00</Text>
            </View>
          </View>
          <View style={styles.scheduleFooter}>
            <Ionicons name="information-circle" size={14} color="#8E8E93" />
            <Text style={styles.scheduleFooterText}>Toleransi keterlambatan: 15 Menit</Text>
          </View>
        </View>

        {/* Offline Sync Banner */}
        {pendingAttendance.length > 0 && (
          <TouchableOpacity 
            style={[styles.syncBanner, { backgroundColor: isSyncing ? '#EAB308' : '#3B82F6' }]} 
            onPress={syncOfflineData}
            disabled={isSyncing}
          >
            <Ionicons name={isSyncing ? "sync" : "cloud-upload"} size={16} color="#fff" />
            <Text style={styles.syncBannerText}>
              {isSyncing ? 'Menyingkronkan data...' : `Ada ${pendingAttendance.length} data absensi belum terunggah. Ketuk untuk sync.`}
            </Text>
          </TouchableOpacity>
        )}

        {showBanner && (
          <View style={[styles.infoBanner, { backgroundColor: colors.card }]}>
            <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1F1F1F' : '#EEF2FF', width: 40, height: 40, borderRadius: 12, marginBottom: 0 }]}>
              <Ionicons name="megaphone" size={20} color={isDark ? '#FFF' : '#4F46E5'} />
            </View>
            <View style={styles.bannerText}>
              <Text style={[styles.bannerTitle, { color: colors.text }]}>Pengumuman Kantor</Text>
              <Text style={styles.bannerDesc}>Libur Nasional 1 Juni 2024: Hari Lahir Pancasila.</Text>
            </View>
            <TouchableOpacity onPress={() => setShowBanner(false)}>
              <Ionicons name="close-circle" size={20} color={colors.subText} />
            </TouchableOpacity>
          </View>
        )}


        {/* Minimalist Activity List */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>AKTIVITAS TERAKHIR</Text>
            <TouchableOpacity><Text style={styles.seeAllCompact}>Semua</Text></TouchableOpacity>
          </View>
          
          <View style={[styles.simpleListItem, { backgroundColor: colors.card }]}>
            <View style={[styles.itemIconCircle, { backgroundColor: isDark ? '#1F1F1F' : '#ECFDF5' }]}><Ionicons name="log-in" size={14} color="#10b981" /></View>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Absen Masuk</Text>
              <Text style={styles.itemSubText}>Lokasi: {currentAddress}</Text>
            </View>
            <Text style={[styles.itemTime, { color: colors.text }]}>07:58</Text>
          </View>

          <View style={[styles.simpleListItem, { backgroundColor: colors.card }]}>
            <View style={[styles.itemIconCircle, {backgroundColor: isDark ? '#1F1F1F' : '#fff1f2'}]}><Ionicons name="log-out" size={14} color="#f43f5e" /></View>
            <View style={styles.itemTextContainer}>
              <Text style={[styles.itemTitle, { color: colors.text }]}>Absen Pulang</Text>
              <Text style={styles.itemSubText}>Lokasi: {currentAddress}</Text>
            </View>
            <Text style={[styles.itemTime, { color: colors.text }]}>17:05</Text>
          </View>
        </View>

        <View style={styles.footerSpacingSmall} />
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FB',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  headerWrapper: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerTopLeft: {
    flex: 1,
  },
  dateLabelImage: {
    fontSize: 10,
    fontWeight: '800',
    color: '#A0A0A0',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clockRowImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clockTextImage: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.5,
  },
  weatherSyncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  weatherTextHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  syncDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#CBD5E1',
  },
  weatherCityText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  headerActionBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  squareBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8F9FB',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F2F2F7',
    position: 'relative',
  },
  btnDotBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#E31E24',
  },
  profileSectionImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  avatarCircleImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextImage: {
    fontSize: 22,
    fontWeight: '800',
    color: '#4F46E5',
  },
  profileInfoImage: {
    flex: 1,
  },
  profileNameImage: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  profileRoleImage: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  profileIdImage: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0056D2',
    letterSpacing: 0.5,
  },
  scrollContentCompact: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  attendanceBar: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 5,
  },
  clockInfoCol: {
    alignItems: 'flex-end',
  },
  weatherRowSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  weatherTextSmall: {
    fontSize: 12,
    fontWeight: '700',
    color: '#D97706',
  },
  workHoursSmall: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  actionRowCompact: {
    flexDirection: 'row',
    gap: 12,
  },
  btnCompact: {
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnTextCompact: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  flex1: {
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  bentoBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#EF4444',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    zIndex: 10,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  scheduleCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  shiftBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  shiftBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4F46E5',
    letterSpacing: 0.5,
  },
  scheduleDate: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
  },
  scheduleTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  timeItem: {
    flex: 1,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94A3B8',
    marginBottom: 4,
    letterSpacing: 1,
  },
  timeValue: {
    fontSize: 22,
    fontWeight: '900',
  },
  timeDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#F1F5F9',
  },
  scheduleFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  scheduleFooterText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    marginBottom: 15,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  syncBannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 15,
    borderRadius: 20,
    marginTop: 20,
    gap: 15,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  bannerText: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 2,
  },
  bannerDesc: {
    fontSize: 12,
    color: '#4338CA',
    fontWeight: '500',
  },
  listSection: {
    marginTop: 30,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  listTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 1,
  },
  seeAllCompact: {
    fontSize: 12,
    fontWeight: '700',
    color: '#E31E24',
  },
  simpleListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 20,
    marginBottom: 10,
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ECFDF5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  itemSubText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  itemTime: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  footerSpacingSmall: {
    height: 100,
  },
  closeCameraBtn: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
