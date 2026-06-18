import 'package:flutter/cupertino.dart';
import 'package:camera/camera.dart';
import 'package:geolocator/geolocator.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter/foundation.dart';
import 'dart:io'; 

import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/attendance_service.dart';
import '../utils/liveness_checker.dart';
import '../../../core/utils/watermark_service.dart';

class CameraScreen extends StatefulWidget {
  final String clockType;
  const CameraScreen({super.key, this.clockType = 'IN'});

  @override
  State<CameraScreen> createState() => _CameraScreenState();
}

class _CameraScreenState extends State<CameraScreen> with WidgetsBindingObserver {
  CameraController? _controller;
  List<CameraDescription> cameras = [];
  bool _isReady = false;
  bool _isProcessing = false;
  bool _isLivenessPassed = false;
  bool _isFakeGps = false;
  Position? _currentPosition;
  final AttendanceService _service = AttendanceService();
  final LivenessChecker _livenessChecker = LivenessChecker();

  // Geo-Fencing Sync (Admin Control)
  Map<String, dynamic>? _targetLocation;
  double _distanceToLocation = 0.0;
  bool _isInsideZone = false;
  double _allowedRadius = 100.0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _livenessChecker.initialize();
    _initCamera();
    _initLocationAndSettings();
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

  Future<void> _initCamera() async {
    try {
      cameras = await availableCameras();
      final frontCamera = cameras.firstWhere(
        (cam) => cam.lensDirection == CameraLensDirection.front,
        orElse: () => cameras.first,
      );

      _controller = CameraController(
        frontCamera,
        ResolutionPreset.medium,
        enableAudio: false,
        imageFormatGroup: Platform.isAndroid ? ImageFormatGroup.nv21 : ImageFormatGroup.bgra8888,
      );

      await _controller!.initialize();

      if (_livenessChecker.isReady) {
        _controller!.startImageStream((image) async {
          if (!_isLivenessPassed && mounted) {
            bool passed = await _livenessChecker.checkLiveness(image, frontCamera);
            if (passed && mounted) {
              setState(() {
                _isLivenessPassed = true;
              });
              await _controller!.stopImageStream();
            }
          }
        });
      }

      if (mounted) {
        setState(() {
          _isReady = true;
        });
      }
    } catch (e) {
      if (mounted) {
        // Fallback or warning
        debugPrint('Camera init error: $e');
      }
    }
  }

