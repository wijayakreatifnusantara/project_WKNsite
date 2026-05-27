import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Platform, 
  StatusBar,
  RefreshControl,
  Dimensions,
  Animated,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [userData, setUserData] = useState<{id: string, name: string, jabatan?: string, is_field_team?: boolean, working_location?: string} | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [weather, setWeather] = useState<{temp: number, condition: string, city: string} | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string>('Mencari lokasi...');
  const [notificationCount, setNotificationCount] = useState(0);
  const [networkState, setNetworkState] = useState<{type: string, isConnected: boolean}>({ type: 'NONE', isConnected: false });
  const [showBanner, setShowBanner] = useState(true);
  const [pendingAttendance, setPendingAttendance] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [todayRecord, setTodayRecord] = useState<{id?: string, clock_in?: string, clock_out?: string, status?: string} | null>(null);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

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
    const netTimer = setInterval(() => getNetworkStatus(), 5000);
    loadPendingAttendance();
    return () => {
      clearInterval(timer);
      clearInterval(netTimer);
    };
  }, []);

  const fetchUnreadCount = async () => {
    if (!userData?.id) return;
    try {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('employee_id', userData.id)
        .eq('is_read', false);
      if (!error && count !== null) {
        setNotificationCount(count);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (userData) {
      fetchTodayAttendance(userData.id);
      fetchUnreadCount();

      // Realtime for notifications
      const notifSub = supabase
        .channel('public:notifications_count')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `employee_id=eq.${userData.id}` }, () => {
          fetchUnreadCount();
        })
        .subscribe();
        
      return () => {
        notifSub.unsubscribe();
      };
    }
  }, [userData]);

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

  const attendancePhase = todayRecord?.clock_out
    ? 'SELESAI'
    : todayRecord?.clock_in
      ? 'SEDANG BEKERJA'
      : 'PERSIAPAN ABSENSI';

  const attendancePhaseColor = todayRecord?.clock_out
    ? '#059669'
    : todayRecord?.clock_in
      ? '#2563EB'
      : '#D97706';

  const attendancePhaseBg = todayRecord?.clock_out
    ? '#ECFDF5'
    : todayRecord?.clock_in
      ? '#EFF6FF'
      : '#FEF3C7';

  const attendanceHint = todayRecord?.clock_out
    ? 'Hari kerja sudah selesai. Terima kasih telah bekerja hari ini.'
    : todayRecord?.clock_in
      ? 'Absen masuk sudah tercatat. Saat selesai bekerja, lakukan absen pulang untuk menutup hari kerja.'
      : 'Lakukan absen masuk terlebih dahulu untuk mulai aktivitas kerja.';

  const isClockInDone = !!todayRecord?.clock_in;
  const isClockOutDone = !!todayRecord?.clock_out;
  const isClockOutBlocked = !todayRecord?.clock_in || isClockOutDone;

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
      const user = JSON.parse(sessionStr);
      setUserData(user);
    }
  };

  const fetchTodayAttendance = async (employeeId: string) => {
    try {
      setLoadingAttendance(true);
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const { data, error } = await supabase
        .from('attendance')
        .select('id, clock_in, clock_out, status, date')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .maybeSingle();
      if (!error) {
        setTodayRecord(data || null);
      }
    } catch (e) {
      console.log('fetchTodayAttendance error:', e);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    checkSession();
    getLocationAndWeather();
    if (userData?.id) fetchTodayAttendance(userData.id);
    setTimeout(() => setRefreshing(false), 1500);
  }, [userData]);

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
        
        const photoUrl = publicUrlData.publicUrl;

        // Check if there is an existing record for that employee on that date
        const { data: existing } = await supabase
          .from('attendance')
          .select('id, clock_in, clock_out')
          .eq('employee_id', item.employee_id)
          .eq('date', item.date)
          .maybeSingle();

        let dbError;
        if (item.clock_type === 'IN') {
          if (!existing) {
            const { error } = await supabase
              .from('attendance')
              .insert([{
                employee_id: item.employee_id,
                date: item.date,
                clock_in: item.time,
                clock_out: null,
                status: 'Present',
                notes: item.notes,
                is_manual: false,
                photo_url: photoUrl,
                location_lat: item.location_lat,
                location_lng: item.location_lng,
              }]);
            dbError = error;
          }
        } else {
          // Clock Out
          if (existing) {
            const { error } = await supabase
              .from('attendance')
              .update({
                clock_out: item.time,
                notes: item.notes,
                photo_url: photoUrl || undefined,
                location_lat: item.location_lat,
                location_lng: item.location_lng,
              })
              .eq('id', existing.id);
            dbError = error;
          } else {
            const { error } = await supabase
              .from('attendance')
              .insert([{
                employee_id: item.employee_id,
                date: item.date,
                clock_in: null,
                clock_out: item.time,
                status: 'Present',
                notes: item.notes,
                is_manual: false,
                photo_url: photoUrl,
                location_lat: item.location_lat,
                location_lng: item.location_lng,
              }]);
            dbError = error;
          }
        }
          
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
      if (userData?.id) fetchTodayAttendance(userData.id);
    }
  };

  useEffect(() => {
    if (networkState.isConnected && pendingAttendance.length > 0) {
      syncOfflineData();
    }
  }, [networkState.isConnected]);

  const handleCaptureComplete = async (uri: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const nowTime = new Date().toTimeString().substring(0, 8); // HH:MM:SS

      // Anti-Cheating check: Fetch high-accuracy location and check for Mock GPS
      let location: Location.LocationObject | null = null;
      try {
        let { status } = await Location.getForegroundPermissionsAsync();
        if (status === 'granted') {
          location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High
          });
          
          if (location && (location as any).mocked) {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              '⚠️ Presensi Ditolak (Anti-Cheating)',
              'Sistem mendeteksi penggunaan Fake GPS / Lokasi Palsu pada perangkat Anda. Silakan matikan aplikasi lokasi palsu Anda untuk melakukan absensi.'
            );
            setShowCamera(false);
            return;
          }
        } else {
          Alert.alert('Izin Lokasi Diperlukan', 'Presensi memerlukan akses lokasi presisi Anda.');
          setShowCamera(false);
          return;
        }
      } catch (err) {
        console.log('Error verifying location:', err);
      }

      if (!networkState.isConnected) {
        // Offline Mode: Queue for later sync
        const newItem = {
          uri,
          employee_id: userData?.id,
          date: today,
          clock_type: cameraType,
          time: nowTime,
          notes: `Mobile check-${cameraType.toLowerCase()} (Offline) | ${currentAddress}`,
          timestamp: Date.now(),
          location_lat: location?.coords.latitude || null,
          location_lng: location?.coords.longitude || null,
        };
        const newQueue = [...pendingAttendance, newItem];
        setPendingAttendance(newQueue);
        await AsyncStorage.setItem('pending_attendance', JSON.stringify(newQueue));
        Alert.alert('Mode Offline', 'Koneksi internet tidak tersedia. Absensi Anda telah disimpan di HP dan akan diunggah otomatis saat Anda online.');
        setShowCamera(false);
        return;
      }

      // --- ONLINE MODE ---
      // Try to upload selfie proof (non-critical, skip if bucket not ready)
      let photoUrl: string | null = null;
      try {
        const response = await fetch(uri);
        const blob = await response.blob();
        const fileName = `attendance_${userData?.id}_${Date.now()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('attendance_proofs')
          .upload(fileName, blob, { contentType: 'image/jpeg' });
        if (!uploadError) {
          const { data: pubData } = supabase.storage
            .from('attendance_proofs')
            .getPublicUrl(fileName);
          photoUrl = pubData?.publicUrl || null;
        }
      } catch (_) {}

      // Check if there's already a record for today
      const { data: existing } = await supabase
        .from('attendance')
        .select('id, clock_in, clock_out')
        .eq('employee_id', userData?.id)
        .eq('date', today)
        .maybeSingle();

      if (cameraType === 'IN') {
        if (existing) {
          Alert.alert('Sudah Absen Masuk', `Anda sudah absen masuk pukul ${existing.clock_in?.substring(0, 5) || '-'} hari ini.`);
          setShowCamera(false);
          return;
        }
        // INSERT new record
        const { error: insertError } = await supabase
          .from('attendance')
          .insert([{
            employee_id: userData?.id,
            date: today,
            clock_in: nowTime,
            clock_out: null,
            status: 'Present',
            notes: `Mobile check-in | ${currentAddress}`,
            is_manual: false,
            photo_url: photoUrl,
            location_lat: location?.coords.latitude || null,
            location_lng: location?.coords.longitude || null,
          }]);
        if (insertError) throw insertError;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Absen Masuk Berhasil', `Jam masuk tercatat: ${nowTime.substring(0,5)}`);
      } else {
        // CLOCK OUT
        if (!existing) {
          Alert.alert('Belum Absen Masuk', 'Anda belum melakukan absen masuk hari ini. Lakukan absen masuk terlebih dahulu.');
          setShowCamera(false);
          return;
        }
        if (existing.clock_out) {
          Alert.alert('Sudah Absen Pulang', `Anda sudah absen pulang pukul ${existing.clock_out.substring(0, 5)} hari ini.`);
          setShowCamera(false);
          return;
        }
        // UPDATE clock_out
        const { error: updateError } = await supabase
          .from('attendance')
          .update({
            clock_out: nowTime,
            notes: `Mobile check-out | ${currentAddress}`,
            photo_url: photoUrl || undefined,
            location_lat: location?.coords.latitude || null,
            location_lng: location?.coords.longitude || null,
          })
          .eq('id', existing.id);
        if (updateError) throw updateError;
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert('✅ Absen Pulang Berhasil', `Jam pulang tercatat: ${nowTime.substring(0,5)}`);
      }

      // Refresh today's record
      if (userData?.id) fetchTodayAttendance(userData.id);
    } catch (error: any) {
      Alert.alert('Gagal', error.message || 'Terjadi kesalahan saat menyimpan absensi');
    } finally {
      setShowCamera(false);
    }
  };

  if (showCamera) {
    return (
      <Modal visible={showCamera} animationType="slide" transparent={false} onRequestClose={() => setShowCamera(false)}>
        <AttendanceCamera 
          type={cameraType} 
          onCaptureComplete={handleCaptureComplete} 
          userData={userData} 
          onClose={() => setShowCamera(false)} 
        />
      </Modal>
    );
  }

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
      <StatusBar barStyle={isDark ? "light-content" : "light-content"} />
      
      {/* Branded Red Header Banner */}
      <View style={[styles.headerWrapper, { backgroundColor: isDark ? '#1E293B' : '#F97316', borderBottomColor: isDark ? '#334155' : 'transparent', borderBottomWidth: isDark ? 1 : 0 }]}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTopLeft}>
            <Text style={[styles.dateLabelImage, { color: isDark ? '#8E8E93' : 'rgba(255, 255, 255, 0.75)' }]}>
              {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
            </Text>
            <View style={styles.clockRowImage}>
              <Text style={[styles.clockTextImage, { color: '#FFFFFF' }]}>
                {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </Text>
              <View style={[styles.liveBadge, { backgroundColor: isDark ? '#2C2C2E' : 'rgba(255, 255, 255, 0.15)' }]}>
                <Ionicons 
                  name={networkState.type === 'WIFI' ? "wifi" : "cellular"} 
                  size={10} 
                  color={networkState.isConnected ? "#10B981" : "#EF4444"} 
                />
                <View style={[styles.liveDot, { backgroundColor: networkState.isConnected ? '#10B981' : '#EF4444' }]} />
                <Text style={[styles.liveText, { color: networkState.isConnected ? "#10B981" : "#F87171" }]}>
                  {networkState.isConnected ? 'LIVE' : 'OFFLINE'}
                </Text>
              </View>
            </View>
            
            {/* Weather Sync Row */}
            {weather && (
              <View style={styles.weatherSyncRow}>
                <Ionicons name="cloudy-night" size={12} color={isDark ? '#F59E0B' : '#FEF3C7'} />
                <Text style={[styles.weatherTextHeader, { color: isDark ? '#F59E0B' : '#FEF3C7' }]}>
                  {weather.temp}°C • {weather.condition}
                </Text>
                <View style={[styles.syncDot, { backgroundColor: isDark ? '#475569' : 'rgba(255,255,255,0.3)' }]} />
                <Text style={[styles.weatherCityText, { color: isDark ? '#8E8E93' : 'rgba(255,255,255,0.7)' }]}>
                  {weather.city}
                </Text>
              </View>
            )}
          </View>
          
          <View style={styles.headerActionBtns}>
            <TouchableOpacity 
              style={[styles.squareBtn, { backgroundColor: isDark ? '#2C2C2E' : 'rgba(255, 255, 255, 0.15)', borderColor: isDark ? '#3A3A3C' : 'rgba(255, 255, 255, 0.2)' }]} 
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push('/inbox');
              }}
            >
              <Ionicons name="notifications" size={20} color="#FFFFFF" />
              {notificationCount > 0 && <View style={styles.btnDotBadge} />}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSectionImage}>
          <TouchableOpacity 
            style={[styles.avatarCircleImage, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : '#FFFFFF' }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push('/id-card');
            }}
            activeOpacity={0.8}
          >
            <Text style={[styles.avatarTextImage, { color: isDark ? '#F8FAFC' : '#F97316' }]}>
              {userData?.name ? userData.name.substring(0, 1).toUpperCase() : 'A'}
            </Text>
          </TouchableOpacity>
          <View style={styles.profileInfoImage}>
            <Text style={[styles.profileNameImage, { color: '#FFFFFF' }]}>{userData?.name || 'User Name'}</Text>
            <Text style={[styles.profileRoleImage, { color: isDark ? '#8E8E93' : 'rgba(255, 255, 255, 0.8)' }]}>
              {userData?.jabatan || 'Staff'} • PT Wijaya Kreatif Nusantara
            </Text>
            <Text style={[styles.profileIdImage, { color: isDark ? '#3B82F6' : '#FDE047' }]}>
              ID: {userData?.id || 'WKN-0000'}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={[styles.scrollContentCompact, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
      >
        {/* Redesigned Attendance Control Card */}
        <View style={[styles.attendanceBar, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#E2E8F0' }]}>
          <View style={styles.controlHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.controlTitle, { color: colors.subText }]}>KONTROL KEHADIRAN</Text>
              <Text style={[styles.controlHeadline, { color: colors.text }]}>Absen masuk & pulang</Text>
              <Text style={[styles.controlCopy, { color: colors.subText }]}>{attendanceHint}</Text>
            </View>
            <View style={[styles.indicatorPill, { backgroundColor: attendancePhaseBg }]}>
              <Text style={[styles.indicatorText, { color: attendancePhaseColor }]}>
                {attendancePhase}
              </Text>
            </View>
          </View>

          <View style={[styles.locationCard, { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : '#F8FAFC' }]}> 
            <Ionicons name="location" size={16} color="#F97316" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.locationLabel, { color: colors.subText }]}>Lokasi terkini</Text>
              <Text style={[styles.locationValue, { color: colors.text }]} numberOfLines={2}>{currentAddress}</Text>
            </View>
          </View>

          <View style={styles.timelineCard}>
            <View style={[styles.timelineStep, { opacity: isClockInDone ? 1 : 0.8 }]}> 
              <View style={[styles.timelineDot, { backgroundColor: isClockInDone ? '#10B981' : '#CBD5E1' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>Absen Masuk</Text>
                <Text style={[styles.timelineMeta, { color: colors.subText }]}> 
                  {isClockInDone ? `Tercatat pukul ${todayRecord?.clock_in?.substring(0, 5)}` : 'Belum tercatat'}
                </Text>
              </View>
            </View>
            <View style={styles.timelineLine} />
            <View style={[styles.timelineStep, { opacity: isClockOutDone ? 1 : isClockInDone ? 0.95 : 0.5 }]}> 
              <View style={[styles.timelineDot, { backgroundColor: isClockOutDone ? '#F43F5E' : isClockInDone ? '#F59E0B' : '#E2E8F0' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>Absen Pulang</Text>
                <Text style={[styles.timelineMeta, { color: colors.subText }]}> 
                  {isClockOutDone ? `Tercatat pukul ${todayRecord?.clock_out?.substring(0, 5)}` : isClockInDone ? 'Siap untuk dicatat' : 'Tunggu absen masuk'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actionRowCompact}>
            <TouchableOpacity 
              onPress={isClockInDone ? undefined : handleClockIn}
              onPressIn={() => onPressIn(inScale)}
              onPressOut={() => onPressOut(inScale)}
              style={styles.flex1}
              activeOpacity={1}
              disabled={isClockInDone}
            >
              <Animated.View style={[styles.btnCompact, { backgroundColor: isClockInDone ? '#94A3B8' : '#10b981', transform: [{ scale: inScale }], opacity: isClockInDone ? 0.85 : 1 }]}> 
                <Ionicons name="log-in" size={18} color="#fff" />
                <View style={styles.btnCopyWrap}>
                  <Text style={styles.btnTextCompact}>ABSEN MASUK</Text>
                  <Text style={styles.btnSubText}>{isClockInDone ? 'Sudah tercatat' : 'Mulai hari kerja'}</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={isClockOutBlocked ? undefined : handleClockOut}
              onPressIn={() => onPressIn(outScale)}
              onPressOut={() => onPressOut(outScale)}
              style={styles.flex1}
              activeOpacity={1}
              disabled={isClockOutBlocked}
            >
              <Animated.View style={[styles.btnCompact, { backgroundColor: isClockOutBlocked ? '#94A3B8' : '#f43f5e', transform: [{ scale: outScale }], opacity: isClockOutBlocked ? 0.85 : 1 }]}> 
                <Ionicons name="log-out" size={18} color="#fff" />
                <View style={styles.btnCopyWrap}>
                  <Text style={styles.btnTextCompact}>ABSEN PULANG</Text>
                  <Text style={styles.btnSubText}>{isClockOutDone ? 'Sudah tercatat' : isClockInDone ? 'Selesaikan hari kerja' : 'Tunggu absen masuk'}</Text>
                </View>
              </Animated.View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Work Schedule Preview Card - Enhanced */}
        <View style={[styles.scheduleCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#E2E8F0' }]}> 
          <View style={styles.scheduleHeader}>
            <View>
              <Text style={[styles.scheduleTitle, { color: colors.text }]}>Ringkasan Shift</Text>
              <Text style={[styles.scheduleSubtitle, { color: colors.subText }]}>Saat ini, jam kerja berjalan sesuai jadwal office.</Text>
            </View>
            <View style={[styles.shiftBadge, { backgroundColor: isDark ? 'rgba(227,30,36,0.15)' : '#FEE2E2' }]}> 
              <Text style={[styles.shiftBadgeText, { color: '#F97316' }]}>SHIFT NORMAL</Text>
            </View>
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
          <View style={styles.scheduleMetaRow}>
            <View style={[styles.metaPill, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}> 
              <Ionicons name="time-outline" size={12} color="#F97316" />
              <Text style={[styles.metaPillText, { color: colors.text }]}>Toleransi 15 menit</Text>
            </View>
            <View style={[styles.metaPill, { backgroundColor: isDark ? '#1F2937' : '#F8FAFC' }]}> 
              <Ionicons name="shield-checkmark-outline" size={12} color="#10B981" />
              <Text style={[styles.metaPillText, { color: colors.text }]}>Geofencing aktif</Text>
            </View>
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

        {/* SOS Emergency Button */}
        <TouchableOpacity 
          style={[styles.sosButton, { backgroundColor: '#EF4444', borderColor: '#DC2626' }]}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            Alert.alert(
              '🚨 PANIC BUTTON',
              'Apakah Anda sedang dalam keadaan darurat? Koordinat Anda akan dikirim ke Tim HR/Keamanan sekarang.',
              [
                { text: 'BATAL', style: 'cancel' },
                { text: 'KIRIM SOS', style: 'destructive', onPress: () => Alert.alert('Terkirim', 'Tim bantuan segera menghubungi Anda.') }
              ]
            );
          }}
          activeOpacity={0.8}
        >
          <Ionicons name="warning" size={24} color="#FFF" />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={styles.sosTitle}>Panggilan Darurat (SOS)</Text>
            <Text style={styles.sosDesc}>Ketuk jika terjadi kecelakaan / bahaya</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        {/* Gamification / Leaderboard */}
        <View style={[styles.leaderboardCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#E2E8F0' }]}>
          <View style={styles.leaderboardHeader}>
            <Ionicons name="trophy" size={18} color="#F59E0B" />
            <Text style={[styles.leaderboardTitle, { color: colors.text }]}>Kedisiplinan Bulan Ini</Text>
          </View>
          <View style={styles.leaderboardRow}>
            <Text style={[styles.lbRank, { color: '#F59E0B' }]}>#1</Text>
            <Text style={[styles.lbName, { color: colors.text }]}>Budi Santoso</Text>
            <Text style={styles.lbScore}>100 Pts</Text>
          </View>
          <View style={styles.leaderboardRow}>
            <Text style={[styles.lbRank, { color: '#94A3B8' }]}>#2</Text>
            <Text style={[styles.lbName, { color: colors.text }]}>Andi Wijaya</Text>
            <Text style={styles.lbScore}>98 Pts</Text>
          </View>
          <View style={[styles.leaderboardRow, { backgroundColor: isDark ? '#1F1F1F' : '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1 }]}>
            <Text style={[styles.lbRank, { color: '#F97316' }]}>#14</Text>
            <Text style={[styles.lbName, { color: '#F97316', fontWeight: '800' }]}>Anda</Text>
            <Text style={[styles.lbScore, { color: '#F97316' }]}>85 Pts</Text>
          </View>
        </View>

        {/* Office Announcement Banner - Enhanced */}
        {showBanner && (
          <View style={[styles.infoBanner, { backgroundColor: colors.card, borderLeftColor: '#4F46E5' }]}>
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

        {/* Today's Attendance Status - Real Data */}
        <View style={styles.listSection}>
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>ABSENSI HARI INI</Text>
            <TouchableOpacity onPress={() => userData?.id && fetchTodayAttendance(userData.id)}>
              <Text style={styles.seeAllCompact}>Refresh</Text>
            </TouchableOpacity>
          </View>

          {loadingAttendance ? (
            <View style={[styles.simpleListItem, { backgroundColor: colors.card, justifyContent: 'center' }]}>
              <Text style={{ color: colors.subText, fontSize: 12, fontWeight: '600' }}>Memuat data...</Text>
            </View>
          ) : (
            <>
              {/* Clock In Row */}
              <View style={[styles.simpleListItem, { backgroundColor: colors.card, borderColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <View style={[styles.itemIconCircle, { backgroundColor: todayRecord?.clock_in ? (isDark ? 'rgba(16,185,129,0.15)' : '#ECFDF5') : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9') }]}>
                  <Ionicons name="log-in" size={14} color={todayRecord?.clock_in ? '#10b981' : '#94A3B8'} />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>Absen Masuk</Text>
                  <Text style={styles.itemSubText}>
                    {todayRecord?.clock_in ? `Tercatat pukul ${todayRecord.clock_in.substring(0,5)}` : 'Belum absen masuk'}
                  </Text>
                </View>
                <Text style={[styles.itemTime, { color: todayRecord?.clock_in ? '#10b981' : '#94A3B8' }]}>
                  {todayRecord?.clock_in ? todayRecord.clock_in.substring(0,5) : '--:--'}
                </Text>
              </View>

              {/* Clock Out Row */}
              <View style={[styles.simpleListItem, { backgroundColor: colors.card, borderColor: isDark ? '#334155' : '#F1F5F9' }]}>
                <View style={[styles.itemIconCircle, { backgroundColor: todayRecord?.clock_out ? (isDark ? 'rgba(244,63,94,0.15)' : '#fff1f2') : (isDark ? 'rgba(255,255,255,0.05)' : '#F1F5F9') }]}>
                  <Ionicons name="log-out" size={14} color={todayRecord?.clock_out ? '#f43f5e' : '#94A3B8'} />
                </View>
                <View style={styles.itemTextContainer}>
                  <Text style={[styles.itemTitle, { color: colors.text }]}>Absen Pulang</Text>
                  <Text style={styles.itemSubText}>
                    {todayRecord?.clock_out ? `Tercatat pukul ${todayRecord.clock_out.substring(0,5)}` : 'Belum absen pulang'}
                  </Text>
                </View>
                <Text style={[styles.itemTime, { color: todayRecord?.clock_out ? '#f43f5e' : '#94A3B8' }]}>
                  {todayRecord?.clock_out ? todayRecord.clock_out.substring(0,5) : '--:--'}
                </Text>
              </View>

              {/* Status summary badge */}
              {!todayRecord && (
                <View style={[styles.simpleListItem, { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA' }]}>
                  <Ionicons name="alert-circle" size={20} color="#F97316" style={{ marginRight: 12 }} />
                  <Text style={{ fontSize: 12, fontWeight: '700', color: '#C2410C', flex: 1 }}>Anda belum melakukan absensi hari ini</Text>
                </View>
              )}
            </>
          )}
        </View>

        <View style={styles.footerSpacingSmall} />
      </ScrollView>

      {/* Floating AI Assistant Button */}
      <TouchableOpacity 
        style={styles.fabContainer}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          router.push('/assistant');
        }}
      >
        <View style={styles.fabGradient}>
          <Ionicons name="sparkles" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 15,
    elevation: 5,
    zIndex: 10,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerTopLeft: {
    flex: 1,
  },
  dateLabelImage: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  clockRowImage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  clockTextImage: {
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 14,
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800',
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
  },
  syncDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  weatherCityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  headerActionBtns: {
    flexDirection: 'row',
    gap: 10,
  },
  squareBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  btnDotBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    borderWidth: 1.5,
    borderColor: '#F97316',
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatarTextImage: {
    fontSize: 22,
    fontWeight: '900',
  },
  profileInfoImage: {
    flex: 1,
  },
  profileNameImage: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  profileRoleImage: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileIdImage: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  scrollContentCompact: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  attendanceBar: {
    borderRadius: 28,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 18,
    elevation: 4,
    marginBottom: 12,
    borderWidth: 1,
  },
  controlHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 18,
    gap: 12,
  },
  controlTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 6,
  },
  controlHeadline: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  controlCopy: {
    fontSize: 12,
    lineHeight: 18,
  },
  indicatorPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  locationCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  locationValue: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  timelineCard: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 18,
    backgroundColor: 'rgba(248, 250, 252, 0.8)',
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timelineContent: {
    flex: 1,
    paddingVertical: 6,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  timelineMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
  timelineLine: {
    width: 2,
    height: 22,
    backgroundColor: '#E2E8F0',
    marginLeft: 5,
    marginVertical: 2,
  },
  actionRowCompact: {
    flexDirection: 'row',
    gap: 12,
  },
  btnCompact: {
    minHeight: 76,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    justifyContent: 'center',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  btnCopyWrap: {
    marginTop: 6,
    alignItems: 'flex-start',
  },
  btnTextCompact: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  btnSubText: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 3,
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
  scheduleCard: {
    borderRadius: 28,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
    gap: 12,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 4,
  },
  scheduleSubtitle: {
    fontSize: 12,
    lineHeight: 18,
  },
  shiftBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  shiftBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
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
  scheduleMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  metaPillText: {
    fontSize: 11,
    fontWeight: '800',
  },
  syncBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
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
    padding: 15,
    borderRadius: 14,
    marginTop: 14,
    gap: 15,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    borderLeftWidth: 4,
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
    marginTop: 25,
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
    color: '#F97316',
  },
  simpleListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  itemIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  itemSubText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  itemTime: {
    fontSize: 14,
    fontWeight: '900',
  },
  sosButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  sosTitle: { color: '#FFF', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },
  sosDesc: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '600' },
  leaderboardCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  leaderboardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
  leaderboardTitle: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  leaderboardRow: { flexDirection: 'row', alignItems: 'center', padding: 10, borderRadius: 12, marginBottom: 6 },
  lbRank: { width: 30, fontSize: 14, fontWeight: '900' },
  lbName: { flex: 1, fontSize: 13, fontWeight: '600' },
  lbScore: { fontSize: 12, fontWeight: '800', color: '#94A3B8' },
  fabContainer: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  fabGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
    backgroundColor: '#F97316',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
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
