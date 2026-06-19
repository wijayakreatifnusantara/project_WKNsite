import 'package:flutter/services.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/theme/theme_provider.dart';
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:ntp/ntp.dart';
import 'dart:io';

import '../../../core/theme/theme_extension.dart';
import '../../auth/data/auth_provider.dart';
import '../data/attendance_service.dart';
import '../data/offline_attendance_service.dart';

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
      showCupertinoDialog(
        context: context,
        builder: (ctx) => CupertinoAlertDialog(
          title: const Text('Foto Belum Ada'),
          content: const Text('Harap ambil foto selfie terlebih dahulu.'),
          actions: [CupertinoDialogAction(child: const Text('OK'), onPressed: () => Navigator.pop(ctx))],
        ),
      );
      return;
    }

    setState(() { _isProcessing = true; });

    // Cache semua nilai context sebelum await
    final user = context.read<AuthProvider>().userData;
    final hapticEnabled = context.read<ThemeProvider>().hapticEnabled;
    final isWebOrWindows = kIsWeb || (!Platform.isAndroid && !Platform.isIOS);

    try {
      if (user == null) {
        throw Exception('Sesi login habis. Harap login kembali.');
      }

      // --- ANTI-FRAUD: NTP TIME CHECK ---
      if (!isWebOrWindows) {
        try {
          DateTime deviceTime = DateTime.now();
          DateTime ntpTime = await NTP.now(timeout: const Duration(seconds: 5));
          int diff = deviceTime.difference(ntpTime).inSeconds.abs();
          
          if (diff > 60) {
            if (!mounted) return;
            showCupertinoDialog(
              context: context,
              builder: (context) => CupertinoAlertDialog(
                title: const Text('Keamanan Waktu (Anti-Fraud)'),
                content: const Text('Waktu perangkat Anda tidak sinkron dengan waktu global (NTP). Harap setel waktu HP Anda ke "Otomatis" (Jaringan) dan coba lagi.'),
                actions: [
                  CupertinoDialogAction(child: const Text('Tutup'), onPressed: () => Navigator.pop(context))
                ],
              ),
            );
            return;
          }
        } catch (e) {
          debugPrint('NTP Error: $e'); // Continue if NTP fails due to network
        }
      }

      // --- GPS: PERMISSION CHECK ---
      if (!isWebOrWindows) {
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          throw Exception('Layanan GPS tidak aktif. Aktifkan GPS dan coba lagi.');
        }
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
          if (permission == LocationPermission.denied) {
            throw Exception('Izin akses lokasi ditolak.');
          }
        }
        if (permission == LocationPermission.deniedForever) {
          throw Exception('Akses lokasi diblokir permanen. Buka Pengaturan aplikasi untuk mengaktifkan.');
        }
      }

      Position position = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);

      // --- ANTI-FRAUD: MOCK LOCATION CHECK ---
      if (!isWebOrWindows && position.isMocked) {
        if (!mounted) return;
        showCupertinoDialog(
          context: context,
          builder: (context) => CupertinoAlertDialog(
            title: const Text('Lokasi Palsu Terdeteksi'),
            content: const Text('Anda menggunakan aplikasi pemalsu lokasi (Fake GPS). Absensi ditolak demi keamanan dan integritas.'),
            actions: [
              CupertinoDialogAction(isDestructiveAction: true, onPressed: () => Navigator.pop(context), child: const Text('Tutup'))
            ],
          ),
        );
        return;
      }

      bool isOffline = false;
      if (!isWebOrWindows) {
        final List<ConnectivityResult> connectivityResult = await (Connectivity().checkConnectivity());
        isOffline = connectivityResult.contains(ConnectivityResult.none);
      }

      if (isOffline) {
        await _offlineService.savePendingAttendance(
          employeeId: user['id'] ?? 'unknown',
          latitude: position.latitude,
          longitude: position.longitude,
          clockType: widget.clockType, 
          notes: _notesController.text.isNotEmpty ? _notesController.text : 'Offline Mobile check-in',
          photoPath: _photoPath!,
        );
        if (!mounted) return;
        if (hapticEnabled) HapticFeedback.lightImpact();
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('📶 Sinyal Terputus. Absen disimpan secara OFFLINE.'), backgroundColor: CupertinoColors.systemOrange),
        );
        context.go('/main');
      } else {
        final result = await _service.submitAttendance(
          employeeId: user['id'] ?? 'unknown',
          latitude: position.latitude,
          longitude: position.longitude,
          clockType: widget.clockType, 
          notes: _notesController.text.isNotEmpty ? _notesController.text : 'Mobile check-in',
          photoPath: _photoPath!,
        );

        if (!mounted) return;
        if (result['status'] == 'success') {
          if (hapticEnabled) HapticFeedback.mediumImpact();
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('✅ Absen berhasil disimpan'), backgroundColor: CupertinoColors.activeGreen),
          );
          context.go('/main');
        } else {
          final msg = result['message'] ?? 'Gagal absensi. Coba lagi.';
          showCupertinoDialog(
            context: context,
            builder: (ctx) => CupertinoAlertDialog(
              title: const Text('Absensi Gagal'),
              content: Text(msg),
              actions: [
                CupertinoDialogAction(
                  isDefaultAction: true,
                  child: const Text('OK'),
                  onPressed: () => Navigator.pop(ctx),
                ),
              ],
            ),
          );
        }
      }
    } catch (e) {
      if (mounted) {
        final errMsg = e.toString().replaceAll('Exception: ', '');
        showCupertinoDialog(
          context: context,
          builder: (ctx) => CupertinoAlertDialog(
            title: const Text('Terjadi Kesalahan'),
            content: Text(errMsg),
            actions: [
              CupertinoDialogAction(
                isDefaultAction: true,
                child: const Text('OK'),
                onPressed: () => Navigator.pop(ctx),
              ),
            ],
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() { _isProcessing = false; });
      }
    }
  }

  void _showImagePreview() {
    if (_photoPath == null) return;
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        content: Column(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(File(_photoPath!), fit: BoxFit.contain, height: MediaQuery.of(context).size.height * 0.5),
            ),
          ],
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text('Tutup'),
            onPressed: () => Navigator.pop(context),
          )
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;
    
    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        middle: Text(widget.clockType == 'IN' ? 'Form Absen Masuk' : 'Form Absen Pulang'),
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        border: Border(bottom: BorderSide(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5), width: 0.5)),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              GestureDetector(
                onTap: _photoPath != null ? _showImagePreview : null,
                child: Container(
                  height: 300,
                  decoration: BoxDecoration(
                    color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                  ),
                  child: _photoPath != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(15),
                          child: Stack(
                            fit: StackFit.expand,
                            children: [
                              Image.file(File(_photoPath!), fit: BoxFit.contain),
                              Container(
                                color: CupertinoColors.black.withValues(alpha: 0.2),
                                child: const Center(
                                  child: Icon(CupertinoIcons.zoom_in, color: CupertinoColors.white, size: 32),
                                ),
                              )
                            ],
                          ),
                        )
                      : Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(CupertinoIcons.camera_viewfinder, size: 60, color: CupertinoColors.systemGrey.withValues(alpha: 0.5)),
                            const SizedBox(height: 16),
                            const Text('Foto Selfie (Liveness)', style: TextStyle(color: CupertinoColors.systemGrey)),
                          ],
                        ),
                ),
              ),
              const SizedBox(height: 16),

              SizedBox(
                width: double.infinity,
                child: CupertinoButton.filled(
                  onPressed: () async {
                    final photoPath = await context.push<String>('/camera?type=${widget.clockType}');
                    if (photoPath != null) {
                      setState(() {
                        _photoPath = photoPath;
                      });
                    }
                  },
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(CupertinoIcons.camera_fill, size: 20),
                      const SizedBox(width: 8),
                      Text(_photoPath == null ? "AMBIL FOTO WAJAH" : "ULANGI FOTO", style: const TextStyle(fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 24),

              Text('Catatan Kehadiran', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
              const SizedBox(height: 8),
              
              CupertinoTextField(
                controller: _notesController,
                maxLines: 3,
                placeholder: 'Tambahkan catatan (opsional)...',
                onChanged: (val) {
                  if (context.read<ThemeProvider>().hapticEnabled) {
                    HapticFeedback.selectionClick();
                  }
                },
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                ),
              ),
              
              const SizedBox(height: 32),

              _isProcessing
                  ? const Center(child: CupertinoActivityIndicator(radius: 16))
                  : SizedBox(
                      width: double.infinity,
                      child: CupertinoButton(
                        color: CupertinoColors.activeGreen,
                        disabledColor: CupertinoColors.systemGrey3,
                        onPressed: _photoPath != null ? () {
                          HapticFeedback.lightImpact();
                          _submitAttendance();
                        } : null,
                        child: const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(CupertinoIcons.check_mark_circled_solid, size: 20),
                            SizedBox(width: 8),
                            Text("SIMPAN ABSENSI", style: TextStyle(fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                    ),
            ],
          ),
        ),
      ),
    );
  }
}
