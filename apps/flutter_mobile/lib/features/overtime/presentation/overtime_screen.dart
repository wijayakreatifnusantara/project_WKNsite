import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/overtime_service.dart';
import '../data/overtime_model.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/services/watermark_service.dart';

class OvertimeScreen extends StatefulWidget {
  const OvertimeScreen({super.key});

  @override
  State<OvertimeScreen> createState() => _OvertimeScreenState();
}

class _OvertimeScreenState extends State<OvertimeScreen> {
  final OvertimeService _overtimeService = OvertimeService();
  bool _isLoading = false;
  bool _isSubmitLoading = false;
  bool _showForm = false;
  List<OvertimeRequest> _requests = [];
  RealtimeChannel? _subscription;

  // Form Fields
  final TextEditingController _dateCtrl = TextEditingController();
  final TextEditingController _startTimeCtrl = TextEditingController();
  final TextEditingController _endTimeCtrl = TextEditingController();
  final TextEditingController _reasonCtrl = TextEditingController();

  String? _proofPhotoPath;
  final ImagePicker _picker = ImagePicker();
  Position? _currentPosition;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _initScreen();
    });
  }

  @override
  void dispose() {
    _subscription?.unsubscribe();
    _dateCtrl.dispose();
    _startTimeCtrl.dispose();
    _endTimeCtrl.dispose();
    _reasonCtrl.dispose();
    super.dispose();
  }

  Future<void> _initScreen() async {
    final user = context.read<AuthProvider>().userData;
    if (user != null) {
      await _fetchOvertimeRequests(user['id']);
      _subscription = _overtimeService.subscribeToMyRequests(user['id'], () {
        _fetchOvertimeRequests(user['id']);
      });
    }
  }

  Future<void> _fetchOvertimeRequests(String employeeId) async {
    if (!mounted) return;
    setState(() => _isLoading = true);
    try {
      final data = await _overtimeService.getMyRequests(employeeId);
      if (mounted) {
        setState(() {
          _requests = data;
        });
      }
    } catch (e) {
      debugPrint('Error fetching overtime: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _setFormDefaults() {
    final today = DateTime.now().toIso8601String().split('T')[0];
    _dateCtrl.text = today;
    _startTimeCtrl.text = '17:00';
    _endTimeCtrl.text = '19:00';
    _reasonCtrl.text = '';
    _proofPhotoPath = null;
    setState(() {
      _showForm = true;
    });
  }

  Future<void> _takePhoto() async {
    try {
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 70,
      );
      
      if (photo != null) {
        setState(() => _isSubmitLoading = true);
        
        bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
        if (!serviceEnabled) {
          throw Exception('GPS tidak aktif');
        }
        
        LocationPermission permission = await Geolocator.checkPermission();
        if (permission == LocationPermission.denied) {
          permission = await Geolocator.requestPermission();
          if (permission == LocationPermission.denied) throw Exception('Izin lokasi ditolak');
        }
        
        _currentPosition = await Geolocator.getCurrentPosition(desiredAccuracy: LocationAccuracy.high);
        
        final user = context.read<AuthProvider>().userData;
        final employeeName = user?['name'] ?? 'Karyawan';
        
        final watermarkedPath = await WatermarkService.addWatermark(
          photo.path,
          employeeName,
          'LEMBUR',
          _currentPosition!,
        );
        
        if (watermarkedPath != null) {
          setState(() {
            _proofPhotoPath = watermarkedPath;
          });
          _showPhotoPreview();
        }
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal mengambil foto: $e'), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isSubmitLoading = false);
    }
  }

  void _showPhotoPreview() {
    if (_proofPhotoPath == null) return;
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Pratinjau Foto Lembur', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.file(File(_proofPhotoPath!)),
            ),
            const SizedBox(height: 12),
            const Text('Pastikan wajah dan pekerjaan Anda terlihat jelas beserta keterangan waktu di dalam foto.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
        actions: [
          TextButton(onPressed: () {
            setState(() => _proofPhotoPath = null);
            Navigator.pop(context);
          }, child: const Text('Hapus Foto', style: TextStyle(color: Colors.red))),
          ElevatedButton(onPressed: () => Navigator.pop(context), style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor), child: const Text('Gunakan Foto', style: TextStyle(color: Colors.white))),
        ],
      )
    );
  }

  Future<void> _selectDate(BuildContext context, TextEditingController controller) async {
    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: DateTime.now(),
      firstDate: DateTime.now().subtract(const Duration(days: 30)),
      lastDate: DateTime.now().add(const Duration(days: 30)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(primary: AppConstants.primaryColor),
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
            colorScheme: const ColorScheme.light(primary: AppConstants.primaryColor),
          ),
          child: child!,
        );
      },
    );
    if (picked != null && context.mounted) {
      setState(() {
        final hour = picked.hour.toString().padLeft(2, '0');
        final minute = picked.minute.toString().padLeft(2, '0');
        controller.text = '$hour:$minute';
      });
    }
  }

  Future<void> _handleCreateRequest() async {
    final user = context.read<AuthProvider>().userData;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sesi Berakhir. Silakan login kembali.')),
      );
      return;
    }

    if (_dateCtrl.text.isEmpty || _startTimeCtrl.text.isEmpty || _endTimeCtrl.text.isEmpty || _reasonCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Form Belum Lengkap')),
      );
      return;
    }

    final dateRegex = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    final timeRegex = RegExp(r'^\d{2}:\d{2}$');

    if (!dateRegex.hasMatch(_dateCtrl.text)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Format Tanggal Salah (YYYY-MM-DD)')));
      return;
    }
    if (!timeRegex.hasMatch(_startTimeCtrl.text) || !timeRegex.hasMatch(_endTimeCtrl.text)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Format Jam Salah (HH:MM)')));
      return;
    }

    if (_proofPhotoPath == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Wajib melampirkan foto bukti lembur!')));
      return;
    }

    setState(() => _isSubmitLoading = true);

    try {
      final partsStart = _startTimeCtrl.text.split(':');
      final partsEnd = _endTimeCtrl.text.split(':');
      int sMinutes = int.parse(partsStart[0]) * 60 + int.parse(partsStart[1]);
      int eMinutes = int.parse(partsEnd[0]) * 60 + int.parse(partsEnd[1]);

      if (eMinutes < sMinutes) {
        eMinutes += 24 * 60; // Crossing midnight
      }
      final double durationHours = (eMinutes - sMinutes) / 60.0;

      String? base64Image;
      if (_proofPhotoPath != null) {
        final bytes = await File(_proofPhotoPath!).readAsBytes();
        base64Image = base64Encode(bytes);
      }

      final payload = {
        'employee_id': user['id'],
        'date': _dateCtrl.text,
        'start_time': _startTimeCtrl.text,
        'end_time': _endTimeCtrl.text,
        'duration_hours': double.parse(durationHours.toStringAsFixed(2)),
        'reason': _reasonCtrl.text.trim(),
        'status': 'Pending',
        if (base64Image != null) 'proof_base64': base64Image,
      };

      await _overtimeService.submitOvertimeRequest(payload);
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Pengajuan lembur berhasil dikirim!'), backgroundColor: Colors.green),
      );
      setState(() {
        _showForm = false;
      });
      _fetchOvertimeRequests(user['id']);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Terjadi kesalahan: $e'), backgroundColor: Colors.red),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Pengajuan Lembur', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
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
            const Text('Formulir Lembur Baru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            _buildTextField('TANGGAL LEMBUR', _dateCtrl, 'Pilih Tanggal', readOnly: true, onTap: () => _selectDate(context, _dateCtrl)),
            const SizedBox(height: 16),
            Row(
              children: [
                Expanded(child: _buildTextField('JAM MULAI', _startTimeCtrl, 'Pilih Jam', readOnly: true, onTap: () => _selectTime(context, _startTimeCtrl))),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField('JAM SELESAI', _endTimeCtrl, 'Pilih Jam', readOnly: true, onTap: () => _selectTime(context, _endTimeCtrl))),
              ],
            ),
            const SizedBox(height: 16),
            _buildTextField('ALASAN / KEPERLUAN LEMBUR', _reasonCtrl, 'Sebutkan detail pekerjaan...', maxLines: 4),
            const SizedBox(height: 16),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Colors.grey[50], borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.grey.shade300)),
              child: Column(
                children: [
                  const Icon(Icons.camera_alt, color: Colors.grey, size: 32),
                  const SizedBox(height: 8),
                  const Text('FOTO BUKTI LEMBUR', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppConstants.textSecondary)),
                  const SizedBox(height: 4),
                  const Text('Wajib melampirkan foto diri sedang bekerja di lokasi', style: TextStyle(fontSize: 10, color: Colors.grey), textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  if (_proofPhotoPath != null) ...[
                    ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.file(File(_proofPhotoPath!), height: 120, width: double.infinity, fit: BoxFit.cover)),
                    const SizedBox(height: 8),
                    TextButton.icon(onPressed: _showPhotoPreview, icon: const Icon(Icons.preview, size: 16), label: const Text('Lihat Pratinjau')),
                  ],
                  ElevatedButton.icon(
                    onPressed: _isSubmitLoading ? null : _takePhoto,
                    icon: const Icon(Icons.camera),
                    label: Text(_proofPhotoPath == null ? 'Ambil Foto' : 'Ubah Foto'),
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: AppConstants.primaryColor, side: const BorderSide(color: AppConstants.primaryColor), elevation: 0),
                  )
                ],
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

  Widget _buildTextField(String label, TextEditingController controller, String hint, {int maxLines = 1, bool readOnly = false, VoidCallback? onTap}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppConstants.textSecondary)),
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
      onRefresh: () async {
        final user = context.read<AuthProvider>().userData;
        if (user != null) await _fetchOvertimeRequests(user['id']);
      },
      color: AppConstants.primaryColor,
      child: _requests.isEmpty
          ? SingleChildScrollView(
              physics: const AlwaysScrollableScrollPhysics(),
              child: Container(
                height: 400,
                alignment: Alignment.center,
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.access_time, size: 48, color: Colors.grey),
                    const SizedBox(height: 12),
                    const Text('Belum ada riwayat pengajuan lembur.', style: TextStyle(color: AppConstants.textSecondary)),
                    const SizedBox(height: 16),
                    OutlinedButton(
                      onPressed: _setFormDefaults,
                      style: OutlinedButton.styleFrom(foregroundColor: AppConstants.primaryColor, side: const BorderSide(color: AppConstants.primaryColor)),
                      child: const Text('Ajukan Lembur Baru'),
                    )
                  ],
                ),
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
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(item.date, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                                const SizedBox(height: 2),
                                Text('${item.startTime} - ${item.endTime} (${item.durationHours} Jam)', style: const TextStyle(fontSize: 11, color: AppConstants.textSecondary, fontWeight: FontWeight.bold)),
                              ],
                            ),
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
                      const Divider(height: 24),
                      const Text('Alasan Kerja Lembur:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: AppConstants.textSecondary)),
                      const SizedBox(height: 4),
                      Text(item.reason, style: const TextStyle(fontSize: 12, color: AppConstants.textPrimary)),
                      if (item.pdfUrl != null && item.pdfUrl!.isNotEmpty) ...[
                        const SizedBox(height: 12),
                        Align(
                          alignment: Alignment.centerRight,
                          child: OutlinedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fitur Unduh Dokumen (memerlukan url_launcher)')));
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
