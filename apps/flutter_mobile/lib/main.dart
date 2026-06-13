import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'core/utils/constants.dart';
import 'core/router/app_router.dart';
import 'features/auth/data/auth_provider.dart';
import 'features/reports/data/attendance_provider.dart';

import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';
import 'core/utils/notification_service.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'core/di/dependency_injection.dart';
import 'package:intl/date_symbol_data_local.dart';
import 'package:workmanager/workmanager.dart';
import 'features/attendance/data/offline_attendance_service.dart';
import 'features/attendance/data/attendance_service.dart';
import 'core/theme/app_theme.dart';
import 'core/theme/theme_provider.dart';
import 'core/widgets/floating_assistant.dart';

@pragma('vm:entry-point')
void callbackDispatcher() {
  Workmanager().executeTask((task, inputData) async {
    try {
      debugPrint("Native called background task: $task");
      await dotenv.load(fileName: ".env");
      await Supabase.initialize(
        url: AppConstants.supabaseUrl,
        anonKey: AppConstants.supabaseAnonKey,
      );
      
      final offlineService = OfflineAttendanceService();
      final pending = await offlineService.getPendingAttendances();
      if (pending.isEmpty) {
        return Future.value(true);
      }
      
      final apiService = AttendanceService();
      int successCount = 0;
      
      for (var record in pending) {
        final result = await apiService.submitAttendance(
          employeeId: record['employeeId'],
          latitude: record['latitude'],
          longitude: record['longitude'],
          clockType: record['clockType'],
          notes: record['notes'] + ' (Auto-Synced Background)',
          photoPath: record['photoPath'],
        ).timeout(
          const Duration(seconds: 15),
          onTimeout: () => throw Exception('Connection Timeout during background sync'),
        );
        
        if (result['status'] == 'success') {
          await offlineService.removePendingAttendance(record['id']);
          successCount++;
        }
      }
      debugPrint("Background sync completed: $successCount records synced.");
      return Future.value(true);
    } catch (err) {
      debugPrint("Background task error: $err");
      return Future.value(false);
    }
  });
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  setupLocator();
  await initializeDateFormatting('id_ID', null);

  Workmanager().initialize(
    callbackDispatcher,
  );
  Workmanager().registerPeriodicTask(
    "syncOfflineAttendance_1",
    "syncOfflineAttendance",
    frequency: const Duration(minutes: 15),
    constraints: Constraints(
      networkType: NetworkType.connected,
    ),
  );

  // Initialize Firebase
  try {
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    await NotificationService().initNotifications();
  } catch (e) {
    debugPrint('Firebase not configured yet: $e');
  }

  await Supabase.initialize(
    url: AppConstants.supabaseUrl,
    anonKey: AppConstants.supabaseAnonKey,
  );

  runApp(
    MultiProvider(
      providers: [
        ChangeNotifierProvider.value(value: getIt<AuthProvider>()),
        ChangeNotifierProvider.value(value: getIt<AttendanceProvider>()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
      ],
      child: const MyApp(),
    ),
  );
}

class MyApp extends StatefulWidget {
  const MyApp({super.key});

  @override
  State<MyApp> createState() => _MyAppState();
}

class _MyAppState extends State<MyApp> {
  late final GoRouter _router;

  @override
  void initState() {
    super.initState();
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _router = createAppRouter(authProvider);
  }

  @override
  Widget build(BuildContext context) {
    final themeProvider = Provider.of<ThemeProvider>(context);

    return MaterialApp.router(
      title: 'WKN Mobile',
      debugShowCheckedModeBanner: false,
      themeMode: themeProvider.themeMode,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      routerConfig: _router,
      builder: (context, child) {
        return Stack(
          children: [
            if (child != null) child,
            FloatingAssistant(router: _router),
          ],
        );
      },
    );
  }
}
