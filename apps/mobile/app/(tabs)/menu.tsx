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
      const sessionData = await AsyncStorage.getItem('user_session');
      if (sessionData) setUserData(JSON.parse(sessionData));
    } catch (e) {
      console.log('Error checking session:', e);
    }
  };

  const menuItems = [
    { id: '1', title: 'Izin & Cuti', icon: 'calendar', color: '#3b82f6', bg: '#F0F9FF', badge: '2', route: '/development?title=Izin & Cuti' },
    { id: '2', title: 'Lembur', icon: 'timer', color: '#f97316', bg: '#FFF7ED', route: '/development?title=Lembur' },
    { id: '3', title: 'Slip Gaji', icon: 'receipt', color: '#8b5cf6', bg: '#F5F3FF', route: '/payslip' },
    { id: '4', title: 'Laporan', icon: 'bar-chart', color: '#10b981', bg: '#F0FDF4', route: '/development?title=Laporan' },
    { id: '5', title: 'Wiki WKN', icon: 'book', color: '#ef4444', bg: '#FEF2F2', route: '/development?title=Wiki WKN' },
    { id: '6', title: 'Academy', icon: 'school', color: '#06b6d4', bg: '#ECFEFF', route: '/development?title=Academy' },
    { id: '7', title: 'Asset', icon: 'briefcase', color: '#f59e0b', bg: '#FFFBEB', route: '/development?title=Asset' },
    { id: '8', title: 'Helpdesk', icon: 'help-circle', color: '#6366f1', bg: '#EEF2FF', route: '/development?title=Helpdesk' },
    { id: '9', title: 'Direktori', icon: 'people', color: '#10b981', bg: '#F0FDF4', route: '/directory' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Menu Utama</Text>
        <Text style={styles.headerSubtitle}>Akses seluruh fitur WKNsite</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={[styles.menuCard, { backgroundColor: colors.card }]}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                if (item.route) router.push(item.route as any);
              }}
            >
              <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1F1F1F' : item.bg }]}>
                <Ionicons name={item.icon as any} size={28} color={item.color} />
              </View>
              <Text style={[styles.menuLabel, { color: colors.text }]}>{item.title}</Text>
              {item.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bannerSection}>
          <TouchableOpacity style={styles.promoBanner}>
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>WKN Academy</Text>
              <Text style={styles.promoDesc}>Tingkatkan skill Anda hari ini!</Text>
            </View>
            <Ionicons name="arrow-forward-circle" size={40} color="#fff" />
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
    backgroundColor: '#F8F9FB',
  },
  header: {
    paddingHorizontal: 25,
    paddingTop: 40,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1C1C1E',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 4,
  },
  scrollContent: {
    padding: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 15,
  },
  menuCard: {
    width: (width - 55) / 2,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    position: 'relative',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
  },
  badge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '900',
  },
  bannerSection: {
    marginTop: 30,
  },
  promoBanner: {
    backgroundColor: '#4F46E5',
    borderRadius: 24,
    padding: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  promoDesc: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  }
});
