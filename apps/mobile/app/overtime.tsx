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

export default function OvertimeScreen() {
  const { colors, isDark } = useTheme();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [requests, setRequests] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form Fields
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    initScreen();
  }, []);

  const initScreen = async () => {
    setLoading(true);
    try {
      const sessionStr = await AsyncStorage.getItem('userSession');
      if (sessionStr) {
        const user = JSON.parse(sessionStr);
        setUserData(user);
        await fetchOvertimeRequests(user.id);
      } else {
        router.replace('/login');
      }
    } catch (e) {
      console.log('Error initializing screen:', e);
    } finally {
      setLoading(false);
    }
  };

  const fetchOvertimeRequests = async (employeeId: string) => {
    try {
      const { data, error } = await supabase
        .from('overtime_requests')
        .select('*')
        .eq('employee_id', employeeId)
        .order('date', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (e: any) {
      console.log('Error fetching overtime:', e.message);
    }
  };

  const handleCreateRequest = async () => {
    if (!date || !startTime || !endTime || !reason) {
      Alert.alert('Form Belum Lengkap', 'Silakan isi seluruh kolom input pengajuan.');
      return;
    }

    // Basic format checks
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const timeRegex = /^\d{2}:\d{2}$/;

    if (!dateRegex.test(date)) {
      Alert.alert('Format Tanggal Salah', 'Gunakan format YYYY-MM-DD (contoh: 2026-05-24)');
      return;
    }
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      Alert.alert('Format Waktu Salah', 'Gunakan format HH:MM (contoh: 17:30)');
      return;
    }

    setSubmitLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Calculate duration hours
      const [sh, sm] = startTime.split(':').map(Number);
      const [eh, em] = endTime.split(':').map(Number);
      let sMinutes = sh * 60 + sm;
      let eMinutes = eh * 60 + em;

      // Handle overtime crossing midnight
      if (eMinutes < sMinutes) {
        eMinutes += 24 * 60;
      }
      const durationHours = (eMinutes - sMinutes) / 60;

      const record = {
        employee_id: userData.id,
        date: date,
        start_time: startTime,
        end_time: endTime,
        duration_hours: parseFloat(durationHours.toFixed(2)),
        reason: reason.trim(),
        status: 'Pending'
      };

      const { data, error } = await supabase
        .from('overtime_requests')
        .insert([record])
        .select();

      if (error) throw error;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert('✅ Berhasil', 'Pengajuan lembur Anda telah dikirim dan menunggu persetujuan.');
      
      // Reset Form
      setDate('');
      setStartTime('');
      setEndTime('');
      setReason('');
      setShowForm(false);

      // Refresh list
      await fetchOvertimeRequests(userData.id);
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

  // Set default values (today's date)
  const setFormDefaults = () => {
    const today = new Date().toISOString().split('T')[0];
    setDate(today);
    setStartTime('17:00');
    setEndTime('19:00');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pengajuan Lembur</Text>
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
          <Text style={{ color: colors.subText, marginTop: 10 }}>Sinkronisasi data lembur...</Text>
        </View>
      ) : showForm ? (
        /* Overtime Application Form */
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Formulir Lembur Baru</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>TANGGAL (YYYY-MM-DD)</Text>
              <TextInput 
                style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                value={date}
                onChangeText={setDate}
                placeholder="2026-05-24"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.timeRow}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>JAM MULAI (HH:MM)</Text>
                <TextInput 
                  style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                  value={startTime}
                  onChangeText={setStartTime}
                  placeholder="17:00"
                  placeholderTextColor="#94A3B8"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>JAM SELESAI (HH:MM)</Text>
                <TextInput 
                  style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                  value={endTime}
                  onChangeText={setEndTime}
                  placeholder="19:00"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>ALASAN / KEPERLUAN LEMBUR</Text>
              <TextInput 
                style={[styles.textArea, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                value={reason}
                onChangeText={setReason}
                placeholder="Sebutkan detail pekerjaan lembur yang dikerjakan..."
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
        /* Overtime History List */
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>RIWAYAT PENGAJUAN LEMBUR</Text>
          
          {requests.length === 0 ? (
            <View style={[styles.emptyContainer, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Ionicons name="time-outline" size={48} color="#94A3B8" />
              <Text style={[styles.emptyText, { color: colors.subText }]}>Belum ada riwayat pengajuan lembur.</Text>
              <TouchableOpacity 
                style={styles.emptyAddBtn} 
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFormDefaults();
                }}
              >
                <Text style={styles.emptyAddBtnText}>Ajukan Lembur Baru</Text>
              </TouchableOpacity>
            </View>
          ) : (
            requests.map((item) => (
              <View key={item.id} style={[styles.historyCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={[styles.cardDate, { color: colors.text }]}>{new Date(item.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</Text>
                    <Text style={styles.cardTime}>{item.start_time} - {item.end_time} ({item.duration_hours} Jam)</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15', borderColor: getStatusColor(item.status) }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
                  </View>
                </View>
                
                <View style={styles.cardDivider} />
                
                <View style={styles.cardBody}>
                  <Text style={[styles.reasonLabel, { color: colors.subText }]}>Alasan Kerja Lembur:</Text>
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
    marginBottom: 6,
  },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
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
