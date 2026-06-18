import 'dart:convert';
import 'dart:math';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:provider/provider.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';

class IdCardScreen extends StatefulWidget {
  const IdCardScreen({super.key});

  @override
  State<IdCardScreen> createState() => _IdCardScreenState();
}

class _IdCardScreenState extends State<IdCardScreen> with SingleTickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _animation;
  bool _isFlipped = false;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _animation = Tween<double>(begin: 0, end: 1).animate(CurvedAnimation(parent: _animationController, curve: Curves.easeInOut));
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _flipCard() {
    if (_isFlipped) {
      _animationController.reverse();
    } else {
      _animationController.forward();
    }
    setState(() {
      _isFlipped = !_isFlipped;
    });
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().userData;
    final qrData = jsonEncode({
      'id': user?['id'],
      'type': 'WKN_EMPLOYEE',
      'timestamp': DateTime.now().millisecondsSinceEpoch
    });

    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('ID Card Digital'),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => context.pop(),
          child: const Icon(CupertinoIcons.clear),
        ),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Flip Card Animation Container
              AnimatedBuilder(
                animation: _animation,
                builder: (context, child) {
                  final angle = _animation.value * pi;
                  return Transform(
                    transform: Matrix4.identity()..setEntry(3, 2, 0.001)..rotateY(angle),
                    alignment: Alignment.center,
                    child: angle < pi / 2 ? _buildFrontCard(user, isDark) : _buildBackCard(qrData, angle, isDark),
                  );
                },
              ),

              const SizedBox(height: 40),
              
              // Flip Button
              SizedBox(
                width: double.infinity,
                child: CupertinoButton(
                  color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
                  onPressed: _flipCard,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(CupertinoIcons.arrow_2_circlepath, color: AppConstants.primaryColor, size: 20),
                      const SizedBox(width: 8),
                      Text('Balik Kartu (Lihat QR)', style: TextStyle(color: isDark ? CupertinoColors.white : CupertinoColors.black, fontWeight: FontWeight.bold, fontSize: 15)),
                    ],
                  ),
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildFrontCard(Map<String, dynamic>? user, bool isDark) {
    return Container(
      width: double.infinity,
      height: MediaQuery.of(context).size.width * 1.5,
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: AppConstants.primaryColor,
        borderRadius: BorderRadius.circular(30),
        boxShadow: [BoxShadow(color: AppConstants.primaryColor.withValues(alpha: 0.4), blurRadius: 20, offset: const Offset(0, 10))],
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            children: [
              Container(
                width: 40, height: 40,
                decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(12)),
                child: const Icon(CupertinoIcons.shield_fill, color: AppConstants.primaryColor),
              ),
              const SizedBox(width: 10),
              const Text('WKN', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: CupertinoColors.white, letterSpacing: -1)),
              const Text('site', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: CupertinoColors.black, letterSpacing: -1)),
            ],
          ),
          
          Column(
            children: [
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(
                  color: CupertinoColors.white.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: CupertinoColors.white, width: 3),
                ),
                child: Center(
                  child: Text((user?['name']?.isNotEmpty == true) ? user!['name'].substring(0, 1).toUpperCase() : 'W', style: const TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: CupertinoColors.white)),
                ),
              ),
              const SizedBox(height: 16),
              Text(user?['name'] ?? 'Karyawan WKN', style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: CupertinoColors.white), textAlign: TextAlign.center),
              const SizedBox(height: 4),
              Text(user?['job_position'] ?? 'Staff WKN', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: CupertinoColors.white.withValues(alpha: 0.8), letterSpacing: 1)),
            ],
          ),

          Container(
            padding: const EdgeInsets.only(top: 16),
            decoration: BoxDecoration(border: Border(top: BorderSide(color: CupertinoColors.white.withValues(alpha: 0.2)))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ID PEGAWAI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.white.withValues(alpha: 0.6), letterSpacing: 1)),
                    const SizedBox(height: 4),
                    Text(user?['employee_code'] ?? (user?['id'] ?? 'WKN-001').toString().substring(0, min(8, (user?['id'] ?? 'WKN-001').toString().length)).toUpperCase(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: CupertinoColors.white)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('LOKASI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.white.withValues(alpha: 0.6), letterSpacing: 1)),
                    const SizedBox(height: 4),
                    Text(user?['working_location'] ?? 'Head Office', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: CupertinoColors.white)),
                  ],
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildBackCard(String qrData, double angle, bool isDark) {
    // The back card is rotated 180 degrees initially because of the parent transform, so we must counter-rotate its content.
    return Transform(
      transform: Matrix4.identity()..rotateY(pi),
      alignment: Alignment.center,
      child: Container(
        width: double.infinity,
        height: MediaQuery.of(context).size.width * 1.5,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: isDark ? CupertinoColors.systemGrey4 : CupertinoColors.systemGrey5),
          boxShadow: [BoxShadow(color: CupertinoColors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('SCAN UNTUK AKSES PINTU', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1.5, color: isDark ? CupertinoColors.white : CupertinoColors.black), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: CupertinoColors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: CupertinoColors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10))]
              ),
              child: QrImageView(
                data: qrData,
                version: QrVersions.auto,
                size: MediaQuery.of(context).size.width * 0.55,
              ),
            ),
            const SizedBox(height: 30),
            const Text(
              'Arahkan QR Code ini ke mesin pemindai di pintu masuk untuk mencatat kedatangan atau membuka akses ruangan.',
              style: TextStyle(fontSize: 12, color: CupertinoColors.systemGrey, height: 1.5),
              textAlign: TextAlign.center,
            )
          ],
        ),
      ),
    );
  }
}
