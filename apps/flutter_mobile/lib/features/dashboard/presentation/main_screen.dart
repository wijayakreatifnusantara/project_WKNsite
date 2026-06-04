import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/services.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../inbox/presentation/inbox_screen.dart';
import '../../helpdesk/presentation/helpdesk_screen.dart';
import '../../../core/utils/biometric_helper.dart';
import '../../../core/utils/constants.dart';
import 'dashboard_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  int _currentIndex = 0;
  bool _isAuthenticated = false;

  @override
  void initState() {
    super.initState();
    _checkBiometric();
  }

  Future<void> _checkBiometric() async {
    final helper = BiometricHelper();
    final authenticated = await helper.authenticate();
    if (authenticated) {
      setState(() {
        _isAuthenticated = true;
      });
    } else {
      // Keluar dari app jika gagal/batal
      SystemNavigator.pop();
    }
  }

  final List<Widget> _screens = [
    const DashboardScreen(),
    const InboxScreen(),
    const Center(child: Text('Kamera Absen')),
    const HelpdeskScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    if (!_isAuthenticated) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Icon(Icons.fingerprint, size: 64, color: Colors.white54),
        ),
      );
    }

    return Scaffold(
      body: _screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          if (index == 2) {
            context.push('/camera');
          } else {
            setState(() {
              _currentIndex = index;
            });
          }
        },
        backgroundColor: Colors.white,
        indicatorColor: AppConstants.primaryColor.withValues(alpha: 0.2),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home, color: AppConstants.primaryColor),
            label: 'Beranda',
          ),
          NavigationDestination(
            icon: Icon(Icons.mail_outline),
            selectedIcon: Icon(Icons.mail, color: AppConstants.primaryColor),
            label: 'Kotak Masuk',
          ),
          NavigationDestination(
            icon: Icon(Icons.fingerprint, size: 32, color: AppConstants.primaryColor),
            label: 'Absen',
          ),
          NavigationDestination(
            icon: Icon(Icons.help_outline),
            selectedIcon: Icon(Icons.help, color: AppConstants.primaryColor),
            label: 'Bantuan',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline),
            selectedIcon: Icon(Icons.person, color: AppConstants.primaryColor),
            label: 'Profil',
          ),
        ],
      ),
    );
  }
}
