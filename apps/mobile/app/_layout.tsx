import { Stack, SplashScreen } from 'expo-router';
import { useEffect } from 'react';
import { UIManager, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext';
import { AuthProvider } from '../context/AuthContext';
import * as NotificationService from '../lib/NotificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RootLayout() {
  useEffect(() => {
    // Initialize Smart Notifications
    NotificationService.registerForPushNotificationsAsync();
    NotificationService.scheduleSmartReminders();

    // Fix: Hide splash screen after initialization to prevent app from hanging
    setTimeout(() => {
      SplashScreen.hideAsync();
    }, 1000);
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <CustomThemeProvider>
          <Stack
            screenOptions={{
              gestureEnabled: true,
              animation: 'fade',
            }}
          >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="overtime" options={{ headerShown: false }} />
            <Stack.Screen name="leave" options={{ headerShown: false }} />
            <Stack.Screen name="signature" options={{ headerShown: false }} />
            <Stack.Screen name="payslip" options={{ headerShown: false }} />
            <Stack.Screen name="salary-details" options={{ title: 'Rincian Gaji' }} />
            <Stack.Screen name="reimburse" options={{ headerShown: false }} />
            <Stack.Screen name="helpdesk" options={{ headerShown: false }} />
            <Stack.Screen name="directory" options={{ headerShown: false }} />
            <Stack.Screen name="documents" options={{ headerShown: false }} />
            <Stack.Screen name="personal-data-auth" options={{ headerShown: false }} />
            <Stack.Screen name="personal-data" options={{ headerShown: false }} />
            <Stack.Screen name="change-password" options={{ headerShown: false }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
          <StatusBar style="auto" />
        </CustomThemeProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
