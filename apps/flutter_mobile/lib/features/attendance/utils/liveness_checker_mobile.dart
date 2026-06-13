import 'dart:io';
import 'package:flutter/foundation.dart';
import 'dart:ui';
import 'package:camera/camera.dart';
import 'package:google_mlkit_face_detection/google_mlkit_face_detection.dart';

class LivenessChecker {
  late final FaceDetector _faceDetector;
  bool _isInitialized = false;
  bool _isProcessing = false;

  bool get isReady => _isInitialized;

  void initialize() {
    final options = FaceDetectorOptions(
      enableClassification: true, // Needed for smile and blink detection
      enableTracking: true,
      performanceMode: FaceDetectorMode.fast,
    );
    _faceDetector = FaceDetector(options: options);
    _isInitialized = true;
  }

  void dispose() {
    if (_isInitialized) {
      _faceDetector.close();
    }
  }

  bool _hasSeenEyesOpen = false;

  Future<bool> checkLiveness(CameraImage image, CameraDescription camera) async {
    if (!_isInitialized || _isProcessing) return false;
    
    // Bypass for non-mobile platforms just in case
    if (kIsWeb || (!Platform.isAndroid && !Platform.isIOS)) {
      return true;
    }

    _isProcessing = true;
    try {
      final inputImage = _inputImageFromCameraImage(image, camera);
      if (inputImage == null) return false;

      final faces = await _faceDetector.processImage(inputImage);
      
      for (Face face in faces) {
        final double? smileProb = face.smilingProbability;
        final double? leftEyeProb = face.leftEyeOpenProbability;
        final double? rightEyeProb = face.rightEyeOpenProbability;

        // 1. Deteksi Senyum (Threshold cukup tinggi agar tidak false positive, tapi bisa membaca senyuman jelas)
        bool isSmiling = smileProb != null && smileProb > 0.65;
        if (isSmiling) {
          debugPrint("Liveness: Senyum Terdeteksi ($smileProb)");
          return true;
        }

        // 2. Deteksi Kedipan Mata (Stateful: Mata Terbuka -> Tertutup)
        if (leftEyeProb != null && rightEyeProb != null) {
          bool areEyesOpen = leftEyeProb > 0.8 && rightEyeProb > 0.8;
          bool areEyesClosed = leftEyeProb < 0.2 && rightEyeProb < 0.2;

          if (areEyesOpen) {
            _hasSeenEyesOpen = true; // Rekam bahwa pengguna telah membuka matanya lebar-lebar
          }

          if (_hasSeenEyesOpen && areEyesClosed) {
            debugPrint("Liveness: Kedipan Mata Terdeteksi");
            return true;
          }
        }
      }
      return false;
    } catch (e) {
      debugPrint('Liveness Error: $e');
      return false;
    } finally {
      _isProcessing = false;
    }
  }

  InputImage? _inputImageFromCameraImage(CameraImage image, CameraDescription camera) {
    // Platform specific conversion for Android/iOS
    if (Platform.isAndroid || Platform.isIOS) {
      final format = InputImageFormatValue.fromRawValue(image.format.raw);
      if (format == null) return null;
      
      final allBytes = WriteBuffer();
      for (final plane in image.planes) {
        allBytes.putUint8List(plane.bytes);
      }
      final bytes = allBytes.done().buffer.asUint8List();

      return InputImage.fromBytes(
        bytes: bytes,
        metadata: InputImageMetadata(
          size: Size(image.width.toDouble(), image.height.toDouble()),
          rotation: InputImageRotationValue.fromRawValue(camera.sensorOrientation) ?? InputImageRotation.rotation0deg,
          format: format,
          bytesPerRow: image.planes.first.bytesPerRow,
        ),
      );
    }
    return null;
  }
}
