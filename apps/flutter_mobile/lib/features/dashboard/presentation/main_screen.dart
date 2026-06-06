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

  final List<Widget> _screens = [
    const DashboardScreen(),
    const InboxScreen(),
    const Center(child: Text('Kamera Absen')), // This is a placeholder, routed separately
    const HelpdeskScreen(),
    const ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens[_currentIndex],
      floatingActionButton: FloatingActionButton(
        onPressed: () => context.push('/assistant'),
        backgroundColor: AppConstants.secondaryColor,
        shape: const CircleBorder(),
        elevation: 0, // Flat premium look
        highlightElevation: 2,
        child: const Icon(Icons.auto_awesome, color: Colors.white),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          border: Border(top: BorderSide(color: AppConstants.slate200, width: 1)),
        ),
        child: NavigationBarTheme(
          data: NavigationBarThemeData(
            elevation: 0,
            labelTextStyle: WidgetStateProperty.resolveWith((states) {
              if (states.contains(WidgetState.selected)) {
                return const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppConstants.primaryColor);
              }
              return const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppConstants.textSecondary);
            }),
          ),
          child: NavigationBar(
            selectedIndex: _currentIndex,
            onDestinationSelected: (index) {
              if (index == 2) {
                context.push('/assistant');
              } else {
                setState(() {
                  _currentIndex = index;
                });
              }
            },
            backgroundColor: Colors.transparent,
            elevation: 0,
            indicatorColor: AppConstants.primaryColor.withValues(alpha: 0.1),
            destinations: const [
              NavigationDestination(
                icon: Icon(Icons.home_outlined),
                selectedIcon: Icon(Icons.home, color: AppConstants.primaryColor),
                label: 'Beranda',
              ),
              NavigationDestination(
                icon: Icon(Icons.mail_outline),
                selectedIcon: Icon(Icons.mail, color: AppConstants.primaryColor),
                label: 'Inbox',
              ),
              NavigationDestination(
                icon: SizedBox.shrink(),
                label: '',
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
        ),
      ),
    );
  }
}
