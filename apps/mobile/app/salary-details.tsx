import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function SalaryDetailsScreen() {
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Salary Data State
  const [salaryData, setSalaryData] = useState<any>(null);

  const fetchData = async () => {
    try {
      if (!userData?.id) return;
      const { data, error } = await supabase
        .from('employee_salaries')
        .select('*')
        .eq('employee_id', userData.id)
        .single();
        
      if (error && error.code !== 'PGRST116') { // PGRST116 is no rows returned
        throw error;
      } else if (data) {
        setSalaryData(data);
        await AsyncStorage.setItem('cached_salary', JSON.stringify(data));
      }
    } catch (e) {
      console.error('Network error, loading from cache:', e);
      try {
        const cached = await AsyncStorage.getItem('cached_salary');
        if (cached) {
          setSalaryData(JSON.parse(cached));
          Alert.alert('Mode Offline', 'Menampilkan data gaji yang tersimpan terakhir kali.');
        }
      } catch (cacheErr) {}
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

  const formatCurrency = (amount: number | string | undefined) => {
    const num = parseFloat(String(amount)) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const calculateTotals = () => {
    if (!salaryData) return { fixedTotal: 0, variableTotal: 0, nonWageTotal: 0, totalEarnings: 0, totalDeductions: 0, netSalary: 0 };

    const fixedTotal = 
      (Number(salaryData.basic_salary) || 0) +
      (Number(salaryData.position_allowance) || 0) +
      (Number(salaryData.skill_allowance) || 0) +
      (Number(salaryData.communication_allowance) || 0) +
      (Number(salaryData.bpjs_tk_jkk) || 0) +
      (Number(salaryData.bpjs_tk_jkm) || 0) +
      (Number(salaryData.bpjs_tk_jht) || 0) +
      (Number(salaryData.bpjs_tk_pensiun) || 0) +
      (Number(salaryData.bpjs_kesehatan) || 0) +
      (Number(salaryData.tax_allowance) || 0);

    const variableTotal =
      (Number(salaryData.work_order_allowance) || 0) +
      (Number(salaryData.meals_allowance) || 0) +
      (Number(salaryData.transport_allowance) || 0) +
      (Number(salaryData.overtime_allowance) || 0);

    const nonWageTotal =
      (Number(salaryData.thr) || 0) +
      (Number(salaryData.bonus) || 0) +
      (Number(salaryData.incentive) || 0) +
      (Number(salaryData.misc_earnings) || 0);

    const totalEarnings = fixedTotal + variableTotal + nonWageTotal;

    const totalDeductions =
      (Number(salaryData.pph21) || 0) +
      (Number(salaryData.deduction_jht) || 0) +
      (Number(salaryData.deduction_pensiun) || 0) +
      (Number(salaryData.deduction_kesehatan) || 0) +
      (Number(salaryData.loan) || 0) +
      (Number(salaryData.misc_deductions) || 0);

    const netSalary = totalEarnings - totalDeductions;

    return { fixedTotal, variableTotal, nonWageTotal, totalEarnings, totalDeductions, netSalary };
  };

  const totals = calculateTotals();

  const InputField = ({ label, value }: { label: string; value: string | number }) => (
    <View style={styles.inputRow}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC', borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0' }]}>
        <Text style={[styles.inputValueText, { color: colors.text }]}>
          {value ? (typeof value === 'string' && isNaN(Number(value)) ? value : formatCurrency(value)) : 'Rp 0'}
        </Text>
      </View>
    </View>
  );

  const SectionTitle = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.sectionTitleContainer}>
      <Ionicons name={icon as any} size={18} color="#F97316" />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  if (!salaryData) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Rincian Gaji</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 14 }}>
          <Ionicons name="document-text-outline" size={64} color="#CBD5E1" />
          <Text style={{ marginTop: 14, fontSize: 16, color: colors.text, textAlign: 'center', fontWeight: 'bold' }}>Data Gaji Belum Tersedia</Text>
          <Text style={{ marginTop: 10, fontSize: 14, color: '#64748B', textAlign: 'center' }}>Admin belum menginput data gaji Anda ke dalam sistem.</Text>
        </View>
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rincian Gaji</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.keyboardView}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} tintColor="#F97316" />}
        >
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: '#F97316' }]}>
            <Text style={styles.summaryLabel}>Take Home Pay (THP)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totals.netSalary)}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Total Penerimaan</Text>
                <Text style={styles.summaryItemValue}>{formatCurrency(totals.totalEarnings)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Total Potongan</Text>
                <Text style={[styles.summaryItemValue, { color: '#FCA5A5' }]}>
                  {formatCurrency(totals.totalDeductions)}
                </Text>
              </View>
            </View>
          </View>

          {/* Grade */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="Grade / Golongan" value={salaryData.grade || '-'} />
          </View>

          {/* Fixed Allowance */}
          <SectionTitle title="FIXED ALLOWANCE" icon="wallet-outline" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="1. Gaji Pokok (Basic Salary)" value={salaryData.basic_salary} />
            <InputField label="2. Tunjangan Posisi" value={salaryData.position_allowance} />
            <InputField label="3. Tunjangan Keahlian (Skill)" value={salaryData.skill_allowance} />
            <InputField label="4. Tunjangan Komunikasi" value={salaryData.communication_allowance} />
            <InputField label="5. BPJS TK JKK" value={salaryData.bpjs_tk_jkk} />
            <InputField label="6. BPJS TK JKM" value={salaryData.bpjs_tk_jkm} />
            <InputField label="7. BPJS TK JHT" value={salaryData.bpjs_tk_jht} />
            <InputField label="8. BPJS TK Pensiun" value={salaryData.bpjs_tk_pensiun} />
            <InputField label="9. BPJS Kesehatan" value={salaryData.bpjs_kesehatan} />
            <InputField label="10. Tunjangan Pajak" value={salaryData.tax_allowance} />
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Fixed Allowance</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.fixedTotal)}</Text>
            </View>
          </View>

          {/* Variable Allowance */}
          <SectionTitle title="VARIABLE ALLOWANCE" icon="trending-up-outline" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="1. Tunjangan Work Order" value={salaryData.work_order_allowance} />
            <InputField label="2. Tunjangan Makan" value={salaryData.meals_allowance} />
            <InputField label="3. Tunjangan Transport" value={salaryData.transport_allowance} />
            <InputField label="4. Tunjangan Lembur" value={salaryData.overtime_allowance} />
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Variable Allowance</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.variableTotal)}</Text>
            </View>
          </View>

          {/* Non-Wage Income */}
          <SectionTitle title="NON-WAGE INCOME" icon="gift-outline" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="1. THR" value={salaryData.thr} />
            <InputField label="2. Bonus" value={salaryData.bonus} />
            <InputField label="3. Insentif" value={salaryData.incentive} />
            <InputField label="4. Penerimaan Lain-lain" value={salaryData.misc_earnings} />
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Non-Wage Income</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.nonWageTotal)}</Text>
            </View>
          </View>

          {/* Deductions */}
          <SectionTitle title="DEDUCTIONS / POTONGAN" icon="remove-circle-outline" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="1. PPh 21" value={salaryData.pph21} />
            <InputField label="2. BPJS TK JHT" value={salaryData.deduction_jht} />
            <InputField label="3. BPJS TK Pensiun" value={salaryData.deduction_pensiun} />
            <InputField label="4. BPJS Kesehatan" value={salaryData.deduction_kesehatan} />
            <InputField label="5. Pinjaman / Loan" value={salaryData.loan} />
            <InputField label="6. Potongan Lain-lain" value={salaryData.misc_deductions} />
            
            <View style={[styles.totalRow, styles.deductionTotal]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Potongan</Text>
              <Text style={styles.totalValueRed}>{formatCurrency(totals.totalDeductions)}</Text>
            </View>
          </View>

          {/* Correction Button */}
          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: '#EF4444', shadowColor: '#EF4444' }]}
            onPress={() => router.push('/salary-correction' as any)}
          >
            <Ionicons name="warning-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>AJUKAN KOREKSI GAJI</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Ini adalah rincian gaji resmi Anda yang diinput oleh HR/Admin. Karyawan tidak dapat mengubah rincian ini. Jika ada ketidaksesuaian nominal, segera ajukan form koreksi gaji.
          </Text>
          
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10, paddingBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(0,0,0,0.05)', justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 14 },
  summaryCard: { borderRadius: 12, padding: 16, marginBottom: 16, shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.25, shadowRadius: 16, elevation: 8 },
  summaryLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '700', marginBottom: 8 },
  summaryValue: { color: '#fff', fontSize: 20, fontWeight: '900', letterSpacing: -1 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)' },
  summaryItem: { flex: 1 },
  summaryItemLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', marginBottom: 4 },
  summaryItemValue: { color: '#fff', fontSize: 16, fontWeight: '800' },
  card: { borderRadius: 14, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, marginLeft: 4 },
  sectionTitleText: { fontSize: 13, fontWeight: '800', color: '#F97316', letterSpacing: 1, marginLeft: 8 },
  inputRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.03)' },
  inputLabel: { fontSize: 13, fontWeight: '600', flex: 1, paddingRight: 12 },
  inputContainer: { padding: 10, borderRadius: 12, borderWidth: 1, minWidth: 120, alignItems: 'flex-end' },
  inputValueText: { fontSize: 14, fontWeight: '700' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, marginTop: 8, borderTopWidth: 2, borderTopColor: 'rgba(0,0,0,0.06)' },
  deductionTotal: { borderTopColor: 'rgba(239, 68, 68, 0.2)' },
  totalLabel: { fontSize: 15, fontWeight: '800' },
  totalValue: { fontSize: 16, fontWeight: '900', color: '#10B981' },
  totalValueRed: { fontSize: 16, fontWeight: '900', color: '#EF4444' },
  saveButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 18, borderRadius: 14, gap: 12, marginTop: 10, elevation: 5 },
  saveButtonText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  disclaimerText: { fontSize: 11, color: '#94A3B8', textAlign: 'center', marginTop: 16, lineHeight: 16, paddingHorizontal: 16 },
});