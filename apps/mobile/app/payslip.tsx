import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, RefreshControl, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { apiClient } from '../lib/apiClient';

export default function PayslipScreen() {
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  const [selectedMonth, setSelectedMonth] = useState('April 2026');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data
  const [salaryData, setSalaryData] = useState<any>(null);
  const [template, setTemplate] = useState<any>(null);

  const fetchData = async () => {
    try {
      if (!userData?.id) return;
      
      const res = await apiClient.get('/payroll/my-salary');
      if (res.status === 'success' && res.data) {
        setSalaryData(res.data.salary);
        setTemplate(res.data.template);
      }

    } catch (e) {
      console.log('Error fetching data:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  let earnings = [];
  let deductions = [];
  let totalEarnings = 0;
  let totalDeductions = 0;
  let netSalary = 0;

  if (salaryData) {
    const addEarning = (label: string, value: number) => {
      if (value > 0) earnings.push({ label, value });
    };
    const addDeduction = (label: string, value: number) => {
      if (value > 0) deductions.push({ label, value });
    };

    addEarning('Gaji Pokok', Number(salaryData.basic_salary) || 0);
    addEarning('Tunjangan Posisi', Number(salaryData.position_allowance) || 0);
    addEarning('Tunjangan Keahlian', Number(salaryData.skill_allowance) || 0);
    addEarning('Tunjangan Komunikasi', Number(salaryData.communication_allowance) || 0);
    addEarning('Tunjangan Work Order', Number(salaryData.work_order_allowance) || 0);
    addEarning('Tunjangan Makan', Number(salaryData.meals_allowance) || 0);
    addEarning('Tunjangan Transport', Number(salaryData.transport_allowance) || 0);
    addEarning('Tunjangan Lembur', Number(salaryData.overtime_allowance) || 0);
    addEarning('Tunjangan Pajak', Number(salaryData.tax_allowance) || 0);
    addEarning('THR', Number(salaryData.thr) || 0);
    addEarning('Bonus', Number(salaryData.bonus) || 0);
    addEarning('Insentif', Number(salaryData.incentive) || 0);
    addEarning('Lain-lain', Number(salaryData.misc_earnings) || 0);

    // Some BPJS values are allowances (perusahaan bayar), some are deductions.
    // For payslip preview, we typically show deductions in the deduction section.
    addDeduction('PPh 21', Number(salaryData.pph21) || 0);
    addDeduction('BPJS TK JHT', Number(salaryData.deduction_jht) || 0);
    addDeduction('BPJS TK Pensiun', Number(salaryData.deduction_pensiun) || 0);
    addDeduction('BPJS Kesehatan', Number(salaryData.deduction_kesehatan) || 0);
    addDeduction('Pinjaman', Number(salaryData.loan) || 0);
    addDeduction('Potongan Lainnya', Number(salaryData.misc_deductions) || 0);

    totalEarnings = earnings.reduce((sum, item) => sum + item.value, 0);
    totalDeductions = deductions.reduce((sum, item) => sum + item.value, 0);
    netSalary = totalEarnings - totalDeductions;
  }

  const handleDownload = async () => {
    if (!salaryData) {
      Alert.alert('Gagal', 'Data gaji tidak tersedia');
      return;
    }
    
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    const timestamp = new Date().toLocaleString('id-ID', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
    
    const downloaderName = userData?.name || 'Karyawan WKN';
    
    // Use Template Data or fallback
    const companyName = template?.company_name || 'PT. Wijaya Kreatif Nusantara';
    const primaryColor = template?.primary_color || '#F97316';
    const showAddress = template?.show_company_address ?? true;
    const companyAddress = template?.company_address || 'Gedung WKNsite, Jl. Sudirman Kav. 1, Jakarta 12190';
    const watermarkEnabled = template?.watermark_enabled ?? true;
    const logoImg = template?.header_logo_url ? `<img src="${template.header_logo_url}" style="max-height: 80px; margin-bottom: 15px;" />` : '';

    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; position: relative; }
            ${watermarkEnabled ? `
            .watermark { 
              position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-45deg);
              font-size: 60px; color: ${primaryColor}15; white-space: nowrap; font-weight: bold;
              z-index: -1; text-align: center; line-height: 1.5;
            }
            .watermark-small { font-size: 24px; color: rgba(0, 0, 0, 0.15); margin-top: 20px; }
            ` : '.watermark { display: none; }'}
            .header { text-align: center; border-bottom: 2px solid ${primaryColor}; padding-bottom: 20px; margin-bottom: 30px; }
            .title { font-size: 24px; font-weight: bold; color: ${primaryColor}; margin: 0; }
            .subtitle { font-size: 14px; color: #666; margin-top: 5px; }
            .address { font-size: 12px; color: #888; margin-top: 5px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
            .section { margin-top: 30px; margin-bottom: 15px; font-weight: bold; font-size: 16px; color: ${primaryColor}; text-transform: uppercase; }
            .total { font-weight: bold; font-size: 18px; margin-top: 15px; border-top: 2px solid #eee; padding-top: 10px; }
            .footer { margin-top: 50px; font-size: 10px; color: #999; text-align: center; }
          </style>
        </head>
        <body>
          <div class="watermark">
            ${companyName.toUpperCase()}<br/>
            <div class="watermark-small">
              Diunduh oleh: ${downloaderName}<br/>
              Pada: ${timestamp}
            </div>
          </div>
          
          <div class="header">
            ${logoImg}
            <h1 class="title">${companyName}</h1>
            ${showAddress ? `<p class="address">${companyAddress}</p>` : ''}
            <p class="subtitle">Slip Gaji Karyawan - Periode ${selectedMonth}</p>
          </div>
          
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <div class="row" style="border: none;">
              <strong>Nama Pegawai:</strong> <span>${downloaderName}</span>
            </div>
            <div class="row" style="border: none;">
              <strong>ID / NIK:</strong> <span>${userData?.id?.substring(0,8).toUpperCase() || 'WKN-001'}</span>
            </div>
          </div>
          
          <div class="section">Penerimaan (Earnings)</div>
          ${earnings.map(e => `<div class="row"><span>${e.label}</span><span>${formatCurrency(e.value)}</span></div>`).join('')}
          <div class="row total">
            <span>Total Penerimaan Bruto</span><span style="color: green;">${formatCurrency(totalEarnings)}</span>
          </div>
          
          <div class="section">Potongan (Deductions)</div>
          ${deductions.map(d => `<div class="row"><span>${d.label}</span><span style="color: red;">- ${formatCurrency(d.value)}</span></div>`).join('')}
          <div class="row total">
            <span>Total Potongan</span><span style="color: red;">${formatCurrency(totalDeductions)}</span>
          </div>
          
          <div class="section" style="font-size: 20px; border-top: 2px solid #333; padding-top: 20px;">
            <div class="row">
              <span>TAKE HOME PAY</span>
              <span>${formatCurrency(netSalary)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Dokumen ini dihasilkan secara otomatis oleh sistem ${companyName} dan sah tanpa tanda tangan basah.</p>
            <p>Diunduh oleh: ${downloaderName} pada ${timestamp}</p>
          </div>
        </body>
      </html>
    `;
    
    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } catch (error) {
      Alert.alert('Error', 'Gagal memproses PDF');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Slip Gaji Digital</Text>
        <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/salary-details')}>
          <Ionicons name="document-text-outline" size={22} color={colors.text} />
        </TouchableOpacity>
      </View>

      {!salaryData ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
          <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
          <Text style={{ marginTop: 20, fontSize: 16, color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Slip Gaji Belum Tersedia</Text>
          <Text style={{ marginTop: 10, fontSize: 14, color: '#64748B', textAlign: 'center' }}>Admin belum mempublikasikan gaji Anda.</Text>
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} tintColor="#F97316" />}
        >
          {/* Salary Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: template?.primary_color || '#F97316' }]}>
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
          <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
            <Ionicons name="download-outline" size={20} color="#fff" />
            <Text style={styles.downloadBtnText}>UNDUH PDF (E-PAYSLIP)</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Dokumen ini dihasilkan secara otomatis oleh sistem WKNsite dan merupakan bukti pembayaran gaji yang sah sesuai dengan regulasi perusahaan.
          </Text>
          
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 8 },
  historyBtn: { padding: 8 },
  scrollContent: { padding: 20 },
  summaryCard: { borderRadius: 30, padding: 30, marginBottom: 30, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  summaryValue: { color: '#fff', fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  summaryBadge: { backgroundColor: 'rgba(255,255,255,0.2)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 20 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  circleDecor1: { position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(255,255,255,0.1)' },
  circleDecor2: { position: 'absolute', bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: 'rgba(255,255,255,0.05)' },
  sectionHeader: { marginBottom: 10, marginLeft: 5 },
  sectionTitle: { fontSize: 11, fontWeight: '800', letterSpacing: 1, opacity: 0.6 },
  detailCard: { borderRadius: 24, padding: 20, marginBottom: 25, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  noBorder: { borderBottomWidth: 0 },
  rowLabel: { fontSize: 14, fontWeight: '600', opacity: 0.8 },
  rowValue: { fontSize: 14, fontWeight: '700' },
  totalDivider: { height: 1.5, backgroundColor: 'rgba(0,0,0,0.05)', marginVertical: 5 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14 },
  totalLabel: { fontSize: 14, fontWeight: '800' },
  totalValueGreen: { fontSize: 16, fontWeight: '900', color: '#10B981' },
  totalValueRed: { fontSize: 16, fontWeight: '900', color: '#EF4444' },
  downloadBtn: { backgroundColor: '#1E293B', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 20, gap: 12, marginTop: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  downloadBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  disclaimerText: { fontSize: 10, color: '#94A3B8', textAlign: 'center', marginTop: 25, lineHeight: 16, paddingHorizontal: 20 }
});
