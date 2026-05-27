import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';

export default function TimesheetScreen() {
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  
  const [projectName, setProjectName] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!projectName || !taskDesc || !duration) {
      Alert.alert('Form Tidak Lengkap', 'Harap isi semua kolom pekerjaan.');
      return;
    }
    
    // Parse duration to float
    const durationHours = parseFloat(duration.replace(',', '.'));
    if (isNaN(durationHours) || durationHours <= 0) {
      Alert.alert('Format Salah', 'Durasi kerja harus berupa angka (misal: 4 atau 4.5)');
      return;
    }

    Alert.alert(
      'Simpan Laporan?',
      'Apakah laporan aktivitas kerja harian Anda sudah benar?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Simpan', 
          onPress: async () => {
            setLoading(true);
            try {
              const { error } = await supabase.from('timesheets').insert([{
                employee_id: userData?.id,
                project_name: projectName,
                task_description: taskDesc,
                duration_hours: durationHours
              }]);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Berhasil', 'Laporan Timesheet harian berhasil disimpan.');
              router.back();
            } catch (e: any) {
              console.error(e);
              Alert.alert('Gagal', e.message || 'Terjadi kesalahan saat menyimpan data.');
            } finally {
              setLoading(false);
            }
          } 
        }
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Logbook Harian</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          <View style={styles.infoBox}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={24} color="#F97316" />
            </View>
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoTitle}>Timesheet / Logbook</Text>
              <Text style={styles.infoDesc}>Catat aktivitas pekerjaan yang Anda lakukan hari ini beserta durasi pengerjaannya.</Text>
            </View>
          </View>

          <View style={[styles.formCard, { backgroundColor: colors.card }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Nama Proyek / Modul</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC', color: colors.text, borderColor: isDark ? '#2C2C2E' : '#F1F5F9' }]}
                placeholder="Contoh: Aplikasi WKN Mobile"
                placeholderTextColor="#94A3B8"
                value={projectName}
                onChangeText={setProjectName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Deskripsi Tugas (Task)</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC', color: colors.text, borderColor: isDark ? '#2C2C2E' : '#F1F5F9' }]}
                placeholder="Deskripsikan pekerjaan yang Anda lakukan hari ini..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={taskDesc}
                onChangeText={setTaskDesc}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>Durasi Pengerjaan (Jam)</Text>
              <View style={[styles.inputContainer, { backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC', borderColor: isDark ? '#2C2C2E' : '#F1F5F9' }]}>
                <TextInput
                  style={[styles.amountInput, { color: colors.text }]}
                  placeholder="Misal: 4.5"
                  placeholderTextColor="#94A3B8"
                  keyboardType="decimal-pad"
                  value={duration}
                  onChangeText={setDuration}
                />
                <Text style={styles.currency}>Jam</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <TouchableOpacity 
          style={[styles.submitBtn, (!projectName || !taskDesc || !duration || loading) && styles.submitBtnDisabled]} 
          onPress={handleSubmit}
          disabled={!projectName || !taskDesc || !duration || loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>Simpan Timesheet</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 4 },
  content: { flex: 1, padding: 16 },
  infoBox: { flexDirection: 'row', backgroundColor: '#FFF7ED', padding: 16, borderRadius: 16, marginBottom: 20 },
  infoIcon: { width: 40, height: 40, backgroundColor: '#FFEDD5', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  infoTextContainer: { flex: 1 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#9A3412', marginBottom: 4 },
  infoDesc: { fontSize: 12, color: '#C2410C', lineHeight: 18 },
  formCard: { padding: 20, borderRadius: 20 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  input: { height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, fontSize: 14, fontWeight: '600' },
  textArea: { height: 100, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingTop: 16, fontSize: 14, fontWeight: '500' },
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 50, borderWidth: 1, borderRadius: 14, paddingHorizontal: 16 },
  amountInput: { flex: 1, fontSize: 14, fontWeight: '600' },
  currency: { fontSize: 14, fontWeight: '700', color: '#64748B' },
  bottomBar: { padding: 16, paddingBottom: Platform.OS === 'ios' ? 0 : 16, borderTopWidth: 1 },
  submitBtn: { backgroundColor: '#F97316', height: 54, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#FDBA74', opacity: 0.7 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
