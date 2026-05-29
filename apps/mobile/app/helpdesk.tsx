import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, StatusBar, KeyboardAvoidingView, Platform, Alert, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function HelpdeskScreen() {
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  
  const [refreshing, setRefreshing] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('IT_SUPPORT');
  
  const categories = [
    { id: 'IT_SUPPORT', label: 'IT Support' },
    { id: 'HR', label: 'HR & Kepegawaian' },
    { id: 'GA', label: 'General Affairs' },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleSubmit = () => {
    if (!subject || !description) {
      Alert.alert('Form Tidak Lengkap', 'Harap isi subjek dan detail keluhan Anda.');
      return;
    }
    
    Alert.alert(
      'Kirim Tiket?',
      'Tiket ini akan diteruskan ke tim terkait.',
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Kirim', 
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            Alert.alert('Berhasil', 'Tiket bantuan Anda telah dibuat. Tim kami akan segera menindaklanjutinya.');
            router.back();
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pusat Bantuan (Helpdesk)</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} tintColor="#F97316" />
          }
        >
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <Text style={[styles.formTitle, { color: colors.text }]}>Buat Tiket Baru</Text>
            <Text style={{ fontSize: 11, color: colors.subText, marginBottom: 20 }}>Sampaikan kendala IT, masalah perangkat, atau pertanyaan HRD Anda di sini.</Text>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>KATEGORI</Text>
              <View style={styles.categoryRow}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryBtn, 
                      { borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' },
                      category === cat.id && styles.categoryBtnActive
                    ]}
                    onPress={() => setCategory(cat.id)}
                  >
                    <Text style={[
                      styles.categoryBtnText, 
                      { color: colors.text },
                      category === cat.id && styles.categoryBtnTextActive
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>SUBJEK KENDALA</Text>
              <TextInput 
                style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                value={subject}
                onChangeText={setSubject}
                placeholder="Contoh: Laptop rusak / Aplikasi Error"
                placeholderTextColor="#94A3B8"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.subText }]}>DETAIL KENDALA</Text>
              <TextInput 
                style={[styles.textArea, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Jelaskan secara rinci..."
                placeholderTextColor="#94A3B8"
                multiline={true}
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity 
              style={styles.submitBtn} 
              onPress={handleSubmit}
            >
              <Ionicons name="headset-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
              <Text style={styles.submitBtnText}>KIRIM TIKET</Text>
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
  inputLabel: { fontSize: 9, fontWeight: '800', letterSpacing: 0.5, marginBottom: 8 },
  textInput: {
    minHeight: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, fontSize: 14, fontWeight: '600',
  },
  textArea: {
    height: 100, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontWeight: '600',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  categoryBtnActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  categoryBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  categoryBtnTextActive: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#F97316', minHeight: 48, borderRadius: 12, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', marginTop: 10,
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 10, elevation: 4,
  },
  submitBtnText: { color: '#fff', fontSize: 13, fontWeight: '900', letterSpacing: 1 },
});
