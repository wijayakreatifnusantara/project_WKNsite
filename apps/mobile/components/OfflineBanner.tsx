import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

export default function OfflineBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [showBanner, setShowBanner] = useState(false);
  const [justReconnected, setJustReconnected] = useState(false);
  const slideAnim = useRef(new Animated.Value(-100)).current;
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      const connected = state.isConnected && state.isInternetReachable !== false;
      
      if (isConnected && !connected) {
        // Went offline
        setIsConnected(false);
        setShowBanner(true);
        setJustReconnected(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          friction: 8,
        }).start();
        
      } else if (!isConnected && connected) {
        // Went back online
        setIsConnected(true);
        setJustReconnected(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Hide after showing success for 3 seconds
        setTimeout(() => {
          Animated.timing(slideAnim, {
            toValue: -100,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setShowBanner(false);
            setJustReconnected(false);
          });
        }, 3000);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [isConnected]);

  if (!showBanner) return null;

  return (
    <Animated.View 
      style={[
        styles.banner, 
        { 
          transform: [{ translateY: slideAnim }],
          paddingTop: Math.max(insets.top, 40) + 10,
          backgroundColor: justReconnected ? '#10B981' : '#EF4444' 
        }
      ]}
    >
      <Ionicons 
        name={justReconnected ? "wifi" : "wifi-outline"} 
        size={18} 
        color="#fff" 
      />
      <Text style={styles.bannerText}>
        {justReconnected 
          ? "Koneksi Kembali, Sinkronisasi Data..." 
          : "Koneksi Terputus - Mode Offline Aktif"}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10,
    zIndex: 9999, // Make sure it's on top of everything
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  bannerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 8,
    letterSpacing: 0.3,
  }
});
