import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../inbox/presentation/inbox_screen.dart';
import '../../helpdesk/presentation/helpdesk_screen.dart';
import '../../../core/utils/constants.dart';
import '../../../core/utils/tracking_service.dart';
import 'dashboard_screen.dart';

import 'dart:ui'; // Add this for BackdropFilter

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
  void initState() {
    super.initState();
    TrackingService.startTracking();
  }

  @override
  void dispose() {
    TrackingService.stopTracking();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      extendBody: true,
      body: _screens[_currentIndex],
      bottomNavigationBar: Container(
        margin: const EdgeInsets.only(left: 16, right: 16, bottom: 24),
        decoration: BoxDecoration(
          color: context.isDarkMode 
              ? context.surfaceColor.withValues(alpha: 0.8) 
              : Colors.white.withValues(alpha: 0.8),
          borderRadius: BorderRadius.circular(32),
          border: Border.all(color: context.borderColor.withValues(alpha: 0.5), width: 1),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 24,
              offset: const Offset(0, 8),
            )
          ]
        ),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(32),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10.0, sigmaY: 10.0),
            child: BottomAppBar(
              color: Colors.transparent,
              elevation: 0,
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: SizedBox(
                height: 60,
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _buildNavItem(0, Icons.home_outlined, Icons.home, 'Beranda'),
                    _buildNavItem(1, Icons.mail_outline, Icons.mail, 'Inbox'),
                    _buildNavItem(3, Icons.help_outline, Icons.help, 'Bantuan'),
                    _buildNavItem(4, Icons.person_outline, Icons.person, 'Profil'),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem(int index, IconData icon, IconData activeIcon, String label) {
    final isSelected = _currentIndex == index;
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _currentIndex = index),
        behavior: HitTestBehavior.opaque,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
              decoration: BoxDecoration(
                color: isSelected ? AppConstants.primaryColor.withValues(alpha: 0.1) : Colors.transparent,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                isSelected ? activeIcon : icon,
                color: isSelected ? AppConstants.primaryColor : Colors.grey.shade400,
                size: 26,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 10,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                color: isSelected ? AppConstants.primaryColor : Colors.grey.shade500,
              ),
            )
          ],
        ),
      ),
    );
  }
}