  Future<void> _initLocationAndSettings() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
        if (permission == LocationPermission.denied) {
          throw Exception('Akses lokasi ditolak');
        }
      }
      
      _currentPosition = await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium,
      );
      
      if (_currentPosition!.isMocked) {
        if (mounted) setState(() => _isFakeGps = true);
      }

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
                'lng': (matchedLoc['lon'] ?? 0).toDouble(),
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
          _targetLocation = {'name': 'Gagal memuat konfigurasi. Pastikan internet menyala.', 'lat': 0.0, 'lng': 0.0, 'isFlexible': true};
        }
        
        _calculateDistance();
        setState(() {});
      }
    } catch (e) {
      if (mounted) {
        debugPrint('Location error: $e');
      }
    }
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _controller?.dispose();
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final CameraController? cameraController = _controller;
    if (cameraController == null || !cameraController.value.isInitialized) return;

    if (state == AppLifecycleState.inactive || state == AppLifecycleState.paused) {
      cameraController.dispose();
      _controller = null;
      setState(() {
        _isReady = false;
      });
    } else if (state == AppLifecycleState.resumed) {
      _initCamera();
    }
  }

  Future<void> _takePictureAndPreview() async {
    if (!_controller!.value.isInitialized || _isProcessing || _isFakeGps || !_isInsideZone) return;

    setState(() => _isProcessing = true);

    // Cache context-dependent values BEFORE any await
    final user = context.read<AuthProvider>().userData;
    final currentPos = _currentPosition;
    final targetLoc = _targetLocation;

    try {
      if (user == null || currentPos == null) {
        throw Exception('Data sesi atau lokasi tidak valid. Coba tutup dan buka kembali kamera.');
      }

      // Hentikan image stream sebelum mengambil foto
      if (_controller!.value.isStreamingImages) {
        await _controller!.stopImageStream();
      }

      final image = await _controller!.takePicture();

      final watermarkedFile = await WatermarkService.addWatermark(
        imageFile: File(image.path),
        employeeName: user['name'] ?? user['email'] ?? 'Unknown',
        employeeId: user['id_karyawan'] ??
            (user['id'] != null && user['id'].toString().length > 8
                ? user['id'].toString().substring(0, 8)
                : (user['id']?.toString() ?? 'ID')),
        latitude: currentPos.latitude,
        longitude: currentPos.longitude,
        address: 'Titik Absen: ${targetLoc?['name'] ?? 'Unknown'} (${_isInsideZone ? 'Dalam Zona' : 'Luar Zona'})', 
        isCheckOut: widget.clockType == 'OUT',
      );
      final finalPhotoPath = watermarkedFile.path;

      if (mounted) {
        context.pop(finalPhotoPath);
      }
    } catch (e) {
      debugPrint('Capture error: $e');
      if (mounted) {
        showCupertinoDialog(
          context: context,
          builder: (ctx) => CupertinoAlertDialog(
            title: const Text('Gagal Mengambil Foto'),
            content: Text(e.toString().replaceAll('Exception: ', '')),
            actions: [
              CupertinoDialogAction(
                isDefaultAction: true,
                onPressed: () {
                  Navigator.pop(ctx);
                  // Coba mulai ulang kamera
                  _initCamera();
                },
                child: const Text('Coba Lagi'),
              ),
              CupertinoDialogAction(
                isDestructiveAction: true,
                onPressed: () {
                  Navigator.pop(ctx);
                  context.go('/main');
                },
                child: const Text('Keluar'),
              ),
            ],
          ),
        );
      }
    } finally {
      if (mounted) setState(() => _isProcessing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (!_isReady || _controller == null) {
      return CupertinoPageScaffold(
        backgroundColor: CupertinoColors.black,
        child: Stack(
          children: [
            const Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CupertinoActivityIndicator(radius: 16),
                  SizedBox(height: 16),
                  Text('Menyiapkan Kamera & Lokasi...', style: TextStyle(color: CupertinoColors.white)),
                ],
              ),
            ),
            Positioned(
              top: 50,
              right: 16,
              child: CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () => context.go('/main'),
                child: const Icon(CupertinoIcons.clear, color: CupertinoColors.white, size: 30),
              ),
            )
          ],
        ),
      );
    }

    return CupertinoPageScaffold(
      backgroundColor: CupertinoColors.black,
      child: Stack(
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
          
          Positioned(
            top: 60,
            left: 16,
            right: 60, // give space for close button
            child: Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: CupertinoColors.black.withValues(alpha: 0.6),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('📍 Titik Absen (Dikunci Admin)', style: TextStyle(color: CupertinoColors.systemGrey3, fontSize: 12)),
                      if (_targetLocation != null)
                         Expanded(
                           child: Text(
                             _targetLocation!['name'],
                             style: const TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 12),
                             textAlign: TextAlign.right,
                             maxLines: 1,
                             overflow: TextOverflow.ellipsis,
                           ),
                         )
                      else if (_currentPosition != null)
                         const Text('Memuat konfigurasi...', style: TextStyle(color: CupertinoColors.systemYellow, fontSize: 12)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (_currentPosition != null)
                    Row(
                      children: [
                        Icon(
                          _isInsideZone ? CupertinoIcons.check_mark_circled_solid : CupertinoIcons.xmark_circle_fill,
                          color: _isInsideZone ? CupertinoColors.activeGreen : CupertinoColors.destructiveRed,
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
                              color: _isInsideZone ? CupertinoColors.activeGreen : CupertinoColors.destructiveRed, 
                              fontWeight: FontWeight.bold,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    )
                  else
                    const Text('Mencari sinyal GPS...', style: TextStyle(color: CupertinoColors.systemYellow, fontSize: 12)),
                  
                  if (_isFakeGps)
                    Container(
                      margin: const EdgeInsets.only(top: 8),
                      padding: const EdgeInsets.all(8),
                      decoration: BoxDecoration(
                        color: CupertinoColors.destructiveRed.withValues(alpha: 0.9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(CupertinoIcons.exclamationmark_shield_fill, color: CupertinoColors.white, size: 16),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'FAKE GPS TERDETEKSI! Matikan Mock Location untuk absen.',
                              style: TextStyle(color: CupertinoColors.white, fontSize: 10, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
          ),

          if (!_isLivenessPassed)
            Positioned(
              bottom: 140,
              left: 16,
              right: 16,
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
                decoration: BoxDecoration(
                  color: CupertinoColors.destructiveRed.withValues(alpha: 0.9),
                  borderRadius: BorderRadius.circular(30),
                ),
                child: const Text(
                  'Arahkan wajah ke kamera, lalu Tersenyum atau Berkedip!',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ),

          Positioned(
            bottom: 40,
            left: 0,
            right: 0,
            child: Center(
              child: _isProcessing 
                ? const CupertinoActivityIndicator(radius: 16)
                : GestureDetector(
                    onTap: (_isLivenessPassed && !_isFakeGps) ? _takePictureAndPreview : null,
                    child: Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: (_isLivenessPassed && !_isFakeGps) ? CupertinoColors.white : CupertinoColors.systemGrey, width: 4),
                        color: (_isLivenessPassed && !_isFakeGps) ? AppConstants.primaryColor : CupertinoColors.systemGrey.withValues(alpha: 0.5),
                      ),
                      child: Icon(
                        (_isLivenessPassed && !_isFakeGps) ? CupertinoIcons.camera_fill : CupertinoIcons.lock_fill, 
                        color: CupertinoColors.white, 
                        size: 36
                      ),
                    ),
                  ),
            ),
          ),

          Positioned(
            top: 50,
            right: 16,
            child: CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: () => context.go('/main'),
              child: const Icon(CupertinoIcons.clear, color: CupertinoColors.white, size: 30),
            ),
          )
        ],
      ),
    );
  }
}
