import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import '../../auth/data/auth_provider.dart';
import '../data/leave_provider.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/utils/watermark_service.dart';
import '../../../widgets/ios_card.dart';

class LeaveScreen extends StatefulWidget {
  const LeaveScreen({super.key});

  @override
  State<LeaveScreen> createState() => _LeaveScreenState();
}

class _LeaveScreenState extends State<LeaveScreen> {
  bool _showForm = false;
  final _formKey = GlobalKey<FormState>();

  // Form Fields
  String _leaveType = 'Annual';
  final TextEditingController _startDateCtrl = TextEditingController();
  final TextEditingController _endDateCtrl = TextEditingController();
  final TextEditingController _reasonCtrl = TextEditingController();
  final TextEditingController _startTimeCtrl = TextEditingController();
  final TextEditingController _endTimeCtrl = TextEditingController();

  String? _proofPhotoPath;
  final ImagePicker _picker = ImagePicker();
  Position? _currentPosition;

  @override
  void initState() {
    super.initState();
    _startDateCtrl.addListener(_calculateDaysCount);
    _endDateCtrl.addListener(_calculateDaysCount);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().userData;
      if (user != null) {
        context.read<LeaveProvider>().fetchLeaveRequests(user['id']);
      }
      _fetchLocation();
    });
  }

  void _calculateDaysCount() {
    context.read<LeaveProvider>().calculateDaysCount(_startDateCtrl.text.trim(), _endDateCtrl.text.trim());
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
        });
        
        _showImagePreviewDialog(watermarkedFile);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal ambil foto: $e')));
      }
    }
  }

  void _showImagePreviewDialog(File imageFile) {
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        content: Column(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(imageFile, fit: BoxFit.contain, height: MediaQuery.of(context).size.height * 0.5),
            ),
          ],
        ),
        actions: [
          CupertinoDialogAction(
            child: const Text('Simpan Foto'),
            onPressed: () => Navigator.pop(context),
          )
        ],
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

  // Logic for _fetchLeaveRequests and _calculateDaysCount is now in LeaveProvider

  void _showCupertinoDatePicker(BuildContext context, TextEditingController controller) {
    DateTime initialDate = DateTime.now();
    if (controller.text.isNotEmpty) {
      try {
        initialDate = DateTime.parse(controller.text);
      } catch (e) {
        // use default
      }
    }

    showCupertinoModalPopup(
      context: context,
      builder: (_) => Container(
        height: 300,
        color: CupertinoColors.systemBackground.resolveFrom(context),
        child: Column(
          children: [
            Container(
              height: 50,
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: CupertinoColors.systemGrey4, width: 0.5)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  CupertinoButton(
                    child: const Text('Selesai'),
                    onPressed: () => Navigator.of(context).pop(),
                  )
                ],
              ),
            ),
            Expanded(
              child: CupertinoDatePicker(
                mode: CupertinoDatePickerMode.date,
                initialDateTime: initialDate,
                onDateTimeChanged: (val) {
                  controller.text = val.toIso8601String().split('T')[0];
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showCupertinoTimePicker(BuildContext context, TextEditingController controller) {
    DateTime initialTime = DateTime.now();
    if (controller.text.isNotEmpty) {
      try {
        final parts = controller.text.split(':');
        initialTime = DateTime(initialTime.year, initialTime.month, initialTime.day, int.parse(parts[0]), int.parse(parts[1]));
      } catch (e) {
        // use default
      }
    }

    showCupertinoModalPopup(
      context: context,
      builder: (_) => Container(
        height: 300,
        color: CupertinoColors.systemBackground.resolveFrom(context),
        child: Column(
          children: [
            Container(
              height: 50,
              decoration: const BoxDecoration(
                border: Border(bottom: BorderSide(color: CupertinoColors.systemGrey4, width: 0.5)),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  CupertinoButton(
                    child: const Text('Selesai'),
                    onPressed: () => Navigator.of(context).pop(),
                  )
                ],
              ),
            ),
            Expanded(
              child: CupertinoDatePicker(
                mode: CupertinoDatePickerMode.time,
                use24hFormat: true,
                initialDateTime: initialTime,
                onDateTimeChanged: (val) {
                  final hour = val.hour.toString().padLeft(2, '0');
                  final minute = val.minute.toString().padLeft(2, '0');
                  controller.text = '$hour:$minute';
                },
              ),
            ),
          ],
        ),
      ),
    );
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

    if (!_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Form Belum Lengkap. Harap perbaiki isian yang kosong.'), backgroundColor: CupertinoColors.destructiveRed),
      );
      return;
    }

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

      final result = await context.read<LeaveProvider>().submitLeaveRequest(payload);
      if (!mounted) return;

      if (result['status'] == 'success') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pengajuan berhasil dikirim!'), backgroundColor: CupertinoColors.activeGreen),
        );
        setState(() {
          _showForm = false;
          _proofPhotoPath = null;
        });
        context.read<LeaveProvider>().fetchLeaveRequests(user['id']);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Error'), backgroundColor: CupertinoColors.destructiveRed),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Terjadi kesalahan: $e')),
        );
      }
    }
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'Approved': return CupertinoColors.activeGreen;
      case 'Rejected': return CupertinoColors.destructiveRed;
      default: return CupertinoColors.activeOrange;
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
      case 'Emergency': return 'Pulang Cepat';
      case 'Unpaid': return 'Izin Tanpa Upah';
      default: return type;
    }
  }

  Color _getLeaveTypeColor(String type) {
    switch (type) {
      case 'Annual': return CupertinoColors.activeOrange;
      case 'Sick': return CupertinoColors.activeBlue;
      case 'Emergency': return CupertinoColors.destructiveRed;
      default: return CupertinoColors.systemGrey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Izin & Cuti'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          child: Icon(_showForm ? CupertinoIcons.list_bullet : CupertinoIcons.add_circled),
          onPressed: () {
            if (_showForm) {
              setState(() => _showForm = false);
            } else {
              _setFormDefaults();
            }
          },
        ),
      ),
      child: SafeArea(
        child: _showForm ? _buildForm(isDark) : _buildHistoryList(isDark),
      ),
    );
  }

  Widget _buildForm(bool isDark) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: IosCard(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Formulir Izin & Cuti Baru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              const Text('JENIS ABSEN / CUTI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
              const SizedBox(height: 8),
              
              SizedBox(
                width: double.infinity,
                child: CupertinoSlidingSegmentedControl<String>(
                  groupValue: _leaveType,
                  children: const {
                    'Annual': Text('Cuti', style: TextStyle(fontSize: 12)),
                    'Sick': Text('Sakit', style: TextStyle(fontSize: 12)),
                    'Emergency': Text('Pulang', style: TextStyle(fontSize: 12)),
                    'Unpaid': Text('Izin', style: TextStyle(fontSize: 12)),
                  },
                  onValueChanged: (value) {
                    if (value != null) setState(() => _leaveType = value);
                  },
                ),
              ),

              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(child: _buildTextField('TANGGAL MULAI', _startDateCtrl, 'YYYY-MM-DD', readOnly: true, onTap: () => _showCupertinoDatePicker(context, _startDateCtrl))),
                  const SizedBox(width: 12),
                  Expanded(child: _buildTextField('TANGGAL SELESAI', _endDateCtrl, 'YYYY-MM-DD', readOnly: true, onTap: () => _showCupertinoDatePicker(context, _endDateCtrl))),
                ],
              ),
              if (_leaveType == 'Emergency') ...[
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(child: _buildTextField('JAM MULAI', _startTimeCtrl, 'HH:MM', readOnly: true, onTap: () => _showCupertinoTimePicker(context, _startTimeCtrl))),
                    const SizedBox(width: 12),
                    Expanded(child: _buildTextField('JAM SELESAI', _endTimeCtrl, 'HH:MM', readOnly: true, onTap: () => _showCupertinoTimePicker(context, _endTimeCtrl))),
                  ],
                ),
              ],
              const SizedBox(height: 16),
              Consumer<LeaveProvider>(
                builder: (context, provider, child) {
                  return Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (provider.computedDays > 0)
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(color: CupertinoColors.activeOrange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(12)),
                          child: Row(
                            children: [
                              const Icon(CupertinoIcons.calendar, color: CupertinoColors.activeOrange, size: 16),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  'Durasi: ${provider.computedDays} Hari Kerja (Sabtu & Minggu libur)',
                                  style: const TextStyle(fontSize: 12, color: CupertinoColors.activeOrange, fontWeight: FontWeight.bold),
                                ),
                              ),
                            ],
                          ),
                        ),
                      const SizedBox(height: 16),
                    ],
                  );
                },
              ),
              _buildTextField('ALASAN / DETAIL PENGAJUAN', _reasonCtrl, 'Tulis keterangan lengkap...', maxLines: 4),
              
              const SizedBox(height: 16),
              const Text('LAMPIRAN FOTO (OPSIONAL)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
              const SizedBox(height: 8),
              GestureDetector(
                onTap: _takeProofPhoto,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: _proofPhotoPath != null ? CupertinoColors.activeGreen.withValues(alpha: 0.1) : (isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey6),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: _proofPhotoPath != null ? CupertinoColors.activeGreen : CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                  ),
                  child: Row(
                    children: [
                      Icon(_proofPhotoPath != null ? CupertinoIcons.check_mark_circled_solid : CupertinoIcons.camera_fill, color: _proofPhotoPath != null ? CupertinoColors.activeGreen : CupertinoColors.activeBlue),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _proofPhotoPath != null ? 'Foto berhasil dilampirkan (Ketuk ganti)' : 'Ambil foto bukti (Surat dokter, dll)',
                          style: TextStyle(color: _proofPhotoPath != null ? CupertinoColors.activeGreen : (isDark ? CupertinoColors.white : CupertinoColors.black), fontSize: 12, fontWeight: _proofPhotoPath != null ? FontWeight.bold : FontWeight.normal),
                        ),
                      ),
                      if (_proofPhotoPath != null)
                        CupertinoButton(
                          padding: EdgeInsets.zero,
                          child: const Icon(CupertinoIcons.eye, size: 20, color: CupertinoColors.activeBlue),
                          onPressed: () => _showImagePreviewDialog(File(_proofPhotoPath!)),
                        ),
                    ],
                  ),
                ),
              ),
              
              const SizedBox(height: 24),
              Consumer<LeaveProvider>(
                builder: (context, provider, child) {
                  return SizedBox(
                    width: double.infinity,
                    child: CupertinoButton.filled(
                      onPressed: provider.isSubmitLoading ? null : _handleCreateRequest,
                      child: provider.isSubmitLoading 
                        ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(CupertinoIcons.paperplane_fill, size: 18),
                              SizedBox(width: 8),
                              Text('KIRIM PENGAJUAN', style: TextStyle(fontWeight: FontWeight.bold)),
                            ],
                          ),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController controller, String hint, {int maxLines = 1, VoidCallback? onTap, bool readOnly = false}) {
    final isDark = context.isDarkMode;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
        const SizedBox(height: 8),
        CupertinoTextFormFieldRow(
          controller: controller,
          maxLines: maxLines,
          readOnly: readOnly,
          onTap: onTap,
          placeholder: hint,
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          decoration: BoxDecoration(
            color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
          ),
          validator: (value) {
            if (value == null || value.trim().isEmpty) return 'Wajib diisi';
            if (label == 'ALASAN / DETAIL PENGAJUAN' && value.trim().length < 5) return 'Terlalu singkat';
            return null;
          },
        ),
      ],
    );
  }

  Widget _buildHistoryList(bool isDark) {
    return Consumer<LeaveProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CupertinoActivityIndicator(radius: 16));
        }

        return CustomScrollView(
          slivers: [
            CupertinoSliverRefreshControl(
              onRefresh: () async {
                final user = context.read<AuthProvider>().userData;
                if (user != null) {
                  await provider.fetchLeaveRequests(user['id']);
                }
              },
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: provider.requests.isEmpty
                  ? SliverFillRemaining(
                      child: Center(
                        child: Text('Belum ada riwayat pengajuan cuti/izin.', style: TextStyle(color: CupertinoColors.systemGrey)),
                      ),
                    )
                  : SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final item = provider.requests[index];
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 12),
                            child: IosCard(
                              padding: const EdgeInsets.all(16),
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
                                  Text('${item.startDate} s/d ${item.endDate}', style: const TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
                                  if (item.leaveType == 'Emergency' && item.startTime != null)
                                    Text('Jam: ${item.startTime} - ${item.endTime}', style: const TextStyle(fontSize: 12, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                                  const Padding(
                                    padding: EdgeInsets.symmetric(vertical: 12),
                                    child: Divider(height: 1, color: CupertinoColors.systemGrey4),
                                  ),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      const Text('Keperluan:', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
                                      Text('${item.daysCount} Hari Kerja', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.activeBlue)),
                                    ],
                                  ),
                                  const SizedBox(height: 4),
                                  Text(item.reason, style: TextStyle(fontSize: 12, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                  if (item.pdfUrl != null && item.pdfUrl!.isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    Align(
                                      alignment: Alignment.centerRight,
                                      child: CupertinoButton(
                                        padding: EdgeInsets.zero,
                                        onPressed: () {},
                                        child: const Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Icon(CupertinoIcons.doc_text_fill, size: 16),
                                            SizedBox(width: 4),
                                            Text('Unduh TTD PDF', style: TextStyle(fontSize: 10)),
                                          ],
                                        ),
                                      ),
                                    )
                                  ]
                                ],
                              ),
                            ),
                          );
                        },
                        childCount: provider.requests.length,
                      ),
                    ),
            ),
          ],
        );
      },
    );
  }
}
