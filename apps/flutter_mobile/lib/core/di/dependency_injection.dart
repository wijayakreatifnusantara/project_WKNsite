import 'package:get_it/get_it.dart';
import '../../features/auth/data/auth_provider.dart';
import '../../features/reports/data/attendance_provider.dart';

final getIt = GetIt.instance;

void setupLocator() {
  getIt.registerLazySingleton<AuthProvider>(() => AuthProvider());
  getIt.registerLazySingleton<AttendanceProvider>(() => AttendanceProvider());
}
