import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

interface SalaryItem {
  id: string;
  label: string;
  value: string;
}

interface SalarySection {
  title: string;
  items: SalaryItem[];
}

export default function SalaryDetailsScreen() {
  const { colors, isDark } = useTheme();
  
  // Grade
  const [grade, setGrade] = useState('');
  
  // Fixed Allowance
  const [basicSalary, setBasicSalary] = useState('');
  const [positionAllowance, setPositionAllowance] = useState('');
  const [skillAllowance, setSkillAllowance] = useState('');
  const [communicationAllowance, setCommunicationAllowance] = useState('');
  const [bpjsTkJkk, setBpjsTkJkk] = useState('');
  const [bpjsTkJkm, setBpjsTkJkm] = useState('');
  const [bpjsTkJht, setBpjsTkJht] = useState('');
  const [bpjsTkPensiun, setBpjsTkPensiun] = useState('');
  const [bpjsKesehatan, setBpjsKesehatan] = useState('');
  const [taxAllowance, setTaxAllowance] = useState('');
  
  // Variable Allowance
  const [workOrderAllowance, setWorkOrderAllowance] = useState('');
  const [mealsAllowance, setMealsAllowance] = useState('');
  const [transportAllowance, setTransportAllowance] = useState('');
  const [overtimeAllowance, setOvertimeAllowance] = useState('');
  
  // Non-Wage Income
  const [thr, setThr] = useState('');
  const [bonus, setBonus] = useState('');
  const [incentive, setIncentive] = useState('');
  const [miscellaneousEarnings, setMiscellaneousEarnings] = useState('');
  
  // Deductions
  const [pph21, setPph21] = useState('');
  const [deductionBpjsTkJht, setDeductionBpjsTkJht] = useState('');
  const [deductionBpjsTkPensiun, setDeductionBpjsTkPensiun] = useState('');
  const [deductionBpjsKesehatan, setDeductionBpjsKesehatan] = useState('');
  const [loan, setLoan] = useState('');
  const [miscellaneousDeductions, setMiscellaneousDeductions] = useState('');

  const formatCurrency = (amount: string) => {
    const num = parseFloat(amount) || 0;
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(num);
  };

  const parseInput = (value: string) => parseFloat(value.replace(/[^0-9]/g, '')) || 0;

  const calculateTotals = () => {
    // Fixed Allowance Total
    const fixedTotal = 
      parseInput(basicSalary) +
      parseInput(positionAllowance) +
      parseInput(skillAllowance) +
      parseInput(communicationAllowance) +
      parseInput(bpjsTkJkk) +
      parseInput(bpjsTkJkm) +
      parseInput(bpjsTkJht) +
      parseInput(bpjsTkPensiun) +
      parseInput(bpjsKesehatan) +
      parseInput(taxAllowance);

    // Variable Allowance Total
    const variableTotal =
      parseInput(workOrderAllowance) +
      parseInput(mealsAllowance) +
      parseInput(transportAllowance) +
      parseInput(overtimeAllowance);

    // Non-Wage Income Total
    const nonWageTotal =
      parseInput(thr) +
      parseInput(bonus) +
      parseInput(incentive) +
      parseInput(miscellaneousEarnings);

    // Total Earnings (Gross)
    const totalEarnings = fixedTotal + variableTotal + nonWageTotal;

    // Deductions Total
    const totalDeductions =
      parseInput(pph21) +
      parseInput(deductionBpjsTkJht) +
      parseInput(deductionBpjsTkPensiun) +
      parseInput(deductionBpjsKesehatan) +
      parseInput(loan) +
      parseInput(miscellaneousDeductions);

    // Net Salary (Take Home Pay)
    const netSalary = totalEarnings - totalDeductions;

    return {
      fixedTotal,
      variableTotal,
      nonWageTotal,
      totalEarnings,
      totalDeductions,
      netSalary,
    };
  };

  const totals = calculateTotals();

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Berhasil', 'Data rincian gaji berhasil disimpan');
  };

  const InputField = ({ 
    label, 
    value, 
    onChange, 
    placeholder = '0' 
  }: { 
    label: string; 
    value: string; 
    onChange: (text: string) => void; 
    placeholder?: string;
  }) => (
    <View style={styles.inputRow}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[styles.input, { 
          backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
          color: colors.text,
          borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
        }]}
        value={value}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
        keyboardType="numeric"
      />
    </View>
  );

  const SectionTitle = ({ title, icon }: { title: string; icon: string }) => (
    <View style={styles.sectionTitleContainer}>
      <Ionicons name={icon as any} size={18} color="#E31E24" />
      <Text style={styles.sectionTitleText}>{title}</Text>
    </View>
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rincian Gaji</Text>
        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <Ionicons name="save-outline" size={22} color="#E31E24" />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: '#E31E24' }]}>
            <Text style={styles.summaryLabel}>Take Home Pay (THP)</Text>
            <Text style={styles.summaryValue}>{formatCurrency(totals.netSalary.toString())}</Text>
            <View style={styles.summaryRow}>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Total Penerimaan</Text>
                <Text style={styles.summaryItemValue}>{formatCurrency(totals.totalEarnings.toString())}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={styles.summaryItemLabel}>Total Potongan</Text>
                <Text style={[styles.summaryItemValue, { color: '#FCA5A5' }]}>
                  {formatCurrency(totals.totalDeductions.toString())}
                </Text>
              </View>
            </View>
          </View>

          {/* Grade */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField
              label="Grade / Golongan"
              value={grade}
              onChange={setGrade}
              placeholder="Contoh: III/A"
            />
          </View>

          {/* Fixed Allowance */}
          <SectionTitle title="FIXED ALLOWANCE" icon="wallet-outline" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="1. Gaji Pokok (Basic Salary)" value={basicSalary} onChange={setBasicSalary} />
            <InputField label="2. Tunjangan Posisi" value={positionAllowance} onChange={setPositionAllowance} />
            <InputField label="3. Tunjangan Keahlian (Skill)" value={skillAllowance} onChange={setSkillAllowance} />
            <InputField label="4. Tunjangan Komunikasi" value={communicationAllowance} onChange={setCommunicationAllowance} />
            <InputField label="5. BPJS TK JKK" value={bpjsTkJkk} onChange={setBpjsTkJkk} />
            <InputField label="6. BPJS TK JKM" value={bpjsTkJkm} onChange={setBpjsTkJkm} />
            <InputField label="7. BPJS TK JHT" value={bpjsTkJht} onChange={setBpjsTkJht} />
            <InputField label="8. BPJS TK Pensiun" value={bpjsTkPensiun} onChange={setBpjsTkPensiun} />
            <InputField label="9. BPJS Kesehatan" value={bpjsKesehatan} onChange={setBpjsKesehatan} />
            <InputField label="10. Tunjangan Pajak" value={taxAllowance} onChange={setTaxAllowance} />
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Fixed Allowance</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.fixedTotal.toString())}</Text>
            </View>
          </View>

          {/* Variable Allowance */}
          <SectionTitle title="VARIABLE ALLOWANCE" icon="trending-up-outline" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="1. Tunjangan Work Order" value={workOrderAllowance} onChange={setWorkOrderAllowance} />
            <InputField label="2. Tunjangan Makan" value={mealsAllowance} onChange={setMealsAllowance} />
            <InputField label="3. Tunjangan Transport" value={transportAllowance} onChange={setTransportAllowance} />
            <InputField label="4. Tunjangan Lembur" value={overtimeAllowance} onChange={setOvertimeAllowance} />
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Variable Allowance</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.variableTotal.toString())}</Text>
            </View>
          </View>

          {/* Non-Wage Income */}
          <SectionTitle title="NON-WAGE INCOME" icon="gift-outline" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="1. THR" value={thr} onChange={setThr} />
            <InputField label="2. Bonus" value={bonus} onChange={setBonus} />
            <InputField label="3. Insentif" value={incentive} onChange={setIncentive} />
            <InputField label="4. Penerimaan Lain-lain" value={miscellaneousEarnings} onChange={setMiscellaneousEarnings} />
            
            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Non-Wage Income</Text>
              <Text style={styles.totalValue}>{formatCurrency(totals.nonWageTotal.toString())}</Text>
            </View>
          </View>

          {/* Deductions */}
          <SectionTitle title="DEDUCTIONS / POTONGAN" icon="remove-circle-outline" />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <InputField label="1. PPh 21" value={pph21} onChange={setPph21} />
            <InputField label="2. BPJS TK JHT" value={deductionBpjsTkJht} onChange={setDeductionBpjsTkJht} />
            <InputField label="3. BPJS TK Pensiun" value={deductionBpjsTkPensiun} onChange={setDeductionBpjsTkPensiun} />
            <InputField label="4. BPJS Kesehatan" value={deductionBpjsKesehatan} onChange={setDeductionBpjsKesehatan} />
            <InputField label="5. Pinjaman / Loan" value={loan} onChange={setLoan} />
            <InputField label="6. Potongan Lain-lain" value={miscellaneousDeductions} onChange={setMiscellaneousDeductions} />
            
            <View style={[styles.totalRow, styles.deductionTotal]}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total Potongan</Text>
              <Text style={styles.totalValueRed}>{formatCurrency(totals.totalDeductions.toString())}</Text>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSave}
          >
            <Ionicons name="save-outline" size={20} color="#fff" />
            <Text style={styles.saveButtonText}>SIMPAN RINCIAN GAJI</Text>
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            Pastikan semua data yang diisi sudah benar sebelum menyimpan.
          </Text>
          
          <View style={{ height: 50 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
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
  saveBtn: {
    padding: 8,
  },
  scrollContent: {
    padding: 20,
  },
  summaryCard: {
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  summaryLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  summaryValue: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  summaryItem: {
    flex: 1,
  },
  summaryItemLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 4,
  },
  summaryItemValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginLeft: 4,
  },
  sectionTitleText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#E31E24',
    letterSpacing: 1,
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.03)',
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    paddingRight: 12,
  },
  input: {
    width: 140,
    padding: 10,
    borderRadius: 12,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'right',
    borderWidth: 1,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
  deductionTotal: {
    borderTopColor: 'rgba(239, 68, 68, 0.2)',
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#10B981',
  },
  totalValueRed: {
    fontSize: 16,
    fontWeight: '900',
    color: '#EF4444',
  },
  saveButton: {
    backgroundColor: '#E31E24',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    gap: 12,
    marginTop: 10,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  disclaimerText: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});