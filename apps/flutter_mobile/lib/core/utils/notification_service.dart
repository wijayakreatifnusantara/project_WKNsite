import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:go_router/go_router.dart';
import '../router/app_router.dart';

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
         debugPrint('onDidReceiveNotificationResponse: action=${response.actionId}, payload=${response.payload}');
         if (response.actionId == 'view_leaderboard' || response.payload == 'gamification') {
           if (rootNavigatorKey.currentContext != null) {
             rootNavigatorKey.currentContext!.push('/leaderboard');
           }
         }
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
          
          final type = message.data['type'] as String?;
          bool isGamification = type == 'gamification';

          flutterLocalNotificationsPlugin.show(
            id: message.notification.hashCode,
            title: message.notification!.title,
            body: message.notification!.body,
            notificationDetails: NotificationDetails(
              android: AndroidNotificationDetails(
                isGamification ? 'wkn_gamification_channel' : 'wkn_fcm_channel',
                isGamification ? 'Pencapaian & Gamifikasi' : 'Pemberitahuan WKN',
                channelDescription: isGamification 
                  ? 'Kanal untuk notifikasi poin dan leaderboard' 
                  : 'Kanal untuk notifikasi real-time',
                importance: Importance.max,
                priority: Priority.high,
                color: isGamification ? const Color(0xFFFFC107) : const Color(0xFFE31E24),
                icon: '@mipmap/launcher_icon',
              ),
            ),
            payload: type ?? 'general',
          );
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
      actions: <AndroidNotificationAction>[
        AndroidNotificationAction(
          'view_leaderboard',
          'Lihat Peringkat',
          cancelNotification: true,
          showsUserInterface: true,
        ),
      ],
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

  // Fungsi untuk memicu notifikasi Offline Sync
  Future<void> showOfflineSyncNotification(String title, String body) async {
    const AndroidNotificationDetails androidPlatformChannelSpecifics = AndroidNotificationDetails(
      'wkn_sync_channel',
      'Sinkronisasi Latar Belakang',
      channelDescription: 'Kanal untuk notifikasi berhasilnya sinkronisasi offline',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
      color: Colors.green,
      icon: '@mipmap/launcher_icon',
    );

    const NotificationDetails platformChannelSpecifics = NotificationDetails(
      android: androidPlatformChannelSpecifics,
    );

    await flutterLocalNotificationsPlugin.show(
      id: 777, // ID unik sync
      title: title,
      body: body,
      notificationDetails: platformChannelSpecifics,
    );
  }
}

@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  debugPrint("Handling a background message: ${message.messageId}");
}
