import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Dimensions, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../context/ThemeContext';

const { width } = Dimensions.get('window');

export default function LeaveScreen() {
  const { colors, isDark } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [leaveType, setLeaveType] = useState('Annual');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [computedDays, setComputedDays] = useState(0);

  useEffect(() => {
    initScreen();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      calculateDaysCount();
    } else {
      setComputedDays(0);
    }
  }, [startDate, endDate]);

  const initScreen = async () => {
    setLoading(true);
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (sessionStr) {
        const user = JSON.parse(sessionStr);
        setUserData(user);
        await fetchLeaveRequests(user.id);
      } else {
        router.replace('/login');
      }
    } catch (e) {
      console.log('Error initializing screen:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveRequests = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('leave_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('applied_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (e: any) {
      console.log('Error fetching leave requests:', e.message);
    }
  };

  const calculateDaysCount = () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      setComputedDays(0);
      return;
    }

    const [y1, m1, d1] = startDate.split('-').map(Number);
    const [y2, m2, d2] = endDate.split('-').map(Number);
    const start = new Date(y1, m1 - 1, d1);
    const end = new Date(y2, m2 - 1, d2);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      setComputedDays(0);
      return;
    }

    let count = 0;
    let cur = new Date(start);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
        count++;
      }
      cur.setDate(cur.getDate() + 1);
    }
    setComputedDays(count);
  };

  const handleCreateRequest = async () => {
    if (!startDate || !endDate || !reason) {
      Alert.alert('Form Belum Lengkap', 'Silakan isi seluruh kolom input pengajuan.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      Alert.alert('Format Tanggal Salah', 'Gunakan format YYYY-MM-DD (contoh: 2026-05-24)');
      return;
    }

    const [y1, m1, d1] = startDate.split('-').map(Number);
    const [y2, m2, d2] = endDate.split('-').map(Number);
    const start = new Date(y1, m1 - 1, d1);
    const end = new Date(y2, m2 - 1, d2);

    if (start > end) {
      Alert.alert('Tanggal Salah', 'Tanggal mulai harus lebih awal atau sama dengan tanggal selesai.');
      return;
    }

    if (computedDays === 0) {
      Alert.alert('Pengajuan Ditolak', 'Pengajuan cuti/izin tidak dapat diajukan hanya untuk hari libur (Sabtu & Minggu).');
      return;
    }

    setSubmitLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const record = {
        employee_id: userData.id,
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days_count: computedDays,
        reason: reason.trim(),
        status: 'Pending',
        applied_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('leave_requests')
        .insert([record]);

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Berhasil', 'Pengajuan izin/cuti Anda telah dikirim dan menunggu persetujuan.');
      
      // Reset Form
      setStartDate('');
      setEndDate('');
      setReason('');
      setLeaveType('Annual');
      setShowForm(false);

      // Refresh list
      await fetchLeaveRequests(userData.id);
    } catch (e: any) {
      Alert.alert('Gagal Mengajukan', e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return '#10B981';
      case 'Rejected': return '#EF4444';
      default: return '#F59E0B';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'Approved': return 'DISETUJUI';
      case 'Rejected': return 'DITOLAK';
      default: return 'MENUNGGU';
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'Annual': return 'Cuti Tahunan';
      case 'Sick': return 'Sakit';
      case 'Emergency': return 'Izin Darurat';
      case 'Unpaid': return 'Izin Tanpa Upah';
      default: return type;
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'Annual': return '#E31E24';
      case 'Sick': return '#3B82F6';
      case 'Emergency': return '#EF4444';
      default: return '#8E8E93';
    }
  };

  const setFormDefaults = () => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    setLeaveType('Annual');
    setReason('');
    setShowForm(true);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Izin & Cuti</Text>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            if (showForm) {
              setShowForm(false);
            } else {
              setFormDefaults();
            }
          }}
        >
          <Ionicons 
            name={showForm ? "list-outline" : "add-circle-outline"} 
            size={24} 
            color="#E31E24" 
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#E31E24" />
          <Text style={{ color: colors.subText, marginTop: 10 }}>Sinkronisasi data izin & cuti...</Text>
        </View>
      ) : showForm ? (
        /* Leave Application Form */
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Formulir Izin & Cuti Baru</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>JENIS ABSEN / CUTI</Text>
              <View style={styles.typeSelectorRow}>
                {[
                  { key: 'Annual', label: 'Cuti' },
                  { key: 'Sick', label: 'Sakit' },
                  { key: 'Emergency', label: 'Darurat' },
                  { key: 'Unpaid', label: 'Izin' }
                ].map((type) => (
                  <TouchableOpacity
                    key={type.key}
                    style={[
                      styles.typeBadge,
                      { borderColor: isDark ? '#2C2C2E' : '#E2E8F0' },
                      leaveType === type.key && { backgroundColor: '#E31E24', borderColor: '#E31E24' }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setLeaveType(type.key);
                    }}
                  >
                    <Text 
                      style={[
                        styles.typeBadgeText, 
                        { color: colors.text },
                        leaveType === type.key && { color: '#fff', fontWeight: '800' }
                      ]}
                    >
                      {type.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.dateRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>TANGGAL MULAI</Text>
                <TextInput 
                  style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>TANGGAL SELESAI</Text>
                <TextInput 
                  style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            {computedDays > 0 && (
              <View style={styles.durationCard}>
                <Ionicons name="calendar-outline" size={16} color="#E31E24" />
                <Text style={styles.durationText}>
                  Durasi Pengajuan: <Text style={{ fontWeight: '900', color: '#E31E24' }}>{computedDays} Hari Kerja</Text> (Sabtu & Minggu tidak dihitung)
                </Text>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>ALASAN / DETAIL PENGAJUAN</Text>
              <TextInput 
                style={[styles.textArea, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                value={reason}
                onChangeText={setReason}
                placeholder="Tuliskan keterangan keperluan cuti, sakit, atau izin dengan lengkap..."
                placeholderTextColor="#94A3B8"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, { opacity: submitLoading ? 0.7 : 1 }]} 
              onPress={handleCreateRequest}
              disabled={submitLoading}
            >
              {submitLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="paper-plane-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                  <Text style={styles.submitBtnText}>KIRIM PENGAJUAN</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* Leave History List */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>RIWAYAT IZIN & CUTI</Text>
          
          {requests.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Ionicons name="calendar-outline" size={48} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: colors.subText }]}>Belum ada riwayat pengajuan cuti atau izin.</Text>
              <TouchableOpacity 
                style={styles.emptyAddBtn} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormDefaults();
                }}
              >
                <Text style={styles.emptyAddBtnText}>Ajukan Izin Baru</Text>
              </TouchableOpacity>
            </View>
          ) : (
            requests.map((item) => (
              <View key={item.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.cardDate, { color: colors.text }]}>
                        {getLeaveTypeLabel(item.leave_type)}
                      </Text>
                      <View style={[styles.typeIndicator, { backgroundColor: getLeaveTypeColor(item.leave_type) }]} />
                    </View>
                    <Text style={styles.cardTime}>
                      {new Date(item.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} - {new Date(item.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15', borderColor: getStatusColor(item.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
                  </View>
                </View>
                
                <View style={styles.cardDivider} />
                
                <View style={styles.cardBody}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={[styles.reasonLabel, { color: colors.subText }]}>Keperluan / Keterangan:</Text>
                    <Text style={{ fontSize: 10, fontWeight: '800', color: '#E31E24' }}>{item.days_count} Hari Kerja</Text>
                  </View>
                  <Text style={[styles.reasonValue, { color: colors.text }]}>{item.reason}</Text>
                </View>
              </View>
            ))
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  backBtn: {
    padding: 8,
  },
  actionBtn: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 16,
    paddingLeft: 4,
  },
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  emptyAddBtn: {
    backgroundColor: '#E31E24',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  typeBadge: {
    flex: 1,
    minWidth: 70,
    height: 38,
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  typeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    gap: 12,
  },
  durationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  durationText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
    flex: 1,
  },
  textArea: {
    height: 100,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#E31E24',
    height: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#E31E24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  historyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.01,
    shadowRadius: 8,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 13,
    fontWeight: '800',
  },
  typeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  cardTime: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  cardDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.03)',
    marginVertical: 12,
  },
  cardBody: {
    gap: 4,
  },
  reasonLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  reasonValue: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
  }
});
