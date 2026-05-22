import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../context/ThemeContext';

export default function DevelopmentScreen() {
  const { colors, isDark } = useTheme();
  const { title } = useLocalSearchParams();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1F1F1F' : '#F1F5F9' }]}>
          <Ionicons name="construct-outline" size={60} color="#E31E24" />
        </View>
        <Text style={[styles.title, { color: colors.text }]}>Fitur Sedang Dikembangkan</Text>
        <Text style={styles.subtitle}>
          Kami sedang menyiapkan modul <Text style={{fontWeight: '800', color: '#E31E24'}}>{title || 'ini'}</Text> untuk memberikan pengalaman terbaik bagi Anda. Silakan cek kembali dalam waktu dekat!
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
          <Text style={styles.progressText}>Proses Pengembangan: 65%</Text>
        </View>

        <TouchableOpacity 
          style={[styles.homeBtn, { backgroundColor: '#E31E24' }]}
          onPress={() => router.back()}
        >
          <Text style={styles.homeBtnText}>KEMBALI KE MENU</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  backBtn: {
    padding: 8,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    marginTop: -50,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 15,
  },
  subtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 40,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  progressBar: {
    width: '80%',
    height: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    width: '65%',
    height: '100%',
    backgroundColor: '#10B981',
  },
  progressText: {
    fontSize: 11,
    color: '#10B981',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  homeBtn: {
    paddingHorizontal: 30,
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  homeBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
