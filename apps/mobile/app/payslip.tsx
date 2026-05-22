import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export default function PayslipScreen() {
  const { colors, isDark } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState('April 2026');

  const earnings = [
    { label: 'Gaji Pokok', value: 8500000 },
    { label: 'Tunjangan Transport', value: 750000 },
    { label: 'Tunjangan Makan', value: 500000 },
    { label: 'Insentif Kehadiran', value: 250000 },
  ];

  const deductions = [
    { label: 'BPJS Kesehatan', value: 120000 },
    { label: 'BPJS Ketenagakerjaan', value: 180000 },
    { label: 'Pajak PPh 21', value: 245000 },
  ];

  const totalEarnings = earnings.reduce((sum, item) => sum + item.value, 0);
  const totalDeductions = deductions.reduce((sum, item) => sum + item.value, 0);
  const netSalary = totalEarnings - totalDeductions;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Slip Gaji Digital</Text>
        <TouchableOpacity style={styles.historyBtn}>
          <Ionicons name="calendar-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Salary Summary Card */}
        <View style={[styles.summaryCard, { backgroundColor: '#E31E24' }]}>
          <Text style={styles.summaryLabel}>Total Gaji Bersih (Take Home Pay)</Text>
          <Text style={styles.summaryValue}>{formatCurrency(netSalary)}</Text>
          <View style={styles.summaryBadge}>
            <Text style={styles.badgeText}>{selectedMonth}</Text>
          </View>
          <View style={styles.circleDecor1} />
          <View style={styles.circleDecor2} />
        </View>

        {/* Detailed Section: Earnings */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>PENERIMAAN / EARNINGS</Text>
        </View>
        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          {earnings.map((item, index) => (
            <View key={index} style={[styles.detailRow, index === earnings.length - 1 && styles.noBorder]}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.rowValue, { color: colors.text }]}>{formatCurrency(item.value)}</Text>
            </View>
          ))}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Penerimaan Bruto</Text>
            <Text style={styles.totalValueGreen}>{formatCurrency(totalEarnings)}</Text>
          </View>
        </View>

        {/* Detailed Section: Deductions */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>POTONGAN / DEDUCTIONS</Text>
        </View>
        <View style={[styles.detailCard, { backgroundColor: colors.card }]}>
          {deductions.map((item, index) => (
            <View key={index} style={[styles.detailRow, index === deductions.length - 1 && styles.noBorder]}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
              <Text style={[styles.rowValue, { color: '#EF4444' }]}>- {formatCurrency(item.value)}</Text>
            </View>
          ))}
          <View style={styles.totalDivider} />
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>Total Potongan</Text>
            <Text style={styles.totalValueRed}>{formatCurrency(totalDeductions)}</Text>
          </View>
        </View>

        {/* Footer Actions */}
        <TouchableOpacity 
          style={styles.downloadBtn}
          onPress={() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            alert('PDF Berhasil Diunduh ke Perangkat Anda');
          }}
        >
          <Ionicons name="download-outline" size={20} color="#fff" />
          <Text style={styles.downloadBtnText}>UNDUH PDF (E-PAYSLIP)</Text>
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          Dokumen ini dihasilkan secara otomatis oleh sistem WKNsite dan merupakan bukti pembayaran gaji yang sah sesuai dengan regulasi perusahaan.
        </Text>
        
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  backBtn: {
    padding: 8,
  },
  historyBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    borderRadius: 30,
    padding: 30,
    marginBottom: 30,
    overflow: 'hidden',
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
  },
  summaryBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  circleDecor1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  circleDecor2: {
    position: 'absolute',
    bottom: -30,
    left: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  sectionHeader: {
    marginBottom: 10,
    marginLeft: 5,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    opacity: 0.6,
  },
  detailCard: {
    borderRadius: 24,
    padding: 20,
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  rowLabel: {
    fontSize: 14,
    fontWeight: '600',
    opacity: 0.8,
  },
  rowValue: {
    fontSize: 14,
    fontWeight: '700',
  },
  totalDivider: {
    height: 1.5,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 5,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  totalValueGreen: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  totalValueRed: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EF4444',
  },
  downloadBtn: {
    backgroundColor: '#1E293B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    gap: 12,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  downloadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  disclaimerText: {
    fontSize: 10,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 25,
    lineHeight: 16,
    paddingHorizontal: 20,
  }
});
