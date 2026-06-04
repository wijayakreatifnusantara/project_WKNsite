// liveness_checker_web.dart
import 'package:camera/camera.dart';

class LivenessChecker {
  bool get isReady => true;
  
  void initialize() {}
  
  void dispose() {}
  
  Future<bool> checkLiveness(CameraImage image, CameraDescription camera) async {
    // Bypass for web/windows
    return true; 
  }
}
