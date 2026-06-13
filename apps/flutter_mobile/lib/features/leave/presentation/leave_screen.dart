import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/leave_service.dart';
import '../data/leave_model.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/utils/watermark_service.dart';

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
  String? _proofPhotoPath;
  final ImagePicker _picker = ImagePicker();
  Position? _currentPosition;

  @override
  void initState() {
    super.initState();
    _startDateCtrl.addListener(_calculateDaysCount);
    _endDateCtrl.addListener(_calculateDaysCount);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchLeaveRequests();
      _fetchLocation();
    });
  }

  Future<void> _fetchLocation() async {
    try {
      LocationPermission permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.always || permission == LocationPermission.whileInUse) {
        _currentPosition = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
      }
    } catch (e) {
      debugPrint("Gagal fetch lokasi: $e");
    }
  }

  Future<void> _takeProofPhoto() async {
    try {
      final XFile? photo = await _picker.pickImage(source: ImageSource.camera, imageQuality: 70);
      if (photo != null) {
        setState(() => _isSubmitLoading = true);
        if (_currentPosition == null) await _fetchLocation();
        if (!mounted) return;
        
        final user = context.read<AuthProvider>().userData;
        final watermarkedFile = await WatermarkService.addWatermark(
          imageFile: File(photo.path),
          employeeName: user?['name'] ?? user?['email'] ?? 'Karyawan',
          employeeId: user?['employee_code'] ??
              (user?['id'] != null && user!['id'].toString().length > 8
                  ? user['id'].toString().substring(0, 8)
                  : (user?['id']?.toString() ?? 'ID')),
          latitude: _currentPosition?.latitude ?? 0.0,
          longitude: _currentPosition?.longitude ?? 0.0,
          address: 'Lampiran Izin / Cuti',
          isCheckOut: false,
          customLabel: 'LAMPIRAN IZIN'
        );
        
        setState(() {
          _proofPhotoPath = watermarkedFile.path;
          _isSubmitLoading = false;
        });
        
        _showImagePreviewDialog(watermarkedFile);
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isSubmitLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal ambil foto: $e')));
      }
    }
  }

  void _showImagePreviewDialog(File imageFile) {
    showDialog(
      context: context,
      builder: (context) => Dialog(
        backgroundColor: Colors.transparent,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(imageFile, fit: BoxFit.contain, height: MediaQuery.of(context).size.height * 0.6),
            ),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: () => Navigator.pop(context),
              icon: const Icon(Icons.check),
              label: const Text('Simpan Foto'),
              style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor, foregroundColor: context.surfaceColor),
            )
          ],
        ),
      ),
    );
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
        if (!mounted) return;
        setState(() {
          _requests = data;
        });
      }
    } catch (e) {
      debugPrint('Error fetching leaves: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
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

  Future<void> _selectDate(BuildContext context, TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: ColorScheme.light(
              primary: AppConstants.primaryColor,
              onPrimary: context.surfaceColor,
              onSurface: context.textPrimary,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        controller.text = picked.toIso8601String().split('T')[0];
      });
    }
  }

  Future<void> _selectTime(BuildContext context, TextEditingController controller) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: TimeOfDay.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: AppConstants.primaryColor,
            ),
          ),
          child: child!,
        );
      },
    );
    if (picked != null) {
      setState(() {
        final hour = picked.hour.toString().padLeft(2, '0');
        final minute = picked.minute.toString().padLeft(2, '0');
        controller.text = '$hour:$minute';
      });
    }
  }

  void _setFormDefaults() {
    final today = DateTime.now().toIso8601String().split('T')[0];
    _startDateCtrl.text = today;
    _endDateCtrl.text = today;
    _leaveType = 'Annual';
    _reasonCtrl.text = '';
    _proofPhotoPath = null;
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
      
      if (_proofPhotoPath != null) {
        final fileBytes = await File(_proofPhotoPath!).readAsBytes();
        payload['proof_base64'] = base64Encode(fileBytes);
      }

      final result = await _leaveService.submitLeaveRequest(payload);
      if (!mounted) return;

      if (result['status'] == 'success') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pengajuan berhasil dikirim!'), backgroundColor: Colors.green),
        );
        setState(() {
          _showForm = false;
          _proofPhotoPath = null;
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
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Izin & Cuti', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textPrimary),
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
          color: context.surfaceColor,
          borderRadius: BorderRadius.circular(16),
          boxShadow: [
            BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 4)),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Formulir Izin & Cuti Baru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            SizedBox(height: 16),
            Text('JENIS ABSEN / CUTI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: context.textSecondary)),
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
                Expanded(child: _buildTextField('TANGGAL MULAI', _startDateCtrl, 'YYYY-MM-DD', readOnly: true, onTap: () => _selectDate(context, _startDateCtrl))),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField('TANGGAL SELESAI', _endDateCtrl, 'YYYY-MM-DD', readOnly: true, onTap: () => _selectDate(context, _endDateCtrl))),
              ],
            ),
            if (_leaveType == 'Emergency') ...[
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildTextField('JAM MULAI', _startTimeCtrl, 'HH:MM', readOnly: true, onTap: () => _selectTime(context, _startTimeCtrl))),
                  const SizedBox(width: 12),
                  Expanded(child: _buildTextField('JAM SELESAI', _endTimeCtrl, 'HH:MM', readOnly: true, onTap: () => _selectTime(context, _endTimeCtrl))),
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
            SizedBox(height: 16),
            _buildTextField('ALASAN / DETAIL PENGAJUAN', _reasonCtrl, 'Tulis keterangan lengkap...', maxLines: 4),
            
            SizedBox(height: 16),
            Text('LAMPIRAN FOTO (OPSIONAL)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: context.textSecondary)),
            const SizedBox(height: 8),
            InkWell(
              onTap: _takeProofPhoto,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: _proofPhotoPath != null ? Colors.green.withValues(alpha: 0.1) : Colors.grey.shade50,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: _proofPhotoPath != null ? Colors.green.shade300 : Colors.grey.shade300),
                ),
                child: Row(
                  children: [
                    Icon(_proofPhotoPath != null ? Icons.check_circle : Icons.camera_alt, color: _proofPhotoPath != null ? Colors.green : AppConstants.primaryColor),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        _proofPhotoPath != null ? 'Foto berhasil dilampirkan (Ketuk ganti)' : 'Ambil foto bukti (Surat dokter, dll)',
                        style: TextStyle(color: _proofPhotoPath != null ? Colors.green : context.textPrimary, fontSize: 12, fontWeight: _proofPhotoPath != null ? FontWeight.bold : FontWeight.normal),
                      ),
                    ),
                    if (_proofPhotoPath != null)
                      IconButton(
                        icon: const Icon(Icons.remove_red_eye, size: 20, color: Colors.blue),
                        onPressed: () => _showImagePreviewDialog(File(_proofPhotoPath!)),
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
                  ],
                ),
              ),
            ),
            
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton.icon(
                onPressed: _isSubmitLoading ? null : _handleCreateRequest,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  foregroundColor: context.surfaceColor,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: _isSubmitLoading ? SizedBox() : Icon(Icons.send),
                label: _isSubmitLoading ? CircularProgressIndicator(color: context.surfaceColor) : Text('KIRIM PENGAJUAN', style: TextStyle(fontWeight: FontWeight.bold)),
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
      label: Text(label, style: TextStyle(color: isSelected ? context.surfaceColor : context.textPrimary, fontSize: 12)),
      selected: isSelected,
      selectedColor: AppConstants.primaryColor,
      backgroundColor: Colors.grey[100],
      onSelected: (selected) {
        if (selected) setState(() => _leaveType = key);
      },
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, String hint, {int maxLines = 1, VoidCallback? onTap, bool readOnly = false}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: context.textSecondary)),
        const SizedBox(height: 8),
        TextField(
          controller: controller,
          maxLines: maxLines,
          readOnly: readOnly,
          onTap: onTap,
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
              physics: AlwaysScrollableScrollPhysics(),
              child: Container(
                height: 400,
                alignment: Alignment.center,
                child: Text('Belum ada riwayat pengajuan cuti/izin.', style: TextStyle(color: context.textSecondary)),
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
                    color: context.surfaceColor,
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
                      SizedBox(height: 6),
                      Text('${item.startDate} s/d ${item.endDate}', style: TextStyle(fontSize: 12, color: context.textSecondary)),
                      if (item.leaveType == 'Emergency' && item.startTime != null)
                        Text('Jam: ${item.startTime} - ${item.endTime}', style: TextStyle(fontSize: 12, color: context.textSecondary, fontWeight: FontWeight.bold)),
                      Divider(height: 24),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Keperluan:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: context.textSecondary)),
                          Text('${item.daysCount} Hari Kerja', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                        ],
                      ),
                      SizedBox(height: 4),
                      Text(item.reason, style: TextStyle(fontSize: 12, color: context.textPrimary)),
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
