class OvertimeRequest {
  final String id;
  final String employeeId;
  final String date;
  final String startTime;
  final String endTime;
  final double durationHours;
  final String reason;
  final String status;
  final String? pdfUrl;

  OvertimeRequest({
    required this.id,
    required this.employeeId,
    required this.date,
    required this.startTime,
    required this.endTime,
    required this.durationHours,
    required this.reason,
    required this.status,
    this.pdfUrl,
  });

  factory OvertimeRequest.fromJson(Map<String, dynamic> json) {
    return OvertimeRequest(
      id: json['id']?.toString() ?? '',
      employeeId: json['employee_id']?.toString() ?? '',
      date: json['date'] ?? '',
      startTime: json['start_time'] ?? '',
      endTime: json['end_time'] ?? '',
      durationHours: (json['duration_hours'] ?? 0).toDouble(),
      reason: json['reason'] ?? '',
      status: json['status'] ?? 'Pending',
      pdfUrl: json['pdf_url'],
    );
  }
}
