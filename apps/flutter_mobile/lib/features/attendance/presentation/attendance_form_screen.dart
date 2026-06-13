import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'dart:io';

import '../../../core/theme/theme_extension.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/attendance_service.dart';
import '../data/offline_attendance_service.dart';
import '../../../core/utils/notification_service.dart';

class AttendanceFormScreen extends StatefulWidget {
  final String clockType;
  const AttendanceFormScreen({super.key, required this.clockType});

  @override
  State<AttendanceFormScreen> createState() => _AttendanceFormScreenState();
}

class _AttendanceFormScreenState extends State<AttendanceFormScreen> {
  String? _photoPath;
  final TextEditingController _notesController = TextEditingController();
  bool _isProcessing = false;
  
  final AttendanceService _service = AttendanceService();
  final OfflineAttendanceService _offlineService = OfflineAttendanceService();

  Future<void> _submitAttendance() async {
    if (_photoPath == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Harap ambil foto selfie terlebih dahulu!'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      final user = context.read<AuthProvider>().userData;
      final isWebOrWindows = kIsWeb || (!Platform.isAndroid && !Platform.isIOS);
      
      Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);

      bool isOffline = false;
      if (!isWebOrWindows) {
        final List<ConnectivityResult> connectivityResult = await (Connectivity().checkConnectivity());
        isOffline = connectivityResult.contains(ConnectivityResult.none);
      }

      if (isOffline) {
        await _offlineService.savePendingAttendance(
          employeeId: user?['id'] ?? 'unknown',
          latitude: position.latitude,
          longitude: position.longitude,
          clockType: widget.clockType, 
          notes: _notesController.text.isNotEmpty ? _notesController.text : 'Offline Mobile check-in',
          photoPath: _photoPath!,
        );
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('📶 Sinyal Terputus. Absen disimpan secara OFFLINE.'), backgroundColor: Colors.orange),
        );
        context.go('/main');
      } else {
        final result = await _service.submitAttendance(
          employeeId: user?['id'] ?? 'unknown',
          latitude: position.latitude,
          longitude: position.longitude,
          clockType: widget.clockType, 
          notes: _notesController.text.isNotEmpty ? _notesController.text : 'Mobile check-in',
          photoPath: _photoPath!,
        );

        if (!mounted) return;
        if (result['status'] == 'success') {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('✅ Absen berhasil disimpan'), backgroundColor: Colors.green),
          );
          
          final data = result['data'];
          bool isOnTime = data != null && data['late_minutes'] == 0;
          if (isOnTime) {
             NotificationService().showGamificationNotification(
                '🔥 +10 Poin Kehadiran!',
                'Hebat! Anda berhasil absen tepat waktu hari ini. Pertahankan streak Anda!',
                'gamification'
             );
          }
          
          context.go('/main');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result['message']), backgroundColor: Colors.red),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal mengirim absen: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isProcessing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        title: Text(widget.clockType == 'IN' ? 'Form Absen Masuk' : 'Form Absen Pulang', style: TextStyle(color: context.textPrimary, fontSize: 16)),
        backgroundColor: context.surfaceColor,
        iconTheme: IconThemeData(color: context.textPrimary),
        elevation: 0.5,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Container(
              height: 300,
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: context.surfaceColor.withValues(alpha: 0.2)),
                boxShadow: [
                  BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 5)),
                ]
              ),
              child: _photoPath != null
                  ? ClipRRect(
                      borderRadius: BorderRadius.circular(15),
                      child: Image.file(File(_photoPath!), fit: BoxFit.cover),
                    )
                  : Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.camera_front, size: 60, color: Colors.grey.withValues(alpha: 0.5)),
                        const SizedBox(height: 16),
                        const Text('Foto Selfie (Liveness)', style: TextStyle(color: Colors.grey)),
                      ],
                    ),
            ),
            const SizedBox(height: 16),

            ElevatedButton.icon(
              onPressed: () async {
                final photoPath = await context.push<String>('/camera?type=${widget.clockType}');
                if (photoPath != null) {
                  setState(() {
                    _photoPath = photoPath;
                  });
                }
              },
              icon: const Icon(Icons.camera_alt),
              label: Text(_photoPath == null ? "AMBIL FOTO WAJAH" : "ULANGI FOTO"),
              style: ElevatedButton.styleFrom(
                backgroundColor: _photoPath == null ? AppConstants.primaryColor : Colors.orange,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),

            Text('Catatan Kehadiran', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: context.textPrimary)),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: context.surfaceColor,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: context.surfaceColor.withValues(alpha: 0.2)),
              ),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: TextField(
                controller: _notesController,
                maxLines: 3,
                style: TextStyle(color: context.textPrimary),
                decoration: const InputDecoration(
                  hintText: 'Tambahkan catatan (opsional)...',
                  hintStyle: TextStyle(color: Colors.grey),
                  border: InputBorder.none,
                ),
              ),
            ),
            const SizedBox(height: 32),

            _isProcessing
                ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
                : ElevatedButton.icon(
                    onPressed: _photoPath != null ? _submitAttendance : null,
                    icon: const Icon(Icons.check_circle),
                    label: const Text("SIMPAN ABSENSI"),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(vertical: 16),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      disabledBackgroundColor: Colors.grey.withValues(alpha: 0.5),
                    ),
                  ),
          ],
        ),
      ),
    );
  }
}
