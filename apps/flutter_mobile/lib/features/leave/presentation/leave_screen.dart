import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/leave_service.dart';
import '../data/leave_model.dart';

class LeaveScreen extends StatefulWidget {
  const LeaveScreen({super.key});

  @override
  State<LeaveScreen> createState() => _LeaveScreenState();
}

class _LeaveScreenState extends State<LeaveScreen> {
  final LeaveService _leaveService = LeaveService();
  bool _isLoading = false;
  bool _isSubmitLoading = false;
  bool _showForm = false;
  List<LeaveRequest> _requests = [];

  // Form Fields
  String _leaveType = 'Annual';
  final TextEditingController _startDateCtrl = TextEditingController();
  final TextEditingController _endDateCtrl = TextEditingController();
  final TextEditingController _reasonCtrl = TextEditingController();
  final TextEditingController _startTimeCtrl = TextEditingController();
  final TextEditingController _endTimeCtrl = TextEditingController();
  int _computedDays = 0;

  @override
  void initState() {
    super.initState();
    _startDateCtrl.addListener(_calculateDaysCount);
    _endDateCtrl.addListener(_calculateDaysCount);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchLeaveRequests();
    });
  }

  @override
  void dispose() {
    _startDateCtrl.dispose();
    _endDateCtrl.dispose();
    _reasonCtrl.dispose();
    _startTimeCtrl.dispose();
    _endTimeCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchLeaveRequests() async {
    setState(() => _isLoading = true);
    try {
      final user = context.read<AuthProvider>().userData;
      if (user != null) {
        final data = await _leaveService.getMyRequests(user['id']);
        setState(() {
          _requests = data;
        });
      }
    } catch (e) {
      debugPrint('Error fetching leaves: $e');
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _calculateDaysCount() {
    final startStr = _startDateCtrl.text.trim();
    final endStr = _endDateCtrl.text.trim();
    final RegExp dateRegex = RegExp(r'^\d{4}-\d{2}-\d{2}$');

    if (!dateRegex.hasMatch(startStr) || !dateRegex.hasMatch(endStr)) {
      setState(() => _computedDays = 0);
      return;
    }

    try {
      final start = DateTime.parse(startStr);
      final end = DateTime.parse(endStr);

      if (start.isAfter(end)) {
        setState(() => _computedDays = 0);
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
      setState(() => _computedDays = count);
    } catch (e) {
      setState(() => _computedDays = 0);
    }
  }

  void _setFormDefaults() {
    final today = DateTime.now().toIso8601String().split('T')[0];
    _startDateCtrl.text = today;
    _endDateCtrl.text = today;
    _leaveType = 'Annual';
    _reasonCtrl.text = '';
    setState(() {
      _showForm = true;
    });
  }

  Future<void> _handleCreateRequest() async {
    final user = context.read<AuthProvider>().userData;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sesi Berakhir. Silakan login kembali.')),
      );
      return;
    }

    if (_startDateCtrl.text.isEmpty || _endDateCtrl.text.isEmpty || _reasonCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Form Belum Lengkap')),
      );
      return;
    }

    if (_leaveType == 'Emergency' && (_startTimeCtrl.text.isEmpty || _endTimeCtrl.text.isEmpty)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Silakan isi jam mulai dan selesai izin.')),
      );
      return;
    }

    setState(() => _isSubmitLoading = true);

    try {
      final payload = {
        'employee_id': user['id'],
        'leave_type': _leaveType,
        'start_date': _startDateCtrl.text,
        'end_date': _endDateCtrl.text,
        'reason': _reasonCtrl.text,
      };

      if (_leaveType == 'Emergency') {
        payload['start_time'] = _startTimeCtrl.text;
        payload['end_time'] = _endTimeCtrl.text;
      }

      final result = await _leaveService.submitLeaveRequest(payload);
      if (!mounted) return;

      if (result['status'] == 'success') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pengajuan berhasil dikirim!'), backgroundColor: Colors.green),
        );
        setState(() {
          _showForm = false;
        });
        _fetchLeaveRequests();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Error'), backgroundColor: Colors.red),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Terjadi kesalahan: $e')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isSubmitLoading = false);
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Approved': return Colors.green;
      case 'Rejected': return Colors.red;
      default: return Colors.orange;
    }
  }

  String _getStatusLabel(String status) {
    switch (status) {
      case 'Approved': return 'DISETUJUI';
      case 'Rejected': return 'DITOLAK';
      default: return 'MENUNGGU';
    }
  }

  String _getLeaveTypeLabel(String type) {
    switch (type) {
      case 'Annual': return 'Cuti Tahunan';
      case 'Sick': return 'Sakit';
      case 'Emergency': return 'Izin Pulang Cepat';
      case 'Unpaid': return 'Izin Tanpa Upah';
      default: return type;
    }
  }

  Color _getLeaveTypeColor(String type) {
    switch (type) {
      case 'Annual': return Colors.orange;
      case 'Sick': return Colors.blue;
      case 'Emergency': return Colors.red;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Izin & Cuti', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppConstants.textPrimary),
          onPressed: () => context.pop(),
        ),
        actions: [
          IconButton(
            icon: Icon(_showForm ? Icons.list : Icons.add_circle_outline, color: AppConstants.primaryColor),
            onPressed: () {
              if (_showForm) {
                setState(() => _showForm = false);
              } else {
                _setFormDefaults();
              }
            },
          ),
        ],
      ),
      body: _showForm ? _buildForm() : _buildHistoryList(),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Formulir Izin & Cuti Baru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            const Text('JENIS ABSEN / CUTI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppConstants.textSecondary)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [
                _buildTypeChip('Annual', 'Cuti'),
                _buildTypeChip('Sick', 'Sakit'),
                _buildTypeChip('Emergency', 'Pulang Cepat'),
                _buildTypeChip('Unpaid', 'Izin'),
              ],
            ),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildTextField('TANGGAL MULAI', _startDateCtrl, 'YYYY-MM-DD')),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField('TANGGAL SELESAI', _endDateCtrl, 'YYYY-MM-DD')),
              ],
            ),
            if (_leaveType == 'Emergency') ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildTextField('JAM MULAI', _startTimeCtrl, 'HH:MM')),
                  const SizedBox(width: 12),
                  Expanded(child: _buildTextField('JAM SELESAI', _endTimeCtrl, 'HH:MM')),
                ],
              ),
            ],
            const SizedBox(height: 16),
            if (_computedDays > 0)
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: Colors.orange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                child: Row(
                  children: [
                    const Icon(Icons.calendar_month, color: AppConstants.primaryColor, size: 16),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        'Durasi: $_computedDays Hari Kerja (Sabtu & Minggu tidak dihitung)',
                        style: const TextStyle(fontSize: 12, color: AppConstants.primaryColor, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ],
                ),
              ),
            const SizedBox(height: 16),
            _buildTextField('ALASAN / DETAIL PENGAJUAN', _reasonCtrl, 'Tulis keterangan lengkap...', maxLines: 4),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _isSubmitLoading ? null : _handleCreateRequest,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: _isSubmitLoading ? const SizedBox() : const Icon(Icons.send),
                label: _isSubmitLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('KIRIM PENGAJUAN', style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTypeChip(String key, String label) {
    final isSelected = _leaveType == key;
    return ChoiceChip(
      label: Text(label, style: TextStyle(color: isSelected ? Colors.white : AppConstants.textPrimary, fontSize: 12)),
      selected: isSelected,
      selectedColor: AppConstants.primaryColor,
      backgroundColor: Colors.grey[100],
      onSelected: (selected) {
        if (selected) setState(() => _leaveType = key);
      },
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, String hint, {int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppConstants.textSecondary)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
            filled: true,
            fillColor: Colors.grey[50],
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
          ),
        ),
      ],
    );
  }

  Widget _buildHistoryList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor));
    }

    return RefreshIndicator(
      onRefresh: _fetchLeaveRequests,
      color: AppConstants.primaryColor,
      child: _requests.isEmpty
          ? SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Container(
                height: 400,
                alignment: Alignment.center,
                child: const Text('Belum ada riwayat pengajuan cuti/izin.', style: TextStyle(color: AppConstants.textSecondary)),
              ),
            )
          : ListView.separated(
              padding: const EdgeInsets.all(16),
              itemCount: _requests.length,
              separatorBuilder: (context, index) => const SizedBox(height: 12),
              itemBuilder: (context, index) {
                final item = _requests[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                    boxShadow: [
                      BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Row(
                            children: [
                              Text(_getLeaveTypeLabel(item.leaveType), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                              const SizedBox(width: 6),
                              Container(width: 8, height: 8, decoration: BoxDecoration(shape: BoxShape.circle, color: _getLeaveTypeColor(item.leaveType))),
                            ],
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                            decoration: BoxDecoration(
                              color: _getStatusColor(item.status).withValues(alpha: 0.1),
                              border: Border.all(color: _getStatusColor(item.status)),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              _getStatusLabel(item.status),
                              style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _getStatusColor(item.status)),
                            ),
                          )
                        ],
                      ),
                      const SizedBox(height: 6),
                      Text('${item.startDate} s/d ${item.endDate}', style: const TextStyle(fontSize: 12, color: AppConstants.textSecondary)),
                      if (item.leaveType == 'Emergency' && item.startTime != null)
                        Text('Jam: ${item.startTime} - ${item.endTime}', style: const TextStyle(fontSize: 12, color: AppConstants.textSecondary, fontWeight: FontWeight.bold)),
                      const Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          const Text('Keperluan:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.textSecondary)),
                          Text('${item.daysCount} Hari Kerja', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(item.reason, style: const TextStyle(fontSize: 12, color: AppConstants.textPrimary)),
                      if (item.pdfUrl != null && item.pdfUrl!.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerRight,
                          child: OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fitur Unduh Dokumen akan datang (memerlukan url_launcher)')));
                            },
                            icon: const Icon(Icons.picture_as_pdf, size: 16, color: AppConstants.primaryColor),
                            label: const Text('Unduh TTD PDF', style: TextStyle(fontSize: 10, color: AppConstants.primaryColor)),
                          ),
                        )
                      ]
                    ],
                  ),
                );
              },
            ),
    );
  }
}
