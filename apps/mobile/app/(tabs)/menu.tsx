import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function MenuScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    try {
      const sessionData = await AsyncStorage.getItem('userSession');
      if (sessionData) setUserData(JSON.parse(sessionData));
    } catch (e) {
      console.log('Error checking session:', e);
    }
  };

  const essItems = [
    { id: '1', title: 'Izin & Cuti', icon: 'calendar', color: '#E31E24', bg: '#FEF2F2', badge: '2', route: '/development?title=Izin & Cuti' },
    { id: '2', title: 'Lembur', icon: 'time', color: '#f97316', bg: '#FFF7ED', route: '/overtime' },
    { id: '3', title: 'Slip Gaji', icon: 'receipt', color: '#8b5cf6', bg: '#F5F3FF', route: '/payslip' },
    { id: '9', title: 'Direktori', icon: 'people', color: '#10b981', bg: '#F0FDF4', route: '/directory' },
    { id: '7', title: 'Asset', icon: 'briefcase', color: '#06b6d4', bg: '#ECFEFF', route: '/development?title=Asset' },
  ];

  const infoItems = [
    { id: '5', title: 'Wiki WKN', icon: 'book', color: '#3b82f6', bg: '#F0F9FF', route: '/development?title=Wiki WKN' },
    { id: '6', title: 'Academy', icon: 'school', color: '#f59e0b', bg: '#FFFBEB', route: '/development?title=Academy' },
    { id: '4', title: 'Laporan', icon: 'bar-chart', color: '#10b981', bg: '#F0FDF4', route: '/development?title=Laporan' },
    { id: '8', title: 'Helpdesk', icon: 'help-circle', color: '#6366f1', bg: '#EEF2FF', route: '/development?title=Helpdesk' },
  ];

  const renderGrid = (items: typeof essItems) => (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          style={[styles.menuCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (item.route) router.push(item.route as any);
          }}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1F1F1F' : item.bg }]}>
            <Ionicons name={item.icon as any} size={22} color={item.color} />
          </View>
          <Text numberOfLines={2} style={[styles.menuLabel, { color: colors.text }]}>{item.title}</Text>
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Sleek, professional header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Menu Fitur</Text>
        <Text style={styles.headerSubtitle}>Kelola pekerjaan dan informasi perusahaan</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Stats Panel Widget */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
          <View style={styles.statItem}>
            <Text style={styles.statVal}>12</Text>
            <Text style={styles.statLbl}>Sisa Cuti</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statVal}>98%</Text>
            <Text style={styles.statLbl}>Kehadiran</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statVal, { color: '#f97316' }]}>4.5h</Text>
            <Text style={styles.statLbl}>Lembur (Bln ini)</Text>
          </View>
        </View>

        {/* Section 1: ESS & Administrasi */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subText || '#8E8E93' }]}>KEPEGAWAIAN & ESS</Text>
          {renderGrid(essItems)}
        </View>

        {/* Section 2: Informasi & Pengembangan */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subText || '#8E8E93' }]}>PENGEMBANGAN & DUKUNGAN</Text>
          {renderGrid(infoItems)}
        </View>

        {/* Dynamic promo banner */}
        <View style={styles.bannerSection}>
          <TouchableOpacity style={styles.promoBanner} activeOpacity={0.95}>
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>WKN Academy</Text>
              <Text style={styles.promoDesc}>Pelajari modul dan sertifikasi baru secara mandiri.</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={32} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 4,
  },
  scrollContent: {
    padding: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 6,
    elevation: 1,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#E31E24',
  },
  statLbl: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '700',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
    paddingLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  menuCard: {
    width: (width - 52) / 3, // 3-column layout
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 14,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#E31E24',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 8,
    fontWeight: '900',
  },
  bannerSection: {
    marginTop: 8,
  },
  promoBanner: {
    backgroundColor: '#E31E24', // Match WKN Brand Color
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoText: {
    flex: 1,
    marginRight: 10,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  promoDesc: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  }
});
