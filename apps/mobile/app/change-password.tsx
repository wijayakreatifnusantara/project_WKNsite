import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import CryptoJS from 'crypto-js';

export default function ChangePasswordScreen() {
  const { userData } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleUpdatePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Perhatian', 'Harap lengkapi semua kolom password.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Perhatian', 'Password baru dan konfirmasi tidak cocok.');
      return;
    }

    if (newPassword.length < 5) {
      Alert.alert('Perhatian', 'Password baru minimal 5 karakter.');
      return;
    }

    setLoading(true);

    try {
      // 1. Send update request to Backend API
      const hashedCurrent = CryptoJS.SHA256(currentPassword).toString();
      const hashedNew = CryptoJS.SHA256(newPassword).toString();

      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000/api';
      const token = await SecureStore.getItemAsync('authToken');
      
      const response = await fetch(`${apiUrl}/auth/employee/change-password`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          current_password: hashedCurrent, 
          new_password: hashedNew 
        }),
      });
      
      const result = await response.json();
      if (!response.ok || result.status === 'error') {
        throw new Error(result.message || 'Gagal mengubah password');
      }

      // Update saved credentials for biometrics
      const savedStr = await SecureStore.getItemAsync('savedCredentials');
      if (savedStr) {
        const saved = JSON.parse(savedStr);
        saved.password = hashedNew;
        await SecureStore.setItemAsync('savedCredentials', JSON.stringify(saved));
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        'Sukses', 
        'Password berhasil diubah. Harap ingat password baru Anda untuk login selanjutnya.',
        [{ text: 'Tutup', onPress: () => router.back() }]
      );
    } catch (err: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Gagal', err.message || 'Terjadi kesalahan saat mengubah password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ubah Kata Sandi</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={32} color="#F59E0B" />
          </View>
          <Text style={styles.description}>
            Gunakan kombinasi yang mudah Anda ingat namun sulit ditebak orang lain.
          </Text>

          <View style={styles.formCard}>
            {/* Current Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD SAAT INI</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#8E8E93" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Masukkan password saat ini"
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                />
                <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eyeBtn}>
                  <Ionicons name={showCurrent ? "eye-off-outline" : "eye-outline"} size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.divider} />

            {/* New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>PASSWORD BARU</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key" size={20} color="#F97316" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Buat password baru"
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeBtn}>
                  <Ionicons name={showNew ? "eye-off-outline" : "eye-outline"} size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm New Password */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>KONFIRMASI PASSWORD BARU</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#10B981" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Ketik ulang password baru"
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
                <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)} style={styles.eyeBtn}>
                  <Ionicons name={showConfirm ? "eye-off-outline" : "eye-outline"} size={20} color="#8E8E93" />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.saveBtn} onPress={handleUpdatePassword} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>SIMPAN PASSWORD</Text>}
          </TouchableOpacity>
        </View>
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
  iconCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', alignSelf: 'center', marginTop: 10, marginBottom: 15 },
  description: { textAlign: 'center', fontSize: 13, color: '#8E8E93', paddingHorizontal: 20, marginBottom: 30, lineHeight: 20 },
  formCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 3, marginBottom: 30 },
  divider: { height: 1, backgroundColor: '#F2F2F7', marginVertical: 20 },
  inputGroup: { gap: 8, marginBottom: 15 },
  label: { fontSize: 10, fontWeight: '800', color: '#8E8E93', letterSpacing: 1, marginLeft: 4 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FB', borderRadius: 12, height: 50, paddingHorizontal: 15, borderWidth: 1, borderColor: '#E5E7EB' },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 14, color: '#1C1C1E', fontWeight: '600' },
  eyeBtn: { padding: 8, marginRight: -8 },
  saveBtn: { backgroundColor: '#F97316', height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  saveBtnText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 1 }
});
