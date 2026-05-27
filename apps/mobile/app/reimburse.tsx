import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../lib/supabaseClient';

export default function ReimburseScreen() {
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const handleTakeImage = async (useCamera: boolean) => {
    try {
      let result;
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Izin Ditolak', 'Akses kamera dibutuhkan.');
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.5,
          base64: true
        });
      } else {
        result = await ImagePicker.launchImageLibraryAsync({
          allowsEditing: true,
          quality: 0.5,
          base64: true
        });
      }

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFile({ 
          name: 'struk.jpg', 
          uri: asset.uri, 
          base64: asset.base64,
          type: 'image/jpeg' 
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
    } catch (e) {
      console.log('Error picking image', e);
    }
  };

  const handlePickOptions = () => {
    Alert.alert(
      'Lampirkan Bukti',
      'Pilih metode untuk melampirkan struk pembayaran',
      [
        { text: 'Kamera', onPress: () => handleTakeImage(true) },
        { text: 'Galeri Foto', onPress: () => handleTakeImage(false) },
        { text: 'Batal', style: 'cancel' }
      ]
    );
  };

  const handleSubmit = async () => {
    if (!amount || !description || !file) {
      Alert.alert('Form Tidak Lengkap', 'Harap isi nominal, keterangan, dan lampirkan bukti pembayaran.');
      return;
    }

    Alert.alert(
      'Kirim Pengajuan?',
      'Apakah Anda yakin data reimburse sudah benar?',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Kirim', 
          onPress: async () => {
            setLoading(true);
            try {
              const cleanAmount = amount.replace(/[^0-9]/g, '');
              const base64Image = `data:image/jpeg;base64,${file.base64}`;

              const { error } = await supabase.from('reimbursements').insert([{
                employee_id: userData?.id,
                title: description,
                category: 'Lainnya',
                amount: parseInt(cleanAmount),
                status: 'Pending',
                receipt_image: base64Image
              }]);

              if (error) throw error;

              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Berhasil', 'Pengajuan reimburse Anda telah berhasil dikirim.');
              router.back();
            } catch (e: any) {
              console.error(e);
              Alert.alert('Gagal', e.message || 'Terjadi kesalahan saat mengirim data.');
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pengajuan Reimburse</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Form Klaim Pengeluaran</Text>
            <Text style={{ fontSize: 11, color: colors.subText, marginBottom: 20 }}>Silakan isi data pengeluaran operasional atau medis Anda di bawah ini beserta bukti struk/nota yang sah.</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>NOMINAL (RP)</Text>
              <TextInput 
                style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                value={amount}
                onChangeText={setAmount}
                placeholder="Contoh: 150000"
                placeholderTextColor="#94A3B8"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>KETERANGAN PENGELUARAN</Text>
              <TextInput 
                style={[styles.textArea, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Misal: Biaya bensin dinas ke site A..."
                placeholderTextColor="#94A3B8"
                multiline={true}
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>LAMPIRAN BUKTI (FOTO/PDF)</Text>
              <TouchableOpacity 
                style={[styles.uploadBtn, { borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                onPress={handlePickOptions}
              >
                {file ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="document-text" size={24} color="#10b981" />
                    <View style={{ marginLeft: 10, flex: 1 }}>
                      <Text style={[styles.fileName, { color: colors.text }]} numberOfLines={1}>{file.name}</Text>
                      <Text style={{ fontSize: 10, color: colors.subText }}>Bukti Terlampir</Text>
                    </View>
                    <TouchableOpacity onPress={() => setFile(null)}>
                      <Ionicons name="close-circle" size={20} color="#e11d48" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: 10 }}>
                    <Ionicons name="camera-outline" size={28} color="#94A3B8" />
                    <Text style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, fontWeight: '600' }}>Tap untuk foto atau pilih dokumen struk</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSubmit}
            >
              <Ionicons name="paper-plane-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>KIRIM KLAIM</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 50, paddingBottom: 16, borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.5 },
  backBtn: { padding: 8 },
  scrollContent: { padding: 16 },
  formCard: {
    borderRadius: 20, borderWidth: 1, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.02, shadowRadius: 8, elevation: 2,
  },
  formTitle: { fontSize: 16, fontWeight: '800', marginBottom: 4, letterSpacing: -0.5 },
  inputGroup: { marginBottom: 16 },
  inputLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 6 },
  textInput: {
    height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 14, fontWeight: '600',
  },
  textArea: {
    height: 80, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '600',
  },
  uploadBtn: {
    borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 16, justifyContent: 'center',
  },
  fileName: { fontSize: 12, fontWeight: '700' },
  submitBtn: {
    backgroundColor: '#F97316', height: 48, borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
});
