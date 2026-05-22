import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import ViewShot from 'react-native-view-shot';

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
}

export default function AttendanceCamera({ type = 'IN', onCaptureComplete, userData }: AttendanceCameraProps) {
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
  
  const cameraRef = useRef<CameraView | null>(null);
  const viewShotRef = useRef<ViewShot | null>(null);

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
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
          base64: false,
        });
        if (photo) {
          setCapturedImage(photo.uri);
        }
      } catch (error) {
        Alert.alert('Error', 'Gagal mengambil foto');
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
    const timestamp = new Date().toLocaleString('id-ID', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    const displayName = userData?.name || 'Karyawan';
    const displayId = userData?.id || '-';

    return (
      <View style={StyleSheet.absoluteFill}>
        {/* Top Left: Name & ID */}
        <View style={styles.topLeft}>
          <Text style={styles.watermarkTextBold}>{displayName}</Text>
          <Text style={styles.watermarkText}>{displayId}</Text>
        </View>

        {/* Top Right: Status In/Out */}
        <View style={styles.topRight}>
          <Text style={[styles.watermarkTextBold, { color: type === 'IN' ? '#10b981' : '#f43f5e' }]}>
            CLOCK {type}
          </Text>
          <Text style={styles.watermarkText}>{timestamp}</Text>
        </View>

        {/* Bottom Left: Location & GPS */}
        <View style={styles.bottomLeft}>
          <Text style={styles.watermarkTextBold}>Lokasi Absen:</Text>
          <Text style={styles.watermarkText}>{address}</Text>
          {location && (
            <Text style={styles.watermarkTextSmall}>
              Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
              {'\n'}
              {allowFree ? (
                '[Bebas Absen - Geofencing Dinonaktifkan]'
              ) : isFieldTeam ? (
                '[Field Team - Geofencing Dinonaktifkan]'
              ) : distance !== null && targetLocation ? (
                `Jarak: ${Math.round(distance)}m dari ${targetLocation.name}`
              ) : (
                ''
              )}
            </Text>
          )}
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
          >
            {/* Preview Watermark Transparan saat live kamera */}
            <WatermarkOverlay />
            
            {/* Geofencing warning banner */}
            {!isFieldTeam && !allowFree && !isInArea && distance !== null && targetLocation && (
              <View style={styles.geoWarningBanner}>
                <Text style={styles.geoWarningText}>
                  DI LUAR JANGKAUAN ({Math.round(distance)} meter dari {targetLocation.name})
                </Text>
              </View>
            )}
            
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={[styles.captureButton, (!isFieldTeam && !allowFree && !isInArea) && { backgroundColor: 'rgba(244, 63, 94, 0.5)' }]} 
                onPress={takePicture}
                disabled={isProcessing || (!isFieldTeam && !allowFree && !isInArea)}
              >
                <View style={[styles.captureButtonInner, (!isFieldTeam && !allowFree && !isInArea) && { backgroundColor: '#f43f5e' }]} />
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      ) : (
        // Mode Review & Proses Watermark
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          {/* Komponen ViewShot akan menyatukan Image + Overlay menjadi 1 file */}
          <ViewShot ref={viewShotRef} options={{ format: 'jpg', quality: 0.9 }} style={{ flex: 1 }}>
            <Image source={{ uri: capturedImage }} style={styles.camera} />
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
  
  // Posisi Watermark
  topLeft: { position: 'absolute', top: 40, left: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8 },
  topRight: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 8, borderRadius: 8, alignItems: 'flex-end' },
  bottomLeft: { position: 'absolute', bottom: 120, left: 20, right: 20, backgroundColor: 'rgba(0,0,0,0.5)', padding: 10, borderRadius: 8 },
  
  // Teks Watermark
  watermarkTextBold: { color: '#fff', fontSize: 14, fontWeight: 'bold', textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  watermarkText: { color: '#e2e8f0', fontSize: 12, marginTop: 2, textShadowColor: 'rgba(0,0,0,0.8)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 3 },
  watermarkTextSmall: { color: '#cbd5e1', fontSize: 10, marginTop: 4, fontFamily: 'monospace' },
  
  // UI Kontrol Kamera
  cameraControls: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
  captureButton: { width: 70, height: 70, borderRadius: 35, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  captureButtonInner: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },
  
  // UI Konfirmasi
  confirmControls: { position: 'absolute', bottom: 40, left: 20, right: 20, flexDirection: 'row', justifyContent: 'space-between' },
  btn: { backgroundColor: '#E31E24', padding: 15, borderRadius: 12, alignItems: 'center' },
  btnPrimary: { backgroundColor: '#10b981', padding: 15, borderRadius: 12, flex: 1, marginLeft: 10, alignItems: 'center' },
  btnSecondary: { backgroundColor: '#475569', padding: 15, borderRadius: 12, flex: 1, marginRight: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Geofencing Banner
  geoWarningBanner: { position: 'absolute', top: 120, left: 20, right: 20, backgroundColor: 'rgba(244, 63, 94, 0.9)', padding: 12, borderRadius: 8, alignItems: 'center' },
  geoWarningText: { color: '#ffffff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1 }
});
