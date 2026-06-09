import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/foundation.dart'; // Added for kIsWeb
import 'dart:io'; 
import 'dart:ui';
import 'package:connectivity_plus/connectivity_plus.dart';

import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/attendance_service.dart';
import '../data/offline_attendance_service.dart';
import '../utils/liveness_checker.dart';
import '../../../core/utils/biometric_helper.dart';
import '../../../core/utils/watermark_service.dart';

class CameraScreen extends StatefulWidget {
  final String clockType;
  const CameraScreen({super.key, this.clockType = 'IN'});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> {
  CameraController? _controller;
  List<CameraDescription> cameras = [];
  bool _isReady = false;
  bool _isProcessing = false;
  bool _isLivenessPassed = false;
  bool _isFakeGps = false;
  Position? _currentPosition;
  final AttendanceService _service = AttendanceService();
  final OfflineAttendanceService _offlineService = OfflineAttendanceService();
  final LivenessChecker _livenessChecker = LivenessChecker();

  @override
  void initState() {
    super.initState();
    _livenessChecker.initialize();
    _initCameraAndLocation();
  }

  Future<void> _initCameraAndLocation() async {
    try {
      // 1. Get Location
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Akses lokasi ditolak');
        }
      }
      
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.high,
      );
      
      // Anti Fake GPS (Mock Location Detection)
      if (_currentPosition!.isMocked) {
        if (mounted) {
          setState(() {
            _isFakeGps = true;
          });
        }
      }

