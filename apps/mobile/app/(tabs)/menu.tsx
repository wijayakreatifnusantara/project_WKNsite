import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, StatusBar, Dimensions, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const { width } = Dimensions.get('window');

export default function MenuScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh for UI feedback
    setTimeout(() => setRefreshing(false), 800);
  };

  const essItems = [
    { id: '1', title: 'Izin & Cuti', icon: 'calendar', color: '#F97316', bg: '#FEF2F2', badge: '2', route: '/leave' },
    { id: '2', title: 'Lembur', icon: 'time', color: '#f97316', bg: '#FFF7ED', route: '/overtime' },
    { id: '3', title: 'Slip Gaji', icon: 'receipt', color: '#8b5cf6', bg: '#F5F3FF', route: '/payslip' },
    { id: '10', title: 'Reimburse', icon: 'cash', color: '#10b981', bg: '#ECFDF5', route: '/reimburse' },
    { id: '12', title: 'Dokumen', icon: 'document-attach', color: '#ec4899', bg: '#FDF2F8', route: '/documents' },
    { id: '9', title: 'Direktori', icon: 'people', color: '#3b82f6', bg: '#EFF6FF', route: '/directory' },
    { id: '7', title: 'Asset', icon: 'briefcase', color: '#06b6d4', bg: '#ECFEFF', route: '/development?title=Asset' },
  ];

  const reportItems = [
    { id: '4', title: 'Laporan', icon: 'bar-chart', color: '#10b981', bg: '#F0FDF4', route: '/development?title=Laporan' },
    { id: '13', title: 'Timesheet', icon: 'time-outline', color: '#8b5cf6', bg: '#F5F3FF', route: '/timesheet' },
    { id: '11', title: 'Laporan WO', icon: 'document-text', color: '#e11d48', bg: '#FFF1F2', route: '/development?title=Laporan WO' },
  ];

  const supportItems = [
    { id: '5', title: 'Wiki WKN', icon: 'book', color: '#3b82f6', bg: '#F0F9FF', route: '/development?title=Wiki WKN' },
    { id: '6', title: 'Academy', icon: 'school', color: '#f59e0b', bg: '#FFFBEB', route: '/development?title=Academy' },
    { id: '8', title: 'Helpdesk', icon: 'help-circle', color: '#6366f1', bg: '#EEF2FF', route: '/helpdesk' },
  ];

  const renderGrid = (items: typeof essItems) => (
    <View style={styles.grid}>
      {items.map((item) => (
        <TouchableOpacity 
          key={item.id} 
          style={[styles.menuCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#E2E8F0' }]}
          activeOpacity={0.7}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (item.route) router.push(item.route as any);
          }}
        >
          <View style={[styles.iconCircle, { backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : item.bg }]}>
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
      
      {/* Sleek, professional header with Left Accent Border */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <View style={{ borderLeftWidth: 4, borderLeftColor: '#F97316', paddingLeft: 12 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Menu Fitur</Text>
          <Text style={styles.headerSubtitle}>Kelola pekerjaan dan informasi perusahaan</Text>
        </View>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} tintColor="#F97316" />
        }
      >
        {/* Quick Stats Panel Widget with Red Left Border */}
        <View style={[styles.statsContainer, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', borderLeftColor: '#F97316' }]}>
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

        {/* Section 2: Laporan */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subText || '#8E8E93' }]}>LAPORAN & MONITORING</Text>
          {renderGrid(reportItems)}
        </View>

        {/* Section 3: Pengembangan & Dukungan */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.subText || '#8E8E93' }]}>PENGEMBANGAN & DUKUNGAN</Text>
          {renderGrid(supportItems)}
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 20,
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
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderLeftWidth: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#F97316',
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
    backgroundColor: '#E2E8F0',
    alignSelf: 'center',
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 14,
    paddingLeft: 4,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  menuCard: {
    width: (width - 52) / 3, // 3-column layout
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuLabel: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F97316',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)'
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
    backgroundColor: '#F97316', // WKN Corporate Brand Color
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 4,
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
