import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, Image, ActivityIndicator, Linking, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { supabase } from '../lib/supabaseClient';
import { useTheme } from '../context/ThemeContext';

export default function DirectoryScreen() {
  const { colors, isDark } = useTheme();
  const [search, setSearch] = useState('');
  const [employees, setEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, job_position, department_id, email, phone, departments(name)')
        .order('name', { ascending: true });

      if (error) throw error;
      setEmployees(data || []);
    } catch (e) {
      console.log('Error fetching directory:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(search.toLowerCase()) ||
    emp.job_position?.toLowerCase().includes(search.toLowerCase()) ||
    emp.departments?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    Linking.openURL(`whatsapp://send?phone=${cleanPhone}`);
  };

  const handleCall = (phone: string) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View style={[styles.employeeCard, { backgroundColor: colors.card }]}>
      <View style={styles.cardMain}>
        <View style={[styles.avatarCircle, { backgroundColor: isDark ? '#1F1F1F' : '#F1F5F9' }]}>
          <Text style={[styles.avatarText, { color: '#F97316' }]}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.infoContainer}>
          <Text style={[styles.empName, { color: colors.text }]}>{item.name}</Text>
          <Text style={styles.empPosition}>{item.job_position || 'Staff'}</Text>
          <View style={styles.deptRow}>
            <Ionicons name="business-outline" size={12} color="#8E8E93" />
            <Text style={styles.empDept}>{item.departments?.name || 'Wijaya KN'}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.actionRow}>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: isDark ? '#1F1F1F' : '#F0FDF4' }]} 
          onPress={() => handleWhatsApp(item.phone)}
        >
          <Ionicons name="logo-whatsapp" size={18} color="#10B981" />
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionBtn, { backgroundColor: isDark ? '#1F1F1F' : '#EFF6FF' }]} 
          onPress={() => handleCall(item.phone)}
        >
          <Ionicons name="call-outline" size={18} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity 
          style={styles.backBtn} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Direktori Karyawan</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={[styles.searchWrapper, { backgroundColor: colors.card }]}>
          <Ionicons name="search" size={20} color="#94A3B8" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Cari nama, jabatan, atau divisi..."
            placeholderTextColor="#94A3B8"
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading && !refreshing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList
          data={filteredEmployees}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={() => {
            setRefreshing(true);
            fetchEmployees();
          }}
          refreshing={refreshing}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={60} color="#CBD5E1" />
              <Text style={styles.emptyText}>Tidak ada karyawan ditemukan</Text>
            </View>
          }
        />
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
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  backBtn: {
    padding: 8,
  },
  searchContainer: {
    padding: 20,
    paddingTop: 10,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 54,
    borderRadius: 18,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 10,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    padding: 20,
    paddingTop: 0,
    paddingBottom: 100,
  },
  employeeCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 22,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '900',
  },
  infoContainer: {
    flex: 1,
  },
  empName: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 2,
  },
  empPosition: {
    fontSize: 12,
    color: '#F97316',
    fontWeight: '700',
    marginBottom: 4,
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  empDept: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 15,
    color: '#94A3B8',
    fontWeight: '600',
    fontSize: 14,
  }
});
