import 'dart:convert';
import 'dart:math';
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

    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.close, color: context.textPrimary, size: 28), onPressed: () => context.pop()),
        title: Text('ID Card Digital', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        centerTitle: true,
      ),
      body: Padding(
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
                  child: angle < pi / 2 ? _buildFrontCard(user) : _buildBackCard(qrData, angle),
                );
              },
            ),

            const SizedBox(height: 40),
            
            // Flip Button
            SizedBox(
              width: double.infinity,
              height: 60,
              child: OutlinedButton.icon(
                onPressed: _flipCard,
                icon: Icon(Icons.sync, color: AppConstants.primaryColor),
                label: Text('Balik Kartu (Lihat QR)', style: TextStyle(color: context.textPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
                style: OutlinedButton.styleFrom(
                  backgroundColor: context.surfaceColor,
                  side: BorderSide(color: Colors.grey.shade300),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(30)),
                  elevation: 2,
                  shadowColor: Colors.black.withValues(alpha: 0.1),
                ),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildFrontCard(Map<String, dynamic>? user) {
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
                decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(12)),
                child: Icon(Icons.shield, color: AppConstants.primaryColor),
              ),
              SizedBox(width: 10),
              Text('WKN', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: context.surfaceColor, letterSpacing: -1)),
              const Text('site', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: Colors.black, letterSpacing: -1)),
            ],
          ),
          
          Column(
            children: [
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(
                  color: context.surfaceColor.withValues(alpha: 0.2),
                  shape: BoxShape.circle,
                  border: Border.all(color: context.surfaceColor, width: 3),
                ),
                child: Center(
                  child: Text((user?['name']?.isNotEmpty == true) ? user!['name'].substring(0, 1).toUpperCase() : 'W', style: TextStyle(fontSize: 40, fontWeight: FontWeight.w900, color: context.surfaceColor)),
                ),
              ),
              SizedBox(height: 16),
              Text(user?['name'] ?? 'Karyawan WKN', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: context.surfaceColor), textAlign: TextAlign.center),
              const SizedBox(height: 4),
              Text(user?['job_position'] ?? 'Staff WKN', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: context.surfaceColor.withValues(alpha: 0.8), letterSpacing: 1)),
            ],
          ),

          Container(
            padding: const EdgeInsets.only(top: 16),
            decoration: BoxDecoration(border: Border(top: BorderSide(color: context.surfaceColor.withValues(alpha: 0.2)))),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('ID PEGAWAI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: context.surfaceColor.withValues(alpha: 0.6), letterSpacing: 1)),
                    SizedBox(height: 4),
                    Text(user?['employee_code'] ?? (user?['id'] ?? 'WKN-001').toString().substring(0, min(8, (user?['id'] ?? 'WKN-001').toString().length)).toUpperCase(), style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: context.surfaceColor)),
                  ],
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text('LOKASI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: context.surfaceColor.withValues(alpha: 0.6), letterSpacing: 1)),
                    SizedBox(height: 4),
                    Text(user?['working_location'] ?? 'Head Office', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: context.surfaceColor)),
                  ],
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildBackCard(String qrData, double angle) {
    // The back card is rotated 180 degrees initially because of the parent transform, so we must counter-rotate its content.
    return Transform(
      transform: Matrix4.identity()..rotateY(pi),
      alignment: Alignment.center,
      child: Container(
        width: double.infinity,
        height: MediaQuery.of(context).size.width * 1.5,
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(30),
          border: Border.all(color: Colors.grey.shade300),
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10))],
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('SCAN UNTUK AKSES PINTU', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w900, letterSpacing: 1.5, color: context.textPrimary), textAlign: TextAlign.center),
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.1), blurRadius: 20, offset: const Offset(0, 10))]
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
              style: TextStyle(fontSize: 12, color: Colors.grey, height: 1.5),
              textAlign: TextAlign.center,
            )
          ],
        ),
      ),
    );
  }
}