      // 2. Initialize Camera (Front camera usually preferred for attendance)
      cameras = await availableCameras();
      final frontCamera = cameras.firstWhere(
        (cam) => cam.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _controller = CameraController(
        frontCamera,
        ResolutionPreset.high,
        enableAudio: false,
      );

      await _controller!.initialize();
      
      // 3. Start Image Stream for Liveness Detection
      if (_livenessChecker.isReady) {
        _controller!.startImageStream((image) async {
          if (!_isLivenessPassed && mounted) {
            bool passed = await _livenessChecker.checkLiveness(image, frontCamera);
            if (passed && mounted) {
              setState(() {
                _isLivenessPassed = true;
              });
              // Stop stream to save battery once passed
              await _controller!.stopImageStream();
            }
          }
        });
      }

      if (!mounted) return;
      setState(() {
        _isReady = true;
      });
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  @override
  void dispose() {
    _controller?.dispose();
    super.dispose();
  }

  Future<void> _takePictureAndPreview() async {
    if (!_controller!.value.isInitialized || _isProcessing || _isFakeGps) return;

    // Ekstra Keamanan dinonaktifkan sementara agar absen lebih cepat
    // final biometricHelper = BiometricHelper();
    // bool authenticated = await biometricHelper.authenticate();
    bool authenticated = true;
    
    if (!authenticated) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Verifikasi Biometrik gagal atau dibatalkan. Absensi tidak dapat diproses.'), backgroundColor: Colors.red),
        );
      }
      return;
    }

    setState(() {
      _isProcessing = true;
    });

    try {
      final user = context.read<AuthProvider>().userData;
      final image = await _controller!.takePicture();

      if (user == null || _currentPosition == null) {
        throw Exception('Data sesi atau lokasi tidak valid');
      }

      // ----------------------------------------------------
      // TERAPKAN WATERMARK / TIMESTAMP WKN VERIFIED
      // ----------------------------------------------------
      final watermarkedFile = await WatermarkService.addWatermark(
        imageFile: File(image.path),
        employeeName: user['full_name'] ?? user['email'] ?? 'Unknown',
        employeeId: user['id_karyawan'] ?? user['id']?.toString().substring(0, 8) ?? 'ID',
        latitude: _currentPosition!.latitude,
        longitude: _currentPosition!.longitude,
        address: 'Titik Absen Terdeteksi GPS', 
        isCheckOut: widget.clockType == 'OUT',
      );
      final finalPhotoPath = watermarkedFile.path;
      // ----------------------------------------------------

      if (mounted) {
        _showImagePreviewDialog(watermarkedFile);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Gagal mengambil gambar: $e')),
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

  void _showImagePreviewDialog(File imageFile) {
    final TextEditingController notesController = TextEditingController();
    
    showDialog(
      context: context,
      barrierDismissible: false,
      barrierColor: Colors.white.withValues(alpha: 0.7), 
      builder: (context) => BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 8, sigmaY: 8), 
        child: Dialog(
          backgroundColor: Colors.transparent,
          insetPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.2), width: 1),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.4), blurRadius: 30, offset: const Offset(0, 10)),
                    ],
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(15),
                    child: Image.file(
                      imageFile,
                      fit: BoxFit.contain,
                      height: MediaQuery.of(context).size.height * 0.5,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 8),
                  child: TextField(
                    controller: notesController,
                    maxLines: 2,
                    decoration: const InputDecoration(
                      hintText: 'Tambahkan catatan (opsional)...',
                      border: InputBorder.none,
                      icon: Icon(Icons.edit_note, color: Colors.grey),
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                      },
                      icon: const Icon(Icons.refresh_rounded),
                      label: const Text("ULANGI"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.white,
                        foregroundColor: Colors.black,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                    ElevatedButton.icon(
                      onPressed: () {
                        Navigator.pop(context);
                        _submitAttendance(imageFile, notesController.text.trim());
                      },
                      icon: const Icon(Icons.check_rounded),
                      label: const Text("LANJUTKAN"),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF2563EB),
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Future<void> _submitAttendance(File finalImage, [String customNotes = '']) async {
    setState(() {
      _isProcessing = true;
    });
    try {
      final user = context.read<AuthProvider>().userData;
      final isWebOrWindows = kIsWeb || (!Platform.isAndroid && !Platform.isIOS);
      
      bool isOffline = false;
      if (!isWebOrWindows) {
        final List<ConnectivityResult> connectivityResult = await (Connectivity().checkConnectivity());
        isOffline = connectivityResult.contains(ConnectivityResult.none);
      }

      if (isOffline) {
        await _offlineService.savePendingAttendance(
          employeeId: user?['id'] ?? 'unknown',
          latitude: _currentPosition!.latitude,
          longitude: _currentPosition!.longitude,
          clockType: widget.clockType, 
          notes: customNotes.isNotEmpty ? customNotes : 'Offline Mobile check-in',
          photoPath: finalImage.path,
        );
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('📶 Sinyal Terputus. Absen disimpan secara OFFLINE.'), backgroundColor: Colors.orange),
        );
        context.go('/main');
      } else {
        final result = await _service.submitAttendance(
          employeeId: user?['id'] ?? 'unknown',
          latitude: _currentPosition!.latitude,
          longitude: _currentPosition!.longitude,
          clockType: widget.clockType, 
          notes: customNotes.isNotEmpty ? customNotes : 'Mobile check-in',
          photoPath: finalImage.path,
        );

        if (!mounted) return;
        if (result['status'] == 'success') {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('✅ Absen berhasil disimpan'), backgroundColor: Colors.green),
          );
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
    if (!_isReady || _controller == null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Stack(
          children: [
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppConstants.primaryColor),
                  SizedBox(height: 16),
                  Text('Menyiapkan Kamera & Lokasi...', style: TextStyle(color: Colors.white)),
                ],
              ),
            ),
            Positioned(
              top: 50,
              right: 16,
              child: IconButton(
                icon: const Icon(Icons.close, color: Colors.white, size: 30),
                onPressed: () {
                  context.go('/main');
                },
              ),
            )
          ],
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      body: Stack(
        children: [
          SizedBox.expand(
            child: FittedBox(
              fit: BoxFit.cover,
              child: SizedBox(
                width: _controller!.value.previewSize?.height ?? 100,
                height: _controller!.value.previewSize?.width ?? 100 * _controller!.value.aspectRatio,
                child: CameraPreview(_controller!),
              ),
            ),
          ),
          
          // Overlay overlay to show location/time
          Positioned(
            top: 50,
            left: 16,
            right: 16,
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: Colors.black54,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('📍 Lokasi Terkini', style: TextStyle(color: Colors.white70, fontSize: 12)),
                  Text(
                    _currentPosition != null ? '${_currentPosition!.latitude}, ${_currentPosition!.longitude}' : 'Mencari...',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                  if (_isFakeGps)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.redAccent.withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.gpp_bad_rounded, color: Colors.white, size: 16),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'FAKE GPS TERDETEKSI! Matikan Mock Location untuk absen.',
                              style: TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),

          // Liveness Instruction
          if (!_isLivenessPassed)
            Positioned(
              bottom: 140,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  color: Colors.redAccent.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: const Text(
                  'Arahkan wajah ke kamera, lalu Tersenyum atau Berkedip!',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),

          // Capture Button
          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: _isProcessing 
                ? const CircularProgressIndicator(color: AppConstants.primaryColor)
                : GestureDetector(
                    onTap: (_isLivenessPassed && !_isFakeGps) ? _takePictureAndPreview : null,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: (_isLivenessPassed && !_isFakeGps) ? Colors.white : Colors.grey, width: 4),
                        color: (_isLivenessPassed && !_isFakeGps) ? AppConstants.primaryColor : Colors.grey.withValues(alpha: 0.5),
                      ),
                      child: Icon(
                        (_isLivenessPassed && !_isFakeGps) ? Icons.camera_alt : Icons.lock_outline, 
                        color: Colors.white, 
                        size: 36
                      ),
                    ),
                  ),
            ),
          ),

          // Close button
          Positioned(
            top: 50,
            right: 16,
            child: IconButton(
              icon: const Icon(Icons.close, color: Colors.white, size: 30),
              onPressed: () {
                context.go('/main');
              },
            ),
          )
        ],
      ),
    );
  }
}
