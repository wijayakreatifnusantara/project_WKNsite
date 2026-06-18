import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'overtime_service.dart';
import 'overtime_model.dart';

class OvertimeProvider extends ChangeNotifier {
  final OvertimeService _overtimeService = OvertimeService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isSubmitLoading = false;
  bool get isSubmitLoading => _isSubmitLoading;

  List<OvertimeRequest> _requests = [];
  List<OvertimeRequest> get requests => _requests;

  RealtimeChannel? _subscription;

  Future<void> fetchOvertimeRequests(String employeeId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _overtimeService.getMyRequests(employeeId);
      _requests = data;
    } catch (e) {
      debugPrint('Error fetching overtime: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  void subscribeToMyRequests(String employeeId) {
    if (_subscription != null) return;
    _subscription = _overtimeService.subscribeToMyRequests(employeeId, () {
      fetchOvertimeRequests(employeeId);
    });
  }

  void unsubscribe() {
    _subscription?.unsubscribe();
    _subscription = null;
  }

  Future<Map<String, dynamic>> submitOvertimeRequest(Map<String, dynamic> payload) async {
    _isSubmitLoading = true;
    notifyListeners();

    try {
      await _overtimeService.submitOvertimeRequest(payload);
      return {'status': 'success'};
    } catch (e) {
      debugPrint('Error submitting overtime: $e');
      return {'status': 'error', 'message': e.toString()};
    } finally {
      _isSubmitLoading = false;
      notifyListeners();
    }
  }
}
