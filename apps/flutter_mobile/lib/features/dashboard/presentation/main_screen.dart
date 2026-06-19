import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import '../../profile/presentation/profile_screen.dart';
import '../../inbox/presentation/inbox_screen.dart';
import '../../helpdesk/presentation/helpdesk_screen.dart';
import '../../../core/utils/constants.dart';
import '../../../core/utils/tracking_service.dart';
import 'ios_home_screen.dart';
import 'menu_screen.dart';

class MainScreen extends StatefulWidget {
  const MainScreen({super.key});

  @override
  State<MainScreen> createState() => _MainScreenState();
}

class _MainScreenState extends State<MainScreen> {
  final List<Widget> _screens = [
    const IosHomeScreen(),
    const MenuScreen(),
    const InboxScreen(),
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
    return CupertinoTabScaffold(
      tabBar: CupertinoTabBar(
        activeColor: AppConstants.primaryColor,
        inactiveColor: CupertinoColors.systemGrey,
        backgroundColor: context.isDarkMode 
            ? CupertinoColors.black.withValues(alpha: 0.8)
            : CupertinoColors.white.withValues(alpha: 0.8),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.home),
            activeIcon: Icon(CupertinoIcons.house_fill),
            label: 'Beranda',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.square_grid_2x2),
            activeIcon: Icon(CupertinoIcons.square_grid_2x2_fill),
            label: 'Menu',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.mail),
            activeIcon: Icon(CupertinoIcons.mail_solid),
            label: 'Inbox',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.question_circle),
            activeIcon: Icon(CupertinoIcons.question_circle_fill),
            label: 'Bantuan',
          ),
          BottomNavigationBarItem(
            icon: Icon(CupertinoIcons.person),
            activeIcon: Icon(CupertinoIcons.person_solid),
            label: 'Profil',
          ),
        ],
      ),
      tabBuilder: (context, index) {
        return CupertinoTabView(
          builder: (context) {
            // Material wrapper needed if inner screens use Material widgets (e.g. Scaffold)
            return Material(
              child: _screens[index],
            );
          },
        );
      },
    );
  }
}
