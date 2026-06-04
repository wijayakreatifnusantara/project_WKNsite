class LeaveRequest {
  final String id;
  final String employeeId;
  final String leaveType;
  final String startDate;
  final String endDate;
  final String? startTime;
  final String? endTime;
  final String reason;
  final String status;
  final int daysCount;
  final String? pdfUrl;

  LeaveRequest({
    required this.id,
    required this.employeeId,
    required this.leaveType,
    required this.startDate,
    required this.endDate,
    this.startTime,
    this.endTime,
    required this.reason,
    required this.status,
    required this.daysCount,
    this.pdfUrl,
  });

  factory LeaveRequest.fromJson(Map<String, dynamic> json) {
    return LeaveRequest(
      id: json['id']?.toString() ?? '',
      employeeId: json['employee_id']?.toString() ?? '',
      leaveType: json['leave_type'] ?? 'Annual',
      startDate: json['start_date'] ?? '',
      endDate: json['end_date'] ?? '',
      startTime: json['start_time'],
      endTime: json['end_time'],
      reason: json['reason'] ?? '',
      status: json['status'] ?? 'Pending',
      daysCount: json['days_count'] ?? 0,
      pdfUrl: json['pdf_url'],
    );
  }
}
