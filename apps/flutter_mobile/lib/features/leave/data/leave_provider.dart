import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'leave_service.dart';
import 'leave_model.dart';

class LeaveProvider extends ChangeNotifier {
  final LeaveService _leaveService = LeaveService();

  bool _isLoading = false;
  bool get isLoading => _isLoading;

  bool _isSubmitLoading = false;
  bool get isSubmitLoading => _isSubmitLoading;

  List<LeaveRequest> _requests = [];
  List<LeaveRequest> get requests => _requests;

  int _computedDays = 0;
  int get computedDays => _computedDays;

  Future<void> fetchLeaveRequests(String userId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final data = await _leaveService.getMyRequests(userId);
      _requests = data;
    } catch (e) {
      debugPrint('Error fetching leaves: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<Map<String, dynamic>> submitLeaveRequest(Map<String, dynamic> payload) async {
    _isSubmitLoading = true;
    notifyListeners();

    try {
      final result = await _leaveService.submitLeaveRequest(payload);
      return result;
    } catch (e) {
      debugPrint('Error submitting leave: $e');
      return {'status': 'error', 'message': e.toString()};
    } finally {
      _isSubmitLoading = false;
      notifyListeners();
    }
  }

  void calculateDaysCount(String startStr, String endStr) {
    final RegExp dateRegex = RegExp(r'^\d{4}-\d{2}-\d{2}$');

    if (!dateRegex.hasMatch(startStr) || !dateRegex.hasMatch(endStr)) {
      _computedDays = 0;
      notifyListeners();
      return;
    }

    try {
      final start = DateTime.parse(startStr);
      final end = DateTime.parse(endStr);

      if (start.isAfter(end)) {
        _computedDays = 0;
        notifyListeners();
        return;
      }

      int count = 0;
      DateTime cur = start;
      while (!cur.isAfter(end)) {
        if (cur.weekday != DateTime.saturday && cur.weekday != DateTime.sunday) {
          count++;
        }
        cur = cur.add(const Duration(days: 1));
      }
      if (_computedDays != count) {
        _computedDays = count;
        notifyListeners();
      }
    } catch (e) {
      _computedDays = 0;
      notifyListeners();
    }
  }

  void resetComputedDays() {
    _computedDays = 0;
    notifyListeners();
  }
}
