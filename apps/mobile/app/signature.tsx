import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert, 
  Dimensions, 
  ActivityIndicator,
  StatusBar,
  Image,
  PanResponder,
  GestureResponderEvent,
  ScrollView,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ViewShot from 'react-native-view-shot';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

interface Point {
  x: number;
  y: number;
}

export default function SignatureScreen() {
  const { colors, isDark } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [currentSignature, setCurrentSignature] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    if (userData?.id) {
      await fetchCurrentSignature(userData.id);
    }
    setRefreshing(false);
  };

  // Drawing States
  const [paths, setPaths] = useState<Point[][]>([]);
  const currentPath = useRef<Point[]>([]);
  const viewShotRef = useRef<ViewShot>(null);

  useEffect(() => {
    initScreen();
  }, []);

  const initScreen = async () => {
    setLoading(true);
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (sessionStr) {
        const user = JSON.parse(sessionStr);
        setUserData(user);
        await fetchCurrentSignature(user.id);
      } else {
        router.replace('/login');
      }
    } catch (e) {
      console.log('Error initializing screen:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchCurrentSignature = async (employeeId: string) => {
    try {
      if (!userData?.id) return;
      setLoading(true);

      const res = await apiClient.get('/employees/me');
      if (res.status === 'success' && res.data?.signature_url) {
        setCurrentSignature(res.data.signature_url);
      }
    } catch (e: any) {
      console.log('Error fetching signature:', e.message);
    } finally {
      setLoading(false);
    }
  };

  // PanResponder to capture touches
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = [{ x: locationX, y: locationY }];
        setPaths((prevPaths) => [...prevPaths, [...currentPath.current]]);
      },
      onPanResponderMove: (evt: GestureResponderEvent) => {
        const { locationX, locationY } = evt.nativeEvent;
        // Avoid duplicate coordinates
        const lastPoint = currentPath.current[currentPath.current.length - 1];
        if (!lastPoint || Math.abs(lastPoint.x - locationX) > 1 || Math.abs(lastPoint.y - locationY) > 1) {
          currentPath.current.push({ x: locationX, y: locationY });
          setPaths((prevPaths) => {
            const nextPaths = [...prevPaths];
            nextPaths[nextPaths.length - 1] = [...currentPath.current];
            return nextPaths;
          });
        }
      },
      onPanResponderRelease: () => {
        currentPath.current = [];
      }
    })
  ).current;

  const clearCanvas = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setPaths([]);
  };

  const handleSaveSignature = async () => {
    if (paths.length === 0) {
      Alert.alert('Kanvas Kosong', 'Silakan gambar tanda tangan Anda terlebih dahulu pada area yang disediakan.');
      return;
    }

    setSaveLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      if (!viewShotRef.current) throw new Error('Ref error');
      
      // Capture drawing pad as image URI
      const uri = await (viewShotRef.current as any).capture();
      
      const payload = {
        signature_base64: uri
      };

      const res = await apiClient.post('/employees/signature', payload);
      if (res.status !== 'success') throw new Error(res.message);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', text1: 'Berhasil', text2: 'Tanda tangan elektronik berhasil disimpan.' });
      fetchCurrentSignature(userData.id);
      setPaths([]);
    } catch (e: any) {
      console.log('Error saving signature:', e);
      Alert.alert('Gagal Menyimpan', e.message || 'Terjadi kesalahan saat mengunggah tanda tangan.');
    } finally {
      setSaveLoading(false);
    }
  };

  // Helper to render lines between captured points
  const renderLines = () => {
    return paths.map((path, pIdx) => {
      return path.map((point, ptIdx) => {
        if (ptIdx === 0) return null;
        const prevPoint = path[ptIdx - 1];
        
        const dx = point.x - prevPoint.x;
        const dy = point.y - prevPoint.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const midX = (prevPoint.x + point.x) / 2;
        const midY = (prevPoint.y + point.y) / 2;

        return (
          <View 
            key={`line-${pIdx}-${ptIdx}`}
            style={{
              position: 'absolute',
              left: midX - distance / 2,
              top: midY - 1.5,
              width: distance,
              height: 3,
              backgroundColor: '#1E293B',
              borderRadius: 1.5,
              transform: [{ rotate: `${angle}rad` }]
            }}
          />
        );
      });
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Tanda Tangan</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F97316" />
          <Text style={{ color: colors.subText, marginTop: 10 }}>Memuat profil tanda tangan...</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} tintColor="#F97316" />
          }
        >
          
          {/* Current Signature Display */}
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>TANDA TANGAN SAAT INI</Text>
          <View style={[styles.currentSigCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            {currentSignature ? (
              <Image 
                source={{ uri: currentSignature }} 
                style={styles.sigImage} 
                resizeMode="contain" 
              />
            ) : (
              <View style={styles.emptySigContainer}>
                <Ionicons name="alert-circle-outline" size={32} color="#94A3B8" />
                <Text style={styles.emptySigText}>Belum ada tanda tangan elektronik yang terdaftar.</Text>
              </View>
            )}
          </View>

          {/* Signature Canvas Pad */}
          <Text style={[styles.sectionTitle, { color: colors.subText, marginTop: 24 }]}>BUAT / PERBARUI TANDA TANGAN</Text>
          <View style={[styles.canvasBorder, { borderColor: isDark ? '#2C2C2E' : '#CBD5E1' }]}>
            <ViewShot 
              ref={viewShotRef} 
              options={{ format: 'png', quality: 0.9 }} 
              style={[styles.canvasContainer, { backgroundColor: '#F8FAFC' }]}
              {...panResponder.panHandlers}
            >
              {renderLines()}
              {paths.length === 0 && (
                <View style={styles.canvasPlaceholder}>
                  <Text style={styles.placeholderText}>Gambarkan tanda tangan di sini</Text>
                </View>
              )}
            </ViewShot>
          </View>

          {/* Action Pad Controls */}
          <View style={styles.controlRow}>
            <TouchableOpacity 
              style={[styles.clearBtn, { borderColor: isDark ? '#2C2C2E' : '#E2E8F0' }]} 
              onPress={clearCanvas}
            >
              <Ionicons name="trash-outline" size={16} color="#EF4444" style={{ marginRight: 6 }} />
              <Text style={styles.clearBtnText}>Bersihkan Pad</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.saveBtn, { opacity: saveLoading ? 0.7 : 1 }]} 
              onPress={handleSaveSignature}
              disabled={saveLoading}
            >
              {saveLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="cloud-upload-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.saveBtnText}>Simpan & Sync</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Security Information Panel */}
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <View style={styles.infoTitleRow}>
              <Ionicons name="shield-checkmark-outline" size={18} color="#10B981" />
              <Text style={[styles.infoTitle, { color: colors.text }]}>Keamanan Tanda Tangan Elektronik</Text>
            </View>
            <Text style={[styles.infoDesc, { color: colors.subText }]}>
              Tanda tangan digital Anda disimpan dengan enkripsi aman di cloud storage WKNsite. Tanda tangan ini digunakan untuk otorisasi absensi mandiri, dokumen onboarding, slip gaji, dan persetujuan penugasan lapangan resmi.
            </Text>
          </View>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  backBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    paddingLeft: 4,
  },
  currentSigCard: {
    height: 160,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  sigImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptySigContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptySigText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  canvasBorder: {
    borderRadius: 24,
    borderWidth: 4,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  canvasContainer: {
    width: '100%',
    height: 220,
    position: 'relative',
  },
  canvasPlaceholder: {
    position: 'absolute',
    inset: 0,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
    opacity: 0.15,
  },
  placeholderText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#1E293B',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  clearBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  clearBtnText: {
    color: '#EF4444',
    fontSize: 13,
    fontWeight: '800',
  },
  saveBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#F97316',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
  },
  infoCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginTop: 24,
    gap: 8,
  },
  infoTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
  },
  infoDesc: {
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
  }
});
