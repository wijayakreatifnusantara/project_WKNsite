import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function PersonalDataScreen() {
  const { userData } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [employeeData, setEmployeeData] = useState<any>(null);
  
  // Bank Form State
  const [bankName, setBankName] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankOwner, setBankOwner] = useState('');
  const [isEditingBank, setIsEditingBank] = useState(false);

  useEffect(() => {
    fetchPersonalData();
  }, []);

  const fetchPersonalData = async () => {
    try {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', userData?.id)
        .single();

      if (error) throw error;
      
      setEmployeeData(data);
      setBankName(data.bank_name || '');
      setBankAccount(data.bank_account || '');
      setBankOwner(data.bank_account_holder || '');
    } catch (error) {
      console.log('Error fetching personal data:', error);
      Alert.alert('Error', 'Gagal mengambil data pribadi');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBank = async () => {
    if (!bankName || !bankAccount || !bankOwner) {
      Alert.alert('Perhatian', 'Harap isi semua kolom rekening bank.');
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase
        .from('employees')
        .update({
          bank_name: bankName,
          bank_account: bankAccount,
          bank_account_holder: bankOwner
        })
        .eq('id', userData?.id);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEditingBank(false);
      Alert.alert('Sukses', 'Data rekening bank berhasil diperbarui.');
      fetchPersonalData();
    } catch (error) {
      console.log('Error saving bank data:', error);
      Alert.alert('Gagal', 'Terjadi kesalahan saat menyimpan data rekening.');
    } finally {
      setSaving(false);
    }
  };

  const calculateMasaKerja = (joinDate: string) => {
    if (!joinDate) return 'Belum ada data';
    const start = new Date(joinDate);
    const now = new Date();
    
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years === 0) return `${months} Bulan`;
    if (months === 0) return `${years} Tahun`;
    return `${years} Tahun ${months} Bulan`;
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#F97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Data Pribadi & Rekening</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Section: Status & Masa Kerja */}
          <View style={styles.sectionHeader}>
            <Ionicons name="briefcase" size={16} color="#F97316" />
            <Text style={styles.sectionTitle}>STATUS KEPEGAWAIAN</Text>
          </View>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Status Karyawan</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{employeeData?.status || 'TIDAK DIKETAHUI'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Masa Kerja</Text>
              <Text style={styles.infoValue}>{calculateMasaKerja(employeeData?.join_date)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Tanggal Bergabung</Text>
              <Text style={styles.infoValue}>{employeeData?.join_date || '-'}</Text>
            </View>
          </View>

          {/* Section: Rekening Bank */}
          <View style={styles.sectionHeader}>
            <Ionicons name="card" size={16} color="#F97316" />
            <Text style={styles.sectionTitle}>REKENING GAJI</Text>
            {!isEditingBank && (
              <TouchableOpacity onPress={() => setIsEditingBank(true)} style={styles.editBtn}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.card}>
            {isEditingBank ? (
              <View style={styles.editForm}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NAMA BANK</Text>
                  <TextInput
                    style={styles.input}
                    value={bankName}
                    onChangeText={setBankName}
                    placeholder="Contoh: BCA, Mandiri, BNI"
                    autoCapitalize="characters"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NOMOR REKENING</Text>
                  <TextInput
                    style={styles.input}
                    value={bankAccount}
                    onChangeText={setBankAccount}
                    placeholder="Masukkan nomor rekening"
                    keyboardType="number-pad"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>NAMA PEMILIK REKENING</Text>
                  <TextInput
                    style={styles.input}
                    value={bankOwner}
                    onChangeText={setBankOwner}
                    placeholder="Sesuai buku tabungan"
                    autoCapitalize="characters"
                  />
                </View>
                
                <View style={styles.actionRow}>
                  <TouchableOpacity 
                    style={styles.cancelBtn} 
                    onPress={() => {
                      setIsEditingBank(false);
                      setBankName(employeeData?.bank_name || '');
                      setBankAccount(employeeData?.bank_account || '');
                      setBankOwner(employeeData?.bank_account_holder || '');
                    }}
                  >
                    <Text style={styles.cancelBtnText}>Batal</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.saveBtn} onPress={handleSaveBank} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>Simpan Perubahan</Text>}
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nama Bank</Text>
                  <Text style={styles.infoValue}>{employeeData?.bank_name || '-'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>No. Rekening</Text>
                  <Text style={styles.infoValue}>{employeeData?.bank_account || '-'}</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Nama Pemilik</Text>
                  <Text style={styles.infoValue}>{employeeData?.bank_account_holder || '-'}</Text>
                </View>
              </>
            )}
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1C1C1E' },
  content: { flex: 1, paddingHorizontal: 20 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginTop: 25, marginBottom: 10, paddingHorizontal: 5 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#8E8E93', letterSpacing: 1, marginLeft: 8, flex: 1 },
  editBtn: { backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  editBtnText: { color: '#F97316', fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  infoLabel: { fontSize: 13, color: '#8E8E93', fontWeight: '500' },
  infoValue: { fontSize: 14, color: '#1C1C1E', fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 12 },
  badge: { backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#D1FAE5' },
  badgeText: { color: '#10B981', fontSize: 11, fontWeight: '800' },
  editForm: { gap: 15 },
  inputGroup: { gap: 6 },
  inputLabel: { fontSize: 10, fontWeight: '800', color: '#8E8E93', letterSpacing: 0.5, marginLeft: 4 },
  input: { backgroundColor: '#F8F9FB', height: 48, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, fontWeight: '600', color: '#1C1C1E', borderWidth: 1, borderColor: '#E5E7EB' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 10 },
  cancelBtn: { flex: 1, height: 48, borderRadius: 12, backgroundColor: '#F2F2F7', justifyContent: 'center', alignItems: 'center' },
  cancelBtnText: { color: '#8E8E93', fontSize: 14, fontWeight: '700' },
  saveBtn: { flex: 2, height: 48, borderRadius: 12, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center', shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' }
});
