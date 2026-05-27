import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import QRCode from 'react-native-qrcode-svg';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function IDCardScreen() {
  const { userData } = useAuth();
  const { colors, isDark } = useTheme();
  
  // Basic flip animation setup
  const flipAnim = useRef(new Animated.Value(0)).current;
  const isFlipped = useRef(false);

  const flipCard = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(flipAnim, {
      toValue: isFlipped.current ? 0 : 180,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    isFlipped.current = !isFlipped.current;
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg']
  });
  
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg']
  });

  const frontAnimatedStyle = { transform: [{ rotateY: frontInterpolate }] };
  const backAnimatedStyle = { transform: [{ rotateY: backInterpolate }], position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backfaceVisibility: 'hidden' as const };

  const qrData = JSON.stringify({
    id: userData?.id,
    type: 'WKN_EMPLOYEE',
    timestamp: Date.now()
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="close" size={28} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>ID Card Digital</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.cardContainer}>
          {/* FRONT OF CARD */}
          <Animated.View style={[styles.card, frontAnimatedStyle, { backfaceVisibility: 'hidden', backgroundColor: '#F97316' }]}>
            <View style={styles.cardTop}>
              <View style={styles.wknLogoBox}>
                <Ionicons name="shield-checkmark" size={24} color="#F97316" />
              </View>
              <Text style={styles.cardWKNText}>WKN<Text style={{color: '#000'}}>site</Text></Text>
            </View>

            <View style={styles.cardMiddle}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarLetter}>
                  {userData?.name ? userData.name.substring(0, 1).toUpperCase() : 'W'}
                </Text>
              </View>
              <Text style={styles.employeeName}>{userData?.name || 'Karyawan WKN'}</Text>
              <Text style={styles.employeeRole}>{userData?.jabatan || 'Staff WKN'}</Text>
            </View>

            <View style={styles.cardBottom}>
              <View>
                <Text style={styles.bottomLabel}>ID PEGAWAI</Text>
                <Text style={styles.bottomValue}>{userData?.id?.substring(0,8).toUpperCase() || 'WKN-001'}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.bottomLabel}>LOKASI</Text>
                <Text style={styles.bottomValue}>{userData?.working_location || 'Head Office'}</Text>
              </View>
            </View>
          </Animated.View>

          {/* BACK OF CARD (QR CODE) */}
          <Animated.View style={[styles.card, backAnimatedStyle, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderWidth: 1, borderColor: isDark ? '#334155' : '#E2E8F0' }]}>
            <View style={styles.qrContainer}>
              <Text style={[styles.qrTitle, { color: colors.text }]}>SCAN UNTUK AKSES PINTU</Text>
              <View style={styles.qrBox}>
                <QRCode
                  value={qrData}
                  size={width * 0.55}
                  color={isDark ? '#FFFFFF' : '#0F172A'}
                  backgroundColor={isDark ? '#1E293B' : '#FFFFFF'}
                />
              </View>
              <Text style={[styles.qrDesc, { color: colors.subText }]}>
                Arahkan QR Code ini ke mesin pemindai di pintu masuk untuk mencatat kedatangan atau membuka akses ruangan.
              </Text>
            </View>
          </Animated.View>
        </View>

        <TouchableOpacity 
          style={[styles.flipBtn, { backgroundColor: isDark ? '#1E293B' : '#FFFFFF', borderColor: isDark ? '#334155' : '#E2E8F0' }]} 
          onPress={flipCard}
        >
          <Ionicons name="sync" size={20} color="#F97316" />
          <Text style={[styles.flipBtnText, { color: colors.text }]}>Balik Kartu (Lihat QR)</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 8 },
  content: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 },
  cardContainer: { width: '100%', aspectRatio: 0.65 },
  card: { width: '100%', height: '100%', borderRadius: 30, padding: 24, shadowColor: '#F97316', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 35, elevation: 15, justifyContent: 'space-between' },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  wknLogoBox: { width: 40, height: 40, backgroundColor: '#FFF', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardWKNText: { fontSize: 24, fontWeight: '900', color: '#FFF', letterSpacing: -1 },
  cardMiddle: { alignItems: 'center' },
  avatarLarge: { width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.2)', borderWidth: 3, borderColor: '#FFF', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  avatarLetter: { fontSize: 40, fontWeight: '900', color: '#FFF' },
  employeeName: { fontSize: 22, fontWeight: '800', color: '#FFF', textAlign: 'center' },
  employeeRole: { fontSize: 14, fontWeight: '600', color: 'rgba(255,255,255,0.8)', marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 16 },
  bottomLabel: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.6)', letterSpacing: 1, marginBottom: 4 },
  bottomValue: { fontSize: 14, fontWeight: '800', color: '#FFF' },
  qrContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20 },
  qrTitle: { fontSize: 14, fontWeight: '900', letterSpacing: 1.5, marginBottom: 24, textAlign: 'center' },
  qrBox: { padding: 16, backgroundColor: '#FFF', borderRadius: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5, marginBottom: 30 },
  qrDesc: { fontSize: 12, textAlign: 'center', lineHeight: 18 },
  flipBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', height: 60, borderRadius: 30, borderWidth: 1, marginTop: 40, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  flipBtnText: { fontSize: 15, fontWeight: '800' }
});
