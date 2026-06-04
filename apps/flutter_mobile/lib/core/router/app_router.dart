import 'package:go_router/go_router.dart';
import '../../features/auth/data/auth_provider.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/dashboard/presentation/main_screen.dart';
import '../../features/dashboard/presentation/menu_screen.dart';
import '../../features/dashboard/presentation/development_screen.dart';
import '../../features/dashboard/presentation/id_card_screen.dart';
import '../../features/leave/presentation/leave_screen.dart';
import '../../features/overtime/presentation/overtime_screen.dart';
import '../../features/payslip/presentation/payslip_screen.dart';
import '../../features/reimburse/presentation/reimburse_screen.dart';
import '../../features/attendance/presentation/camera_screen.dart';
import '../../features/profile/presentation/personal_data_auth_screen.dart';
import '../../features/profile/presentation/personal_data_screen.dart';
import '../../features/profile/presentation/change_password_screen.dart';
import '../../features/profile/presentation/signature_screen.dart';
import '../../features/directory/presentation/directory_screen.dart';
import '../../features/timesheet/presentation/timesheet_screen.dart';
import '../../features/helpdesk/presentation/helpdesk_screen.dart';
import '../../features/documents/presentation/documents_screen.dart';
import '../../features/assistant/presentation/assistant_screen.dart';
import '../../features/company/presentation/announcements_screen.dart';
import '../../features/company/presentation/academy_screen.dart';
import '../../features/company/presentation/performance_screen.dart';
import '../../features/company/presentation/assets_screen.dart';
import '../../features/company/presentation/approval_screen.dart';
import '../../features/reports/presentation/report_screen.dart';
import '../utils/auth_guard.dart';

GoRouter createAppRouter(AuthProvider authProvider) {
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: authProvider,
    routes: [
      GoRoute(path: '/splash', builder: (context, state) => const SplashScreen()),
      GoRoute(path: '/login', builder: (context, state) => const LoginScreen()),
    GoRoute(path: '/main', builder: (context, state) => const MainScreen()),
    GoRoute(
      path: '/camera', 
      builder: (context, state) => CameraScreen(
        clockType: state.uri.queryParameters['type'] ?? 'IN',
      )
    ),
    GoRoute(path: '/menu', builder: (context, state) => const MenuScreen()),
    GoRoute(
      path: '/development',
      builder: (context, state) => DevelopmentScreen(title: state.uri.queryParameters['title'] ?? ''),
    ),
    GoRoute(path: '/id-card', builder: (context, state) => const IdCardScreen()),
    GoRoute(path: '/leave', builder: (context, state) => const LeaveScreen()),
    GoRoute(path: '/overtime', builder: (context, state) => const OvertimeScreen()),
    GoRoute(path: '/payslip', builder: (context, state) => const PayslipScreen()),
    GoRoute(path: '/reimburse', builder: (context, state) => const ReimburseScreen()),
    GoRoute(path: '/personal-data-auth', builder: (context, state) => const PersonalDataAuthScreen()),
    GoRoute(path: '/personal-data', builder: (context, state) => const PersonalDataScreen()),
    GoRoute(path: '/change-password', builder: (context, state) => const ChangePasswordScreen()),
    GoRoute(path: '/signature', builder: (context, state) => const SignatureScreen()),
    GoRoute(path: '/directory', builder: (context, state) => const DirectoryScreen()),
    GoRoute(path: '/timesheet', builder: (context, state) => const TimesheetScreen()),
    GoRoute(path: '/helpdesk', builder: (context, state) => const HelpdeskScreen()),
    GoRoute(path: '/documents', builder: (context, state) => const DocumentsScreen()),
    GoRoute(path: '/assistant', builder: (context, state) => const AssistantScreen()),
    GoRoute(path: '/announcements', builder: (context, state) => const AnnouncementsScreen()),
    GoRoute(path: '/academy', builder: (context, state) => const AcademyScreen()),
    GoRoute(path: '/performance', builder: (context, state) => const PerformanceScreen()),
    GoRoute(path: '/assets', builder: (context, state) => const AssetsScreen()),
    GoRoute(path: '/approval', builder: (context, state) => const ApprovalScreen()),
    GoRoute(path: '/reports', builder: (context, state) => const ReportScreen()),
  ],
  redirect: authGuard,
  );
}
