import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, Animated } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import ViewShot from 'react-native-view-shot';
import { Ionicons } from '@expo/vector-icons';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

// Haversine formula to calculate distance in meters
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3;
  const dLat = (lat2 - lat1) * (Math.PI/180);
  const dLon = (lon2 - lon1) * (Math.PI/180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

interface AttendanceCameraProps {
  type?: 'IN' | 'OUT';
  onCaptureComplete?: (uri: string) => void;
  userData?: { id: string; name: string; jabatan?: string; is_field_team?: boolean; working_location?: string } | null;
  onClose?: () => void;
}

export default function AttendanceCamera({ type = 'IN', onCaptureComplete, userData, onClose }: AttendanceCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPerm, setLocationPerm] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [address, setAddress] = useState<string>('Mengambil lokasi...');
  
  // HQ Config from API
  const [hqLocation, setHqLocation] = useState<{latitude: number, longitude: number, radius: number, name: string} | null>(null);
  const [allowFree, setAllowFree] = useState<boolean>(false);
  const [workingLocations, setWorkingLocations] = useState<Array<{name: string, lat: number, lon: number, radius: number}>>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);

  // Target Location (resolved based on employee profile and settings)
  const [targetLocation, setTargetLocation] = useState<{latitude: number, longitude: number, radius: number, name: string} | null>(null);

  // Geofencing state
  const [distance, setDistance] = useState<number | null>(null);
  const [isInArea, setIsInArea] = useState<boolean>(false);
  const isFieldTeam = userData?.is_field_team ?? false;
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  
  const cameraRef = useRef<CameraView | null>(null);
  const viewShotRef = useRef<ViewShot | null>(null);

  // Animation for the face scanner guide line
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!capturedImage) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 248, // slightly less than the height of scanner box (250)
            duration: 2500,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [capturedImage]);

  const FaceScannerGuide = () => {
    return (
      <View style={styles.guideContainer} pointerEvents="none">
        <View style={styles.scannerFrame}>
          <View style={styles.scannerCircle}>
            <Animated.View style={[styles.scannerLine, { transform: [{ translateY: scanAnim }] }]} />
          </View>
          <Text style={styles.guideText}>Posisikan Wajah Anda di Dalam Area</Text>
        </View>
      </View>
    );
  };

  // Fetch settings from API once on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/attendance/settings`);
        const json = await res.json();
        if (json.status === 'success') {
          const data = json.data;
          const hq = data?.hq_location;
          const hqLoc = hq ? {
            latitude: hq.lat,
            longitude: hq.lon,
            radius: hq.radius || 100,
            name: hq.name || 'HQ'
          } : { latitude: -6.2088, longitude: 106.8456, radius: 100, name: 'WKN HQ' };
          
          setHqLocation(hqLoc);
          setAllowFree(!!data?.allow_free_attendance);
          setWorkingLocations(data?.working_locations || []);
        } else {
          // Default fallback
          const defaultHQ = { latitude: -6.2088, longitude: 106.8456, radius: 100, name: 'WKN HQ' };
          setHqLocation(defaultHQ);
          setAllowFree(false);
          setWorkingLocations([]);
        }
      } catch (e) {
        // If API fails, use defaults so user is not blocked
        const defaultHQ = { latitude: -6.2088, longitude: 106.8456, radius: 100, name: 'WKN HQ' };
        setHqLocation(defaultHQ);
        setAllowFree(false);
        setWorkingLocations([]);
      } finally {
        setLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  // Resolve target location based on employee profile and configured custom locations
  useEffect(() => {
    if (!hqLocation) return;
    
    const employeeLocName = userData?.working_location || 'Head Office';
    const matched = workingLocations.find(loc => loc.name === employeeLocName);
    
    if (matched) {
      setTargetLocation({
        latitude: matched.lat,
        longitude: matched.lon,
        radius: matched.radius || 100,
        name: matched.name
      });
    } else {
      setTargetLocation(hqLocation);
    }
  }, [hqLocation, workingLocations, userData?.working_location]);

  // Fetch location and apply geofencing check
  useEffect(() => {
    if (!targetLocation) return;
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPerm(status === 'granted');
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);
        
        // Field team or global allow free bypass
        if (isFieldTeam || allowFree) {
          setIsInArea(true);
          setDistance(0);
        } else {
          const dist = getDistanceFromLatLonInM(
            loc.coords.latitude, 
            loc.coords.longitude, 
            targetLocation.latitude, 
            targetLocation.longitude
          );
          setDistance(dist);
          setIsInArea(dist <= targetLocation.radius);
        }
        
        const geocode = await Location.reverseGeocodeAsync({
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude
        });
        
        if (geocode.length > 0) {
          const addr = geocode[0];
          setAddress(`${addr.street || ''} ${addr.city || ''}, ${addr.region || ''}`);
        } else {
          setAddress('Alamat tidak ditemukan');
        }
      }
    })();
  }, [targetLocation, isFieldTeam, allowFree]);

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" />
        <Text style={{color:'#fff', marginTop:8}}>Meminta akses kamera...</Text>
      </View>
    );
  }

  if (loadingSettings) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="#fff" />
        <Text style={{color:'#fff', marginTop:8}}>Memuat konfigurasi lokasi...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center', marginBottom: 20, color: 'white' }}>Akses kamera dibutuhkan untuk absensi.</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Izinkan Kamera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // 1. Fungsi Mengambil Foto
  const takePicture = async () => {
    if (!isCameraReady) {
      Alert.alert('Tunggu', 'Kamera sedang disiapkan, silakan coba beberapa saat lagi...');
      return;
    }
    if (!location) {
      Alert.alert('Tunggu', 'Sedang mengunci lokasi GPS Anda...');
      return;
    }
    
    // Skip geofencing check for field team or when free attendance is enabled
    if (!isFieldTeam && !allowFree && !isInArea) {
      Alert.alert(
        'Di Luar Jangkauan', 
        `Anda berada ${distance ? Math.round(distance) : '?'} meter dari ${targetLocation?.name || 'kantor'}. Jarak maksimal adalah ${targetLocation?.radius || 100} meter.`
      );
      return;
    }

    if (cameraRef.current) {
      setIsProcessing(true);
      
      // Safety timeout of 6 seconds to prevent permanent lock if camera hangs
      const timeoutId = setTimeout(() => {
        setIsProcessing(false);
        Alert.alert(
          'Waktu Habis', 
          'Kamera tidak merespon dalam batas waktu. Silakan coba kembali atau pastikan pencahayaan cukup.'
        );
      }, 6000);

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 1,
          base64: false,
        });
        clearTimeout(timeoutId);
        if (photo) {
          setCapturedImage(photo.uri);
        } else {
          setIsProcessing(false);
          Alert.alert('Error', 'Gagal mengambil foto (file tidak terbentuk).');
        }
      } catch (error) {
        clearTimeout(timeoutId);
        Alert.alert('Error', 'Gagal mengambil foto: ' + (error as any).message);
        setIsProcessing(false);
      }
    }
  };

  // 2. Fungsi Menyimpan Foto + Watermark
  const saveWatermarkedImage = async () => {
    try {
      if (!viewShotRef.current?.capture) return;
      
      // Menangkap view yang berisi Foto + Teks Watermark menjadi 1 gambar utuh
      const uri = await viewShotRef.current.capture();
      // uri ini adalah gambar final anti-manipulasi yang siap di upload ke Supabase
      if (onCaptureComplete) onCaptureComplete(uri); 
    } catch (error) {
      Alert.alert('Error', 'Gagal memproses watermark');
    }
  };

  const WatermarkOverlay = () => {
    // Format timestamp like "YYYY-MM-DD HH:mm" based on reference image
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestampStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    const displayName = userData?.name?.toUpperCase() || 'KARYAWAN';
    const displayId = userData?.id?.toUpperCase() || '-';
    
    // Bottom left unique ID (pseudo random or based on coordinates like in the photo)
    const latStr = location?.latitude ? location.latitude.toFixed(6).replace('.', '') : '000000';
    const lonStr = location?.longitude ? location.longitude.toFixed(6).replace('.', '') : '000000';
    const geoCode = `${latStr.slice(0, 4)}-${lonStr.slice(0, 8)}A`;
    
    const locName = targetLocation?.name?.toUpperCase() || 'LOKASI TIDAK DIKETAHUI';
    const fullAddress = address || 'Alamat tidak ditemukan';

    return (
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {/* Top Left: Time, Name, ID */}
        <View style={styles.topLeft}>
          <Text style={styles.watermarkTextPlain}>{timestampStr}</Text>
          <Text style={styles.watermarkTextPlain}>{displayName}</Text>
          <Text style={styles.watermarkTextPlain}>{displayId}</Text>
        </View>

        {/* Top Right: WKN Logo & WKN Mobile */}
        <View style={styles.topRight}>
          <Image 
            source={require('../assets/images/icon.png')} 
            style={styles.watermarkLogo} 
            resizeMode="contain"
          />
          <Text style={styles.watermarkSubLogo}>WKN Mobile</Text>
        </View>

        {/* Bottom Left: Code, Location Name, Address */}
        <View style={styles.bottomLeft}>
          <Text style={styles.watermarkTextPlain}>{geoCode}</Text>
          <Text style={styles.watermarkTextPlain}>{locName}</Text>
          <Text style={styles.watermarkTextPlainAddress}>{fullAddress}</Text>
          
          {/* Status Label (IN/OUT) - Added as subtle extra info to keep functionality */}
          <View style={[styles.statusRow, { marginTop: 4 }]}>
            <View style={[styles.statusDot, { backgroundColor: type === 'IN' ? '#10B981' : '#EF4444' }]} />
            <Text style={[styles.watermarkTag, { color: type === 'IN' ? '#86EFAC' : '#FCA5A5', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 }]}> 
              CLOCK {type}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        // Mode Live Camera
        <View style={{ flex: 1 }}>
          <CameraView 
            ref={cameraRef} 
            style={styles.camera} 
            facing="front"
            onCameraReady={() => setIsCameraReady(true)}
          >
            {/* Preview Watermark Transparan saat live kamera */}
            <WatermarkOverlay />
            
            {/* Face Scanner Guide */}
            <FaceScannerGuide />
            
            {/* Geofencing warning banner */}
            {!isFieldTeam && !allowFree && !isInArea && distance !== null && targetLocation && (
              <View style={styles.geoWarningBanner}>
                <Text style={styles.geoWarningText}>
                  DI LUAR JANGKAUAN ({Math.round(distance)} meter dari {targetLocation.name})
                </Text>
              </View>
            )}

            {/* Integrated Close Button */}
            {onClose && (
              <TouchableOpacity style={styles.closeCameraBtn} onPress={onClose}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={[
                  styles.captureButton, 
                  (!isFieldTeam && !allowFree && !isInArea) && { backgroundColor: 'rgba(244, 63, 94, 0.5)' }
                ]} 
                onPress={takePicture}
                disabled={isProcessing || !isCameraReady || (!isFieldTeam && !allowFree && !isInArea)}
              >
                {isProcessing ? (
                  <ActivityIndicator size="large" color="#F97316" />
                ) : (
                  <View style={[
                    styles.captureButtonInner, 
                    (!isFieldTeam && !allowFree && !isInArea) && { backgroundColor: '#f43f5e' }
                  ]} />
                )}
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>

      ) : (
        // Mode Review & Proses Watermark
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Komponen ViewShot akan menyatukan Image + Overlay menjadi 1 file */}
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 1.0 }} style={{ flex: 1 }}>
            <Image source={{ uri: capturedImage }} style={styles.camera} resizeMode="cover" />
            <WatermarkOverlay />
          </ViewShot>

          {/* Kontrol Konfirmasi */}
          <View style={styles.confirmControls}>
            <TouchableOpacity style={styles.btnSecondary} onPress={() => {
              setCapturedImage(null);
              setIsProcessing(false);
            }}>
              <Text style={styles.btnText}>Ulangi</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.btnPrimary} onPress={saveWatermarkedImage}>
              <Text style={styles.btnText}>Kirim Absen</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', backgroundColor: '#000' },
  camera: { flex: 1, width: '100%' },
  
  // Integrated Close Button
  closeCameraBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    zIndex: 999,
  },

  // Posisi Watermark (No glassmorphism, clean raw text)
  topLeft: {
    position: 'absolute',
    top: 60, 
    left: 20,
    zIndex: 10,
  },
  topRight: {
    position: 'absolute',
    top: 60,
    right: 20,
    alignItems: 'flex-end',
    zIndex: 10,
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 125,
    left: 20,
    right: 20,
    zIndex: 10,
  },

  // Face Scanner Guide
  guideContainer: {
    position: 'absolute',
    top: '23%',
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerFrame: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerCircle: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 2,
    borderColor: '#10b981', // glowing emerald green
    borderStyle: 'dashed',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    overflow: 'hidden',
    position: 'relative',
  },
  scannerLine: {
    position: 'absolute',
    width: '100%',
    height: 3,
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 6,
    elevation: 4,
  },
  guideText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 15,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },

  // Sub-komponen Watermark
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
  },

  // Teks Watermark (Plain text shadow for readability)
  watermarkTextPlain: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    letterSpacing: 0.5,
    lineHeight: 22,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  watermarkTextPlainAddress: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 18,
    marginTop: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  watermarkLogo: {
    width: 60,
    height: 60,
    marginBottom: 4,
  },
  watermarkSubLogo: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  watermarkTag: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.8,
  },

  // UI Kontrol Kamera
  cameraControls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  captureButton: { width: 76, height: 76, borderRadius: 38, backgroundColor: 'rgba(255,255,255,0.25)', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },
  captureButtonInner: { width: 62, height: 62, borderRadius: 31, backgroundColor: '#fff' },
  
  // UI Konfirmasi
  confirmControls: { position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  btn: { backgroundColor: '#F97316', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#10b981', padding: 15, borderRadius: 12, flex: 1, marginLeft: 10, alignItems: 'center', shadowColor: '#10b981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 5 },
  btnSecondary: { backgroundColor: '#475569', padding: 15, borderRadius: 12, flex: 1, marginRight: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Geofencing Banner
  geoWarningBanner: { position: 'absolute', top: 120, left: 20, right: 20, backgroundColor: 'rgba(244, 63, 94, 0.9)', padding: 12, borderRadius: 8, alignItems: 'center' },
  geoWarningText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }
});
