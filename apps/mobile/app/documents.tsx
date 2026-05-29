import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  Dimensions, 
  ActivityIndicator,
  StatusBar,
  Linking,
  KeyboardAvoidingView,
  Platform,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import * as DocumentPicker from 'expo-document-picker';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../lib/apiClient';
import { useTheme } from '../context/ThemeContext';
import Toast from 'react-native-toast-message';
import EmptyState from '../components/EmptyState';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { key: 'CV', label: 'Curriculum Vitae' },
  { key: 'KTP', label: 'KTP' },
  { key: 'Kartu Keluarga', label: 'Kartu Keluarga' },
  { key: 'SIM A', label: 'SIM A' },
  { key: 'SIM C', label: 'SIM C' },
  { key: 'Passport', label: 'Passport' },
  { key: 'Perjanjian Kerja', label: 'Perjanjian Kerja' },
  { key: 'Sertifikasi', label: 'Sertifikasi' },
  { key: 'Lainnya', label: 'Lainnya' }
];

export default function DocumentsScreen() {
  const { colors, isDark } = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua');
  const [showForm, setShowForm] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Form Fields
  const [docName, setDocName] = useState('');
  const [docCategory, setDocCategory] = useState('CV');
  const [description, setDescription] = useState('');
  const [pickedFile, setPickedFile] = useState<any>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      if (!user?.id) return;
      setLoading(true);

      const res = await apiClient.get('/documents/my-documents');
      if (res.status === 'success') {
        setDocuments(res.data || []);
      }
    } catch (e) {
      console.log('Error fetching documents:', e);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDocuments();
    setRefreshing(false);
  };

  const handlePickDocument = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setPickedFile(file);
        // Autofill name if empty
        if (!docName) {
          setDocName(file.name.split('.').slice(0, -1).join('.'));
        }
      }
    } catch (err) {
      console.log('Document picker error:', err);
    }
  };

  const handleUploadDocument = async () => {
    if (!docName.trim() || !pickedFile) {
      Alert.alert('Form Belum Lengkap', 'Silakan isi nama dokumen dan pilih berkas terlebih dahulu.');
      return;
    }

    setSubmitLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: pickedFile.uri,
        name: pickedFile.name,
        type: pickedFile.mimeType || 'application/octet-stream'
      } as any);
      formData.append('document_name', docName);
      formData.append('category', docCategory);
      formData.append('description', description);
      
      const token = await SecureStore.getItemAsync('authToken');
      const uploadUrl = `${process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.100:8000/api'}/documents/upload-mobile`;
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const resData = await response.json();
      if (!response.ok) throw new Error(resData.detail || 'Gagal mengunggah dokumen');

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Toast.show({ type: 'success', text1: 'Berhasil', text2: 'Dokumen berhasil diunggah.' });
      
      // Reset Form
      setDocName('');
      setDocCategory('CV');
      setDescription('');
      setPickedFile(null);
      setShowForm(false);

      // Refresh list
      await fetchDocuments();
    } catch (e: any) {
      Alert.alert('Gagal Mengunggah', e.message || 'Terjadi kesalahan sistem.');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteDocument = async (doc: any) => {
    Alert.alert(
      'Hapus Dokumen',
      `Apakah Anda yakin ingin menghapus dokumen "${doc.name}"?`,
      [
        { text: 'Batal', style: 'cancel' },
        { 
          text: 'Hapus', 
          style: 'destructive',
          onPress: async () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            try {
              const res = await apiClient.delete(`/documents/${doc.id}`);
              if (res.status === 'success') {
                Toast.show({ type: 'success', text1: 'Berhasil', text2: 'Dokumen dihapus.' });
                fetchDocuments();
              } else {
                throw new Error(res.message);
              }
            } catch (e: any) {
              Alert.alert('Gagal', e.message || 'Gagal menghapus dokumen.');
            }
          }
        }
      ]
    );
  };

  const toastFeedback = (msg: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Sukses', msg);
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'CV': return '#4F46E5';
      case 'KTP': return '#0EA5E9';
      case 'Kartu Keluarga': return '#10B981';
      case 'SIM A': case 'SIM C': return '#F59E0B';
      case 'Passport': return '#8B5CF6';
      case 'Perjanjian Kerja': return '#EF4444';
      case 'Sertifikasi': return '#EC4899';
      default: return '#64748B';
    }
  };

  const filteredDocs = selectedCategoryFilter === 'Semua'
    ? documents
    : documents.filter(d => d.category === selectedCategoryFilter);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Dokumen Saya</Text>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setShowForm(!showForm);
          }}
        >
          <Ionicons 
            name={showForm ? "list-outline" : "cloud-upload-outline"} 
            size={24} 
            color="#F97316" 
          />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F97316" />
            <Text style={{ color: colors.subText, marginTop: 10 }}>Sinkronisasi berkas dokumen...</Text>
          </View>
        ) : showForm ? (
          /* Document Upload Form */
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Text style={[styles.formTitle, { color: colors.text }]}>Unggah Dokumen Baru</Text>
              
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>KATEGORI DOKUMEN</Text>
                <View style={styles.categoryRow}>
                  {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                      key={cat.key}
                      style={[
                        styles.categoryBadge,
                        { borderColor: isDark ? '#2C2C2E' : '#E2E8F0' },
                        docCategory === cat.key && { backgroundColor: '#F97316', borderColor: '#F97316' }
                      ]}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setDocCategory(cat.key);
                      }}
                    >
                      <Text 
                        style={[
                          styles.categoryBadgeText, 
                          { color: colors.text },
                          docCategory === cat.key && { color: '#fff', fontWeight: '800' }
                        ]}
                      >
                        {cat.key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>NAMA DOKUMEN</Text>
                <TextInput 
                  style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                  value={docName}
                  onChangeText={setDocName}
                  placeholder="Contoh: KTP_Adianto"
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>KETERANGAN (OPSIONAL)</Text>
                <TextInput 
                  style={[styles.textInput, { color: colors.text, borderColor: isDark ? '#2C2C2E' : '#E2E8F0', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Tambahkan catatan singkat dokumen..."
                  placeholderTextColor="#94A3B8"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.subText }]}>BERKAS DOKUMEN</Text>
                <TouchableOpacity 
                  style={[styles.filePickerBtn, { borderColor: isDark ? '#2C2C2E' : '#CBD5E1', backgroundColor: isDark ? '#1F1F1F' : '#F8FAFC' }]}
                  onPress={handlePickDocument}
                >
                  <Ionicons name="document-attach-outline" size={24} color="#F97316" />
                  <Text style={[styles.filePickerBtnText, { color: colors.text }]}>
                    {pickedFile ? pickedFile.name : 'Pilih Berkas (PDF, JPG, PNG)'}
                  </Text>
                  {pickedFile && (
                    <Text style={styles.fileSizeLabel}>{formatBytes(pickedFile.size)}</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, { opacity: submitLoading ? 0.7 : 1 }]} 
                onPress={handleUploadDocument}
                disabled={submitLoading}
              >
                {submitLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Ionicons name="cloud-upload-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.submitBtnText}>UNGGAH SEKARANG</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        ) : (
          /* Document History List */
          <View style={{ flex: 1 }}>
            {/* Horizontal Filter Bar */}
            <View style={{ backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}
              >
                {['Semua', ...CATEGORIES.map(c => c.key)].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.filterBadge,
                      selectedCategoryFilter === cat && { backgroundColor: '#F97316' }
                    ]}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSelectedCategoryFilter(cat);
                    }}
                  >
                    <Text 
                      style={[
                        styles.filterBadgeText,
                        { color: selectedCategoryFilter === cat ? '#fff' : colors.subText }
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#F97316']} tintColor="#F97316" />
              }
            >
              {filteredDocs.length === 0 ? (
                <EmptyState 
                  title="Belum Ada Dokumen" 
                  message="Anda belum memiliki dokumen yang diunggah. Klik ikon unggah di sudut kanan atas untuk menambahkan berkas." 
                />
              ) : (
                filteredDocs.map((item) => (
                  <View key={item.id} style={[styles.docCard, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                    <View style={styles.cardHeader}>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={[styles.docTitle, { color: colors.text }]}>{item.name}</Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
                          <View style={[styles.tagCategory, { backgroundColor: getCategoryColor(item.category) + '15' }]}>
                            <Text style={[styles.tagCategoryText, { color: getCategoryColor(item.category) }]}>
                              {item.category}
                            </Text>
                          </View>
                          <Text style={styles.docSize}>{formatBytes(item.file_size)}</Text>
                        </View>
                      </View>
                      <View style={styles.headerActions}>
                        <TouchableOpacity 
                          style={styles.circleBtn} 
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            Linking.openURL(item.file_url);
                          }}
                        >
                          <Ionicons name="eye-outline" size={16} color="#4F46E5" />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={[styles.circleBtn, { marginLeft: 8 }]} 
                          onPress={() => handleDeleteDocument(item)}
                        >
                          <Ionicons name="trash-outline" size={16} color="#EF4444" />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    {item.description ? (
                      <View style={{ marginTop: 10 }}>
                        <Text style={[styles.docDesc, { color: colors.subText }]}>{item.description}</Text>
                      </View>
                    ) : null}
                    
                    <View style={styles.cardFooter}>
                      <Text style={styles.docTime}>
                        Diunggah pada: {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </Text>
                    </View>
                  </View>
                ))
              )}
              <View style={{ height: 100 }} />
            </ScrollView>
          </View>
        )}
      </KeyboardAvoidingView>
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
  filterScroll: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  filterBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
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
  categoryRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  categoryBadge: {
    height: 34,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  textInput: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  filePickerBtn: {
    height: 52,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  filePickerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  fileSizeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
  },
  submitBtn: {
    backgroundColor: '#F97316',
    minHeight: 48,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  emptyContainer: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 20,
  },
  emptyAddBtn: {
    backgroundColor: '#F97316',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  },
  docCard: {
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
  docTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  tagCategory: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  tagCategoryText: {
    fontSize: 8,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  docSize: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  docDesc: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 15,
  },
  cardFooter: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: 8,
  },
  docTime: {
    fontSize: 8,
    color: '#8E8E93',
    fontWeight: '700',
    textTransform: 'uppercase',
  }
});
