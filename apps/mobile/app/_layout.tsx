import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { ThemeProvider as CustomThemeProvider } from '../context/ThemeContext';
import * as NotificationService from '../lib/NotificationService';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  useEffect(() => {
    // Initialize Smart Notifications
    NotificationService.registerForPushNotificationsAsync();
    NotificationService.scheduleSmartReminders();
  }, []);

  return (
    <CustomThemeProvider>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="overtime" options={{ headerShown: false }} />
        <Stack.Screen name="leave" options={{ headerShown: false }} />
        <Stack.Screen name="signature" options={{ headerShown: false }} />
        <Stack.Screen name="payslip" options={{ headerShown: false }} />
        <Stack.Screen name="directory" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </CustomThemeProvider>
  );
}
