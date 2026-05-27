import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, RefreshControl, ActivityIndicator, LayoutAnimation } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export default function InboxScreen() {
  const { colors, isDark } = useTheme();
  const { userData } = useAuth();
  
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (userData?.id) {
      fetchNotifications();
      setupRealtime();
    }
  }, [userData]);

  const setupRealtime = () => {
    supabase
      .channel('public:notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `employee_id=eq.${userData?.id}` }, (payload) => {
        fetchNotifications();
      })
      .subscribe();
  };

  const fetchNotifications = async () => {
    if (!userData?.id) return;
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('employee_id', userData.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (e) {
      console.log('Error fetching notifications', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchNotifications();
  };

  const markAsRead = async (id: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      // Optimistic UI Update
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);
    } catch (e) {
      console.log('Failed to mark read', e);
    }
  };

  const markAllAsRead = async () => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('employee_id', userData?.id)
        .eq('is_read', false);
    } catch (e) {}
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const getIcon = (type: string) => {
    switch(type) {
      case 'alert': return { name: 'warning', color: '#EF4444', bg: '#FEE2E2' };
      case 'payroll': return { name: 'cash', color: '#10B981', bg: '#D1FAE5' };
      case 'hr': return { name: 'people', color: '#3B82F6', bg: '#DBEAFE' };
      case 'system': return { name: 'server', color: '#F97316', bg: '#FFEDD5' };
      default: return { name: 'information-circle', color: '#8B5CF6', bg: '#EDE9FE' };
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Kotak Masuk</Text>
        <TouchableOpacity style={styles.backBtn} onPress={markAllAsRead}>
          <Ionicons name="checkmark-done-circle-outline" size={24} color="#F97316" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <ScrollView 
          contentContainerStyle={styles.listContainer}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
        >
          {notifications.length === 0 ? (
            <View style={{ alignItems: 'center', marginTop: 50 }}>
              <Ionicons name="mail-open-outline" size={60} color={colors.border} />
              <Text style={{ color: colors.subText, marginTop: 10 }}>Kotak masuk Anda kosong.</Text>
            </View>
          ) : null}

          {notifications.map(notif => {
            const iconConf = getIcon(notif.type);
            return (
              <TouchableOpacity 
                key={notif.id} 
                onPress={() => markAsRead(notif.id)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: isDark ? '#2C2C2E' : '#F2F2F7', opacity: notif.is_read ? 0.7 : 1 }]}
              >
                {!notif.is_read && <View style={styles.unreadDot} />}
                <View style={[styles.iconCircle, { backgroundColor: isDark ? '#1F1F1F' : iconConf.bg }]}>
                  <Ionicons name={iconConf.name as any} size={20} color={iconConf.color} />
                </View>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, { color: colors.text, fontWeight: notif.is_read ? '500' : '800' }]}>{notif.title}</Text>
                    <Text style={[styles.cardTime, { color: colors.subText }]}>{formatTime(notif.created_at)}</Text>
                  </View>
                  <Text style={[styles.cardDesc, { color: colors.text }]} numberOfLines={3}>{notif.body}</Text>
                </View>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800' },
  backBtn: { padding: 4 },
  listContainer: { padding: 16, gap: 12 },
  card: { flexDirection: 'row', padding: 16, borderRadius: 16, borderWidth: 1, position: 'relative' },
  unreadDot: { position: 'absolute', top: 16, left: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#F97316' },
  iconCircle: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  cardContent: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  cardTitle: { fontSize: 14 },
  cardTime: { fontSize: 10, fontWeight: '600' },
  cardDesc: { fontSize: 12, lineHeight: 18 }
});
