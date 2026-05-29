import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import Toast from 'react-native-toast-message';

export default function SalaryCorrectionScreen() {
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  const [period, setPeriod] = useState('April 2026');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      Alert.alert('Gagal', 'Mohon tuliskan rincian koreksi yang Anda ajukan.');
      return;
    }
    
    setSubmitting(true);
    
    try {
      const res = await apiClient.post('/submissions/salary-correction', {
        period: period,
        reason: message
      });

      if (res.status !== 'success') throw new Error(res.message);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', text1: 'Berhasil', text2: 'Pengajuan koreksi gaji terkirim.' });
      router.back();
    } catch (err: any) {
      Alert.alert('Gagal', 'Terjadi kesalahan saat mengirim pengajuan: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Koreksi Gaji</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} tintColor="#F97316" />
          }
        >
          <View style={styles.warningBox}>
            <Ionicons name="information-circle" size={24} color="#EF4444" />
            <Text style={styles.warningText}>
              Gunakan form ini hanya jika ada ketidaksesuaian nominal pada rincian gaji Anda bulan ini. Pengajuan palsu dapat dikenakan sanksi indisipliner.
            </Text>
          </View>

          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.label, { color: colors.text }]}>Periode Gaji</Text>
            <View style={[styles.inputDummy, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC' }]}>
              <Text style={[styles.inputDummyText, { color: colors.text }]}>{period}</Text>
            </View>

            <Text style={[styles.label, { color: colors.text, marginTop: 20 }]}>Rincian Kesalahan / Koreksi</Text>
            <TextInput
              style={[styles.textArea, { 
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F8FAFC',
                color: colors.text,
                borderColor: isDark ? 'rgba(255,255,255,0.1)' : '#E2E8F0'
              }]}
              multiline
              numberOfLines={6}
              placeholder="Contoh: Tunjangan lembur tanggal 15 belum dimasukkan..."
              placeholderTextColor={isDark ? 'rgba(255,255,255,0.3)' : '#94A3B8'}
              value={message}
              onChangeText={setMessage}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="send" size={20} color="#fff" />
                <Text style={styles.submitBtnText}>KIRIM PENGAJUAN</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 50, paddingBottom: 20 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 8 },
  content: { padding: 20 },
  warningBox: { flexDirection: 'row', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: 16, borderRadius: 16, marginBottom: 24, alignItems: 'center', gap: 12 },
  warningText: { flex: 1, color: '#EF4444', fontSize: 12, lineHeight: 18, fontWeight: '600' },
  card: { padding: 20, borderRadius: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  label: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  inputDummy: { padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'transparent' },
  inputDummyText: { fontSize: 14, fontWeight: '600' },
  textArea: { padding: 16, borderRadius: 12, borderWidth: 1, fontSize: 14, minHeight: 120 },
  submitBtn: { backgroundColor: '#EF4444', flexDirection: 'row', padding: 18, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10, shadowColor: '#EF4444', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 }
});
