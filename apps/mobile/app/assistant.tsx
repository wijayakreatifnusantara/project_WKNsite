import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

export default function AssistantScreen() {
  const { colors, isDark } = useTheme();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Halo! Saya WKN AI Assistant. Ada yang bisa saya bantu terkait HR, Cuti, atau aturan perusahaan?', isBot: true }
  ]);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const botResponses: { [key: string]: string } = {
    'cuti': 'Sisa cuti tahunan Anda saat ini adalah 12 hari. Anda dapat mengajukan cuti melalui menu "Izin & Cuti".',
    'reimburse': 'Untuk melakukan reimburse, siapkan foto struk/nota, masuk ke menu "Reimburse", dan isi form nominalnya.',
    'gaji': 'Slip gaji bulan ini sudah terbit! Anda bisa melihat rinciannya di menu "Slip Gaji" menggunakan PIN rahasia Anda.',
    'default': 'Maaf, saya masih belajar. Silakan hubungi tim HR atau buat tiket di menu Helpdesk untuk bantuan lebih lanjut.'
  };

  const handleSend = () => {
    if (!inputText.trim()) return;
    
    const userMsg = { id: Date.now().toString(), text: inputText, isBot: false };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    
    // Simulate AI thinking
    setTimeout(() => {
      const lower = userMsg.text.toLowerCase();
      let reply = botResponses.default;
      
      if (lower.includes('cuti') || lower.includes('libur')) reply = botResponses.cuti;
      else if (lower.includes('reimburse') || lower.includes('klaim')) reply = botResponses.reimburse;
      else if (lower.includes('gaji') || lower.includes('slip')) reply = botResponses.gaji;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), text: reply, isBot: true }]);
    }, 1000);
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-down" size={28} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Ionicons name="sparkles" size={18} color="#F97316" />
          <Text style={[styles.headerTitle, { color: colors.text }]}>WKN Assistant</Text>
        </View>
        <View style={{ width: 44 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView ref={scrollViewRef} contentContainerStyle={styles.chatArea}>
          {messages.map(msg => (
            <View key={msg.id} style={[styles.msgBubble, msg.isBot ? styles.msgBot : styles.msgUser, { backgroundColor: msg.isBot ? (isDark ? '#1F1F1F' : '#FFFFFF') : '#F97316' }]}>
              <Text style={[styles.msgText, { color: msg.isBot ? colors.text : '#FFFFFF' }]}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
          <TextInput
            style={[styles.input, { color: colors.text, backgroundColor: isDark ? '#1C1C1E' : '#F8FAFC' }]}
            placeholder="Tanya soal sisa cuti..."
            placeholderTextColor={colors.subText}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Ionicons name="send" size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1 },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 8 },
  chatArea: { padding: 16, gap: 12 },
  msgBubble: { padding: 16, borderRadius: 20, maxWidth: '80%', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 2 },
  msgBot: { alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  msgUser: { alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  msgText: { fontSize: 14, fontWeight: '500', lineHeight: 20 },
  inputContainer: { flexDirection: 'row', padding: 16, borderTopWidth: 1, gap: 12, alignItems: 'center' },
  input: { flex: 1, height: 48, borderRadius: 24, paddingHorizontal: 20, fontSize: 14, fontWeight: '500' },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F97316', alignItems: 'center', justifyContent: 'center', shadowColor: '#F97316', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }
});
