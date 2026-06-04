import 'package:flutter/material.dart';
import 'package:camera/camera.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/foundation.dart'; // Added for kIsWeb
import 'dart:io'; // Added for Platform
import 'package:connectivity_plus/connectivity_plus.dart';

import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/attendance_service.dart';
import '../data/offline_attendance_service.dart';
import '../utils/liveness_checker.dart';

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
        throw Exception('⚠️ FAKE GPS TERDETEKSI!\nHarap matikan aplikasi Fake GPS (Mock Location) untuk dapat melakukan absensi.');
      }

      // 2. Initialize Camera (Front camera usually preferred for attendance)
      cameras = await availableCameras();
      final frontCamera = cameras.firstWhere(
        (cam) => cam.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _controller = CameraController(
        frontCamera,
        ResolutionPreset.medium,
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

  Future<void> _takePictureAndSubmit() async {
    if (!_controller!.value.isInitialized || _isProcessing) return;

    setState(() {
      _isProcessing = true;
    });

    try {
      final user = context.read<AuthProvider>().userData;
      final image = await _controller!.takePicture();

      if (user == null || _currentPosition == null) {
        throw Exception('Data sesi atau lokasi tidak valid');
      }

      // We need to know if it's Clock IN or OUT. 
      final isWebOrWindows = kIsWeb || (!Platform.isAndroid && !Platform.isIOS);
      
      // Check Connectivity (Only for Mobile where connectivity_plus is fully supported)
      bool isOffline = false;
      if (!isWebOrWindows) {
        final List<ConnectivityResult> connectivityResult = await (Connectivity().checkConnectivity());
        isOffline = connectivityResult.contains(ConnectivityResult.none);
      }

      if (isOffline) {
        // Save Offline
        await _offlineService.savePendingAttendance(
          employeeId: user['id'] ?? 'unknown',
          latitude: _currentPosition!.latitude,
          longitude: _currentPosition!.longitude,
          clockType: widget.clockType, 
          notes: 'Offline Mobile check-in',
          photoPath: image.path,
        );
        
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('📶 Sinyal Terputus. Absen disimpan secara OFFLINE (Lokal).'), backgroundColor: Colors.orange),
        );
        context.go('/main');
      } else {
        // Online Submit
        final result = await _service.submitAttendance(
          employeeId: user['id'] ?? 'unknown',
          latitude: _currentPosition!.latitude,
          longitude: _currentPosition!.longitude,
          clockType: widget.clockType, 
          notes: 'Mobile check-in',
          photoPath: image.path,
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
          SizedBox(
            width: double.infinity,
            height: double.infinity,
            child: CameraPreview(_controller!),
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
                  color: Colors.redAccent.withOpacity(0.9),
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
                    onTap: _isLivenessPassed ? _takePictureAndSubmit : null,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: _isLivenessPassed ? Colors.white : Colors.grey, width: 4),
                        color: _isLivenessPassed ? AppConstants.primaryColor : Colors.grey.withOpacity(0.5),
                      ),
                      child: Icon(
                        _isLivenessPassed ? Icons.camera_alt : Icons.lock_outline, 
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
