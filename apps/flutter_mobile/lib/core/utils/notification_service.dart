import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';

final FlutterLocalNotificationsPlugin flutterLocalNotificationsPlugin = FlutterLocalNotificationsPlugin();

@pragma('vm:entry-point')
void notificationTapBackground(NotificationResponse notificationResponse) async {
  debugPrint('notificationTapBackground: ${notificationResponse.actionId}');
  if (notificationResponse.actionId == 'approve' || notificationResponse.actionId == 'reject') {
    bool isApprove = notificationResponse.actionId == 'approve';
    
    // Simulasi proses API di background
    await Future.delayed(const Duration(seconds: 1));
    
    // Munculkan popup/notifikasi sukses setelah berhasil diproses
    String statusStr = isApprove ? 'Disetujui' : 'Ditolak';
    await flutterLocalNotificationsPlugin.show(
      id: 999, // ID notifikasi sukses
      title: 'Aksi Berhasil',
      body: 'Pengajuan berhasil $statusStr.',
      notificationDetails: const NotificationDetails(
        android: AndroidNotificationDetails(
          'wkn_success_channel',
          'Notifikasi Sukses',
          channelDescription: 'Kanal untuk notifikasi berhasil',
          importance: Importance.max,
          priority: Priority.high,
          color: Colors.green,
        ),
      ),
    );
  }
}

class NotificationService {
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;

  Future<void> initNotifications() async {
    // 1. Inisialisasi Local Notifications
    const AndroidInitializationSettings initializationSettingsAndroid = AndroidInitializationSettings('@mipmap/launcher_icon');
    const DarwinInitializationSettings initializationSettingsDarwin = DarwinInitializationSettings();
    const InitializationSettings initializationSettings = InitializationSettings(
      android: initializationSettingsAndroid,
      iOS: initializationSettingsDarwin,
    );
    
    await flutterLocalNotificationsPlugin.initialize(
      settings: initializationSettings,
      onDidReceiveNotificationResponse: (NotificationResponse response) {
         debugPrint('onDidReceiveNotificationResponse: ${response.actionId}');
      },
      onDidReceiveBackgroundNotificationResponse: notificationTapBackground,
    );

    // 2. Request permission Firebase
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
    );

    if (settings.authorizationStatus == AuthorizationStatus.authorized) {
      debugPrint('User granted notification permission');
      String? token = await _firebaseMessaging.getToken();
      debugPrint('FCM Token: $token');
      
      FirebaseMessaging.onMessage.listen((RemoteMessage message) {
        if (message.notification != null) {
          debugPrint('Got foreground message: ${message.notification?.title}');
        }
      });
      
      FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {
        debugPrint('Opened app from FCM message!');
      });
    }

    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
  }

  // Fungsi untuk memicu notifikasi 'Satu Ketukan' secara manual/lokal
  Future<void> showApprovalNotification(String title, String body, String payload) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics = AndroidNotificationDetails(
      'wkn_approval_channel',
      'Persetujuan Pengajuan',
      channelDescription: 'Kanal untuk notifikasi persetujuan (Approve/Reject)',
      importance: Importance.max,
      priority: Priority.high,
      color: Color(0xFFE31E24), // WKN Primary Color
      actions: <AndroidNotificationAction>[
        AndroidNotificationAction(
          'reject',
          'Tolak',
          cancelNotification: true,
          showsUserInterface: false,
          titleColor: Colors.red,
        ),
        AndroidNotificationAction(
          'approve',
          'Setujui',
          cancelNotification: true,
          showsUserInterface: false,
          titleColor: Colors.green,
        ),
      ],
    );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
    );

    await flutterLocalNotificationsPlugin.show(
      id: 0,
      title: title,
      body: body,
      notificationDetails: platformChannelSpecifics,
      payload: payload,
    );
  }

  // Fungsi untuk memicu notifikasi Gamifikasi (Points / Streak)
  Future<void> showGamificationNotification(String title, String body, String payload) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics = AndroidNotificationDetails(
      'wkn_gamification_channel',
      'Pencapaian & Gamifikasi',
      channelDescription: 'Kanal untuk notifikasi poin, leaderboard, dan attendance streak',
      importance: Importance.max,
      priority: Priority.high,
      color: Color(0xFFFFC107), // Amber / Gold Color for Gamification
      icon: '@mipmap/launcher_icon',
      largeIcon: DrawableResourceAndroidBitmap('@mipmap/launcher_icon'),
    );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
    );

    await flutterLocalNotificationsPlugin.show(
      id: 888, // ID unik gamifikasi
      title: title,
      body: body,
      notificationDetails: platformChannelSpecifics,
      payload: payload,
    );
  }
}

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("Handling a background message: ${message.messageId}");
}
