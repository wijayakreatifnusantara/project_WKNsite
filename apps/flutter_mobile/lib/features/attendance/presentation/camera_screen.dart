import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
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
import '../../../core/utils/watermark_service.dart';
import '../../../core/utils/notification_service.dart';

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

  // Geo-Fencing Sync (Admin Control)
  Map<String, dynamic>? _targetLocation;
  double _distanceToLocation = 0.0;
  bool _isInsideZone = false;
  double _allowedRadius = 100.0; // Default until loaded

  @override
  void initState() {
    super.initState();
    _livenessChecker.initialize();
    _initCameraAndLocation();
  }

  void _calculateDistance() {
    if (_currentPosition == null || _targetLocation == null) return;
    
    if (_targetLocation!['isFlexible']) {
      _distanceToLocation = 0;
      _isInsideZone = true;
      return;
    }

    _distanceToLocation = Geolocator.distanceBetween(
      _currentPosition!.latitude,
      _currentPosition!.longitude,
      _targetLocation!['lat'],
      _targetLocation!['lng'],
    );
    
    _isInsideZone = _distanceToLocation <= _allowedRadius;
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

      // Sinkronisasi Geo-Fence dari Web Admin
      if (mounted) {
        final userData = context.read<AuthProvider>().userData;
        final settingsRes = await _service.getAttendanceSettings();
        
        if (settingsRes['status'] == 'success' && userData != null) {
          final data = settingsRes['data'];
          final hqConfig = data['hq_location'] ?? {'name': 'WKN HQ', 'lat': -6.2088, 'lon': 106.8456, 'radius': 100};
          final allowFreeGlobal = data['allow_free_attendance'] == true;
          final isFieldTeam = userData['is_field_team'] == true;
          
          if (allowFreeGlobal || isFieldTeam) {
            _targetLocation = {
              'name': allowFreeGlobal ? 'Bebas Absen Global' : 'Lokasi Lapangan Bebas',
              'lat': 0.0, 
              'lng': 0.0, 
              'isFlexible': true
            };
          } else {
            // Check specific working location
            final workingLocName = userData['working_location'];
            final locations = (data['working_locations'] as List<dynamic>?) ?? [];
            
            Map<String, dynamic>? matchedLoc;
            for (var loc in locations) {
              if (loc['name'] == workingLocName) {
                matchedLoc = loc;
                break;
              }
            }
            
            if (matchedLoc != null) {
              _targetLocation = {
                'name': matchedLoc['name'],
                'lat': (matchedLoc['lat'] ?? 0).toDouble(),
                'lng': (matchedLoc['lon'] ?? 0).toDouble(), // Supabase API uses 'lon'
                'isFlexible': false
              };
              _allowedRadius = (matchedLoc['radius'] ?? 100).toDouble();
            } else {
              _targetLocation = {
                'name': hqConfig['name'],
                'lat': (hqConfig['lat'] ?? 0).toDouble(),
                'lng': (hqConfig['lon'] ?? 0).toDouble(),
                'isFlexible': false
              };
              _allowedRadius = (hqConfig['radius'] ?? 100).toDouble();
            }
          }
        } else {
          // Fallback if failed to fetch
          _targetLocation = {'name': 'Gagal memuat konfigurasi. Pastikan internet menyala.', 'lat': 0.0, 'lng': 0.0, 'isFlexible': true};
        }
        
        setState(() {}); // Trigger rebuild to show updated UI
      }

      _calculateDistance();

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
        imageFormatGroup: Platform.isAndroid ? ImageFormatGroup.nv21 : ImageFormatGroup.bgra8888,
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
    if (!_controller!.value.isInitialized || _isProcessing || _isFakeGps || !_isInsideZone) return;

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
        employeeId: user['id_karyawan'] ??
            (user['id'] != null && user['id'].toString().length > 8
                ? user['id'].toString().substring(0, 8)
                : (user['id']?.toString() ?? 'ID')),
        latitude: _currentPosition!.latitude,
        longitude: _currentPosition!.longitude,
        address: 'Titik Absen: ${_targetLocation?['name'] ?? 'Unknown'} (${_isInsideZone ? 'Dalam Zona' : 'Luar Zona'})', 
        isCheckOut: widget.clockType == 'OUT',
      );
      final finalPhotoPath = watermarkedFile.path;
      // ----------------------------------------------------

      if (mounted) {
        context.pop(finalPhotoPath);
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
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: AppConstants.primaryColor),
                  SizedBox(height: 16),
                  Text('Menyiapkan Kamera & Lokasi...', style: TextStyle(color: context.surfaceColor)),
                ],
              ),
            ),
            Positioned(
              top: 50,
              right: 16,
              child: IconButton(
                icon: Icon(Icons.close, color: context.surfaceColor, size: 30),
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
          
          // Overlay overlay to show location/time/geofence
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
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('📍 Titik Absen (Dikunci Admin)', style: TextStyle(color: Colors.white70, fontSize: 12)),
                      if (_targetLocation != null)
                         Text(
                           _targetLocation!['name'],
                           style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                         )
                      else if (_currentPosition != null)
                         const Text('Memuat konfigurasi...', style: TextStyle(color: Colors.amber, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (_currentPosition != null)
                    Row(
                      children: [
                        Icon(
                          _isInsideZone ? Icons.check_circle : Icons.cancel,
                          color: _isInsideZone ? Colors.greenAccent : Colors.redAccent,
                          size: 16,
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            (_targetLocation?['isFlexible'] ?? false)
                                ? 'Zona Bebas Aktif' 
                                : _isInsideZone 
                                    ? 'Di Dalam Zona (Jarak: ${_distanceToLocation.toStringAsFixed(0)}m)'
                                    : 'DI LUAR ZONA! Jarak: ${_distanceToLocation.toStringAsFixed(0)}m / ${_allowedRadius.toStringAsFixed(0)} m',
                            style: TextStyle(
                              color: _isInsideZone ? Colors.greenAccent : Colors.redAccent, 
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    )
                  else
                    const Text('Mencari sinyal GPS...', style: TextStyle(color: Colors.amber)),
                  
                  if (_isFakeGps)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: Colors.redAccent.withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        children: [
                          Icon(Icons.gpp_bad_rounded, color: context.surfaceColor, size: 16),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'FAKE GPS TERDETEKSI! Matikan Mock Location untuk absen.',
                              style: TextStyle(color: context.surfaceColor, fontSize: 10, fontWeight: FontWeight.bold),
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
                child: Text(
                  'Arahkan wajah ke kamera, lalu Tersenyum atau Berkedip!',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, fontSize: 14),
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
                        border: Border.all(color: (_isLivenessPassed && !_isFakeGps) ? context.surfaceColor : Colors.grey, width: 4),
                        color: (_isLivenessPassed && !_isFakeGps) ? AppConstants.primaryColor : Colors.grey.withValues(alpha: 0.5),
                      ),
                      child: Icon(
                        (_isLivenessPassed && !_isFakeGps) ? Icons.camera_alt : Icons.lock_outline, 
                        color: context.surfaceColor, 
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
              icon: Icon(Icons.close, color: context.surfaceColor, size: 30),
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
