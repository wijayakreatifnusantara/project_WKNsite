import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import ViewShot from 'react-native-view-shot';

// Konfigurasi Geofencing (Titik Pusat HQ WKNsite)
const HQ_LOCATION = {
  latitude: -6.2088,   // Ganti dengan Latitude Asli Kantor Anda
  longitude: 106.8456, // Ganti dengan Longitude Asli Kantor Anda
  radius: 100          // Radius toleransi dalam meter
};

// Rumus Haversine untuk menghitung jarak akurat
function getDistanceFromLatLonInM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // Radius bumi dalam meter
  const dLat = (lat2 - lat1) * (Math.PI/180);
  const dLon = (lon2 - lon1) * (Math.PI/180); 
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * (Math.PI/180)) * Math.cos(lat2 * (Math.PI/180)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c;
}

// Dummy data untuk contoh. Nantinya diambil dari AuthContext
const mockUser = {
  name: "Karyawan",
  id: "ID"
};

interface AttendanceCameraProps {
  type?: 'IN' | 'OUT';
  onCaptureComplete?: (uri: string) => void;
}

export default function AttendanceCamera({ type = 'IN', onCaptureComplete }: AttendanceCameraProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [locationPerm, setLocationPerm] = useState<boolean | null>(null);
  const [location, setLocation] = useState<Location.LocationObjectCoords | null>(null);
  const [address, setAddress] = useState<string>('Mengambil lokasi...');
  
  // State Geofencing
  const [distance, setDistance] = useState<number | null>(null);
  const [isInArea, setIsInArea] = useState<boolean>(false);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  
  const cameraRef = useRef<CameraView | null>(null);
  const viewShotRef = useRef<ViewShot | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPerm(status === 'granted');
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
        setLocation(loc.coords);
        
        // Hitung jarak Geofencing
        const dist = getDistanceFromLatLonInM(
          loc.coords.latitude, 
          loc.coords.longitude, 
          HQ_LOCATION.latitude, 
          HQ_LOCATION.longitude
        );
        setDistance(dist);
        setIsInArea(dist <= HQ_LOCATION.radius);
        
        // Dapatkan nama jalan/alamat dari koordinat
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
  }, []);

  if (!permission) {
    return <View style={styles.container}><Text>Meminta akses kamera...</Text></View>;
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
    
    if (!isInArea) {
      Alert.alert(
        'Di Luar Jangkauan', 
        `Anda berada ${distance ? Math.round(distance) : '?'} meter dari kantor. Jarak maksimal adalah ${HQ_LOCATION.radius} meter.`
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

    return (
      <View style={StyleSheet.absoluteFill}>
        {/* Kiri Atas: Nama & ID */}
        <View style={styles.topLeft}>
          <Text style={styles.watermarkTextBold}>{mockUser.name}</Text>
          <Text style={styles.watermarkText}>{mockUser.id}</Text>
        </View>

        {/* Kanan Atas: Status In/Out */}
        <View style={styles.topRight}>
          <Text style={[styles.watermarkTextBold, { color: type === 'IN' ? '#10b981' : '#f43f5e' }]}>
            CLOCK {type}
          </Text>
          <Text style={styles.watermarkText}>{timestamp}</Text>
        </View>

        {/* Kiri Bawah: Lokasi & Kordinat */}
        <View style={styles.bottomLeft}>
          <Text style={styles.watermarkTextBold}>Lokasi Absen:</Text>
          <Text style={styles.watermarkText}>{address}</Text>
          {location && distance !== null && (
            <Text style={styles.watermarkTextSmall}>
              Lat: {location.latitude.toFixed(5)}, Lng: {location.longitude.toFixed(5)}
              {'\n'}Jarak: {Math.round(distance)}m (Maks: {HQ_LOCATION.radius}m)
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
            
            {/* Indikator Geofencing Live */}
            {!isInArea && distance !== null && (
              <View style={styles.geoWarningBanner}>
                <Text style={styles.geoWarningText}>
                  DI LUAR JANGKAUAN ({Math.round(distance)} meter)
                </Text>
              </View>
            )}
            
            <View style={styles.cameraControls}>
              <TouchableOpacity 
                style={[styles.captureButton, !isInArea && { backgroundColor: 'rgba(244, 63, 94, 0.5)' }]} 
                onPress={takePicture}
                disabled={isProcessing || !isInArea}
              >
                <View style={[styles.captureButtonInner, !isInArea && { backgroundColor: '#f43f5e' }]} />
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
