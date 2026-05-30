import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are handled when the app is open
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const registerForPushNotificationsAsync = async () => {
  if (!Device.isDevice) {
    console.log('Must use physical device for Push Notifications');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token for push notification!');
    return null;
  }

  try {
    const projectId = 'cbd3d71d-a69c-4188-ba8f-a775202b26b5'; // dari app.json eas.projectId
    const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
    console.log('Expo Push Token:', token);
    
    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
    return token;
  } catch (e) {
    console.log('Error getting push token:', e);
    return null;
  }
};

export const scheduleSmartReminders = async () => {
  // Cancel existing scheduled notifications to avoid duplicates
  await Notifications.cancelAllScheduledNotificationsAsync();

  // 1. Morning Reminder (08:00 AM)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Selamat Pagi! ✨",
      body: "Jangan lupa untuk melakukan Absen Masuk di WKNsite. Semangat bekerja!",
      data: { url: '/(tabs)/index' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: 8,
      minute: 0,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });

  // 2. Evening Reminder (05:00 PM)
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Waktunya Pulang! 🏠",
      body: "Pastikan Anda sudah melakukan Absen Keluar sebelum meninggalkan lokasi kerja.",
      data: { url: '/(tabs)/index' },
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
      hour: 17,
      minute: 0,
      repeats: true,
    } as Notifications.CalendarTriggerInput,
  });

  console.log('Smart Reminders scheduled successfully');
};

export const sendInstantNotification = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: null, // Send immediately
  });
};
