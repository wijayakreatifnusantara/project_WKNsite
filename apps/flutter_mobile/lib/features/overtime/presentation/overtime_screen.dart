import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import '../../auth/data/auth_provider.dart';
import '../data/overtime_provider.dart';
import 'dart:io';
import 'dart:convert';
import 'package:image_picker/image_picker.dart';
import 'package:geolocator/geolocator.dart';
import '../../../core/utils/watermark_service.dart';
import '../../../widgets/ios_card.dart';

class OvertimeScreen extends StatefulWidget {
  const OvertimeScreen({super.key});

  @override
  State<OvertimeScreen> createState() => _OvertimeScreenState();
}

class _OvertimeScreenState extends State<OvertimeScreen> {
  bool _showForm = false;
  bool _isPhotoLoading = false;

  // Form Fields
  final TextEditingController _dateCtrl = TextEditingController();
  final TextEditingController _startTimeCtrl = TextEditingController();
  final TextEditingController _endTimeCtrl = TextEditingController();
  final TextEditingController _reasonCtrl = TextEditingController();
  String _compensationType = 'Paid';

  String? _proofPhotoPath;
  final ImagePicker _picker = ImagePicker();
  Position? _currentPosition;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final user = context.read<AuthProvider>().userData;
      if (user != null) {
        context.read<OvertimeProvider>().subscribeToMyRequests(user['id']);
        context.read<OvertimeProvider>().fetchOvertimeRequests(user['id']);
      }
    });
  }

  @override
  void dispose() {
    _dateCtrl.dispose();
    _startTimeCtrl.dispose();
    _endTimeCtrl.dispose();
    _reasonCtrl.dispose();
    super.dispose();
  }

  void _setFormDefaults() {
    final today = DateTime.now().toIso8601String().split('T')[0];
    _dateCtrl.text = today;
    _startTimeCtrl.text = '17:00';
    _endTimeCtrl.text = '19:00';
    _reasonCtrl.text = '';
    _compensationType = 'Paid';
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
        setState(() => _isPhotoLoading = true);
        
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
        if (!mounted) return;
        
        final user = context.read<AuthProvider>().userData;
        final employeeName = user?['name'] ?? 'Karyawan';
        
        final watermarkedFile = await WatermarkService.addWatermark(
          imageFile: File(photo.path),
          employeeName: employeeName,
          employeeId: user?['employee_id'] ?? '-',
          latitude: _currentPosition!.latitude,
          longitude: _currentPosition!.longitude,
          address: 'Lokasi Anda',
          isCheckOut: false,
          customLabel: 'LEMBUR',
        );
        
        setState(() {
          _proofPhotoPath = watermarkedFile.path;
          _isPhotoLoading = false;
        });
        _showPhotoPreview();
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isPhotoLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal mengambil foto: $e'), backgroundColor: CupertinoColors.destructiveRed));
      }
    }
  }

  void _showPhotoPreview() {
    if (_proofPhotoPath == null) return;
    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Pratinjau Foto Lembur'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 12),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: Image.file(File(_proofPhotoPath!)),
            ),
            const SizedBox(height: 12),
            const Text('Pastikan wajah dan pekerjaan Anda terlihat jelas beserta keterangan waktu di dalam foto.', textAlign: TextAlign.center, style: TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
          ],
        ),
        actions: [
          CupertinoDialogAction(
            isDestructiveAction: true,
            onPressed: () {
              setState(() => _proofPhotoPath = null);
              Navigator.pop(context);
            }, 
            child: const Text('Hapus Foto')
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () => Navigator.pop(context), 
            child: const Text('Gunakan')
          ),
        ],
      )
    );
  }

  void _showDatePickerModal(TextEditingController controller) {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext context) {
        return Container(
          height: 250,
          color: context.isDarkMode ? CupertinoColors.black : CupertinoColors.white,
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CupertinoButton(
                    child: const Text('Batal'),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  CupertinoButton(
                    child: const Text('Selesai'),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              Expanded(
                child: CupertinoDatePicker(
                  mode: CupertinoDatePickerMode.date,
                  initialDateTime: DateTime.now(),
                  minimumDate: DateTime.now().subtract(const Duration(days: 30)),
                  maximumDate: DateTime.now().add(const Duration(days: 30)),
                  onDateTimeChanged: (DateTime newDate) {
                    setState(() {
                      controller.text = newDate.toIso8601String().split('T')[0];
                    });
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showTimePickerModal(TextEditingController controller) {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext context) {
        return Container(
          height: 250,
          color: context.isDarkMode ? CupertinoColors.black : CupertinoColors.white,
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  CupertinoButton(
                    child: const Text('Batal'),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                  CupertinoButton(
                    child: const Text('Selesai'),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
              Expanded(
                child: CupertinoDatePicker(
                  mode: CupertinoDatePickerMode.time,
                  use24hFormat: true,
                  initialDateTime: DateTime.now(),
                  onDateTimeChanged: (DateTime newTime) {
                    setState(() {
                      final hour = newTime.hour.toString().padLeft(2, '0');
                      final minute = newTime.minute.toString().padLeft(2, '0');
                      controller.text = '$hour:$minute';
                    });
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showCompensationActionSheet() {
    showCupertinoModalPopup(
      context: context,
      builder: (BuildContext context) => CupertinoActionSheet(
        title: const Text('Pilih Kompensasi'),
        actions: <CupertinoActionSheetAction>[
          CupertinoActionSheetAction(
            onPressed: () {
              setState(() => _compensationType = 'Paid');
              Navigator.pop(context);
            },
            child: const Text('Dibayar Uang (Sesuai Kemenaker)'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              setState(() => _compensationType = 'Time-off');
              Navigator.pop(context);
            },
            child: const Text('Ditukar Cuti (Time-off in Lieu)'),
          ),
        ],
        cancelButton: CupertinoActionSheetAction(
          isDefaultAction: true,
          onPressed: () => Navigator.pop(context),
          child: const Text('Batal'),
        ),
      ),
    );
  }

  Future<void> _handleCreateRequest() async {
    final user = context.read<AuthProvider>().userData;
    if (user == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Sesi Berakhir. Silakan login kembali.'), backgroundColor: CupertinoColors.destructiveRed),
      );
      return;
    }

    if (_dateCtrl.text.isEmpty || _startTimeCtrl.text.isEmpty || _endTimeCtrl.text.isEmpty || _reasonCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Form Belum Lengkap'), backgroundColor: CupertinoColors.destructiveRed),
      );
      return;
    }

    final dateRegex = RegExp(r'^\d{4}-\d{2}-\d{2}$');
    final timeRegex = RegExp(r'^\d{2}:\d{2}$');

    if (!dateRegex.hasMatch(_dateCtrl.text)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Format Tanggal Salah (YYYY-MM-DD)'), backgroundColor: CupertinoColors.destructiveRed));
      return;
    }
    if (!timeRegex.hasMatch(_startTimeCtrl.text) || !timeRegex.hasMatch(_endTimeCtrl.text)) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Format Jam Salah (HH:MM)'), backgroundColor: CupertinoColors.destructiveRed));
      return;
    }

    if (_proofPhotoPath == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Wajib melampirkan foto bukti lembur!'), backgroundColor: CupertinoColors.destructiveRed));
      return;
    }

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
        'compensation_type': _compensationType,
        'status': 'Pending',
        'proof_base64': base64Image,
      };

      final result = await context.read<OvertimeProvider>().submitOvertimeRequest(payload);
      if (!mounted) return;

      if (result['status'] == 'success') {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Pengajuan lembur berhasil dikirim!'), backgroundColor: CupertinoColors.activeGreen),
        );
        setState(() {
          _showForm = false;
        });
        context.read<OvertimeProvider>().fetchOvertimeRequests(user['id']);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Error'), backgroundColor: CupertinoColors.destructiveRed),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Terjadi kesalahan: $e'), backgroundColor: CupertinoColors.destructiveRed),
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

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Pengajuan Lembur'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () {
            if (_showForm) {
              setState(() => _showForm = false);
            } else {
              _setFormDefaults();
            }
          },
          child: Icon(_showForm ? CupertinoIcons.list_bullet : CupertinoIcons.add_circled),
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
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Formulir Lembur Baru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
            const SizedBox(height: 20),
            
            _buildLabel('TANGGAL LEMBUR'),
            GestureDetector(
              onTap: () => _showDatePickerModal(_dateCtrl),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(_dateCtrl.text.isEmpty ? 'Pilih Tanggal' : _dateCtrl.text, style: TextStyle(color: _dateCtrl.text.isEmpty ? CupertinoColors.systemGrey : (isDark ? CupertinoColors.white : CupertinoColors.black), fontSize: 14)),
                    const Icon(CupertinoIcons.calendar, size: 16, color: CupertinoColors.systemGrey),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('JAM MULAI'),
                      GestureDetector(
                        onTap: () => _showTimePickerModal(_startTimeCtrl),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                          ),
                          child: Text(_startTimeCtrl.text.isEmpty ? '--:--' : _startTimeCtrl.text, style: TextStyle(color: _startTimeCtrl.text.isEmpty ? CupertinoColors.systemGrey : (isDark ? CupertinoColors.white : CupertinoColors.black), fontSize: 14)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _buildLabel('JAM SELESAI'),
                      GestureDetector(
                        onTap: () => _showTimePickerModal(_endTimeCtrl),
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                          decoration: BoxDecoration(
                            color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                          ),
                          child: Text(_endTimeCtrl.text.isEmpty ? '--:--' : _endTimeCtrl.text, style: TextStyle(color: _endTimeCtrl.text.isEmpty ? CupertinoColors.systemGrey : (isDark ? CupertinoColors.white : CupertinoColors.black), fontSize: 14)),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),
            
            _buildLabel('ALASAN / KEPERLUAN LEMBUR'),
            CupertinoTextField(
              controller: _reasonCtrl,
              maxLines: 4,
              placeholder: 'Sebutkan detail pekerjaan...',
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
              ),
            ),
            const SizedBox(height: 16),
            
            _buildLabel('PILIHAN KOMPENSASI'),
            GestureDetector(
              onTap: _showCompensationActionSheet,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                decoration: BoxDecoration(
                  color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5))
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        _compensationType == 'Paid' ? 'Dibayar Uang (Sesuai Kemenaker)' : 'Ditukar Cuti (Time-off in Lieu)', 
                        style: TextStyle(color: isDark ? CupertinoColors.white : CupertinoColors.black, fontSize: 14)
                      )
                    ),
                    const Icon(CupertinoIcons.chevron_down, size: 16, color: CupertinoColors.systemGrey),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 16),
            
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6, 
                borderRadius: BorderRadius.circular(12), 
                border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5))
              ),
              child: Column(
                children: [
                  const Icon(CupertinoIcons.camera, color: CupertinoColors.systemGrey, size: 32),
                  const SizedBox(height: 8),
                  _buildLabel('FOTO BUKTI LEMBUR'),
                  const Text('Wajib melampirkan foto diri sedang bekerja di lokasi', style: TextStyle(fontSize: 10, color: CupertinoColors.systemGrey), textAlign: TextAlign.center),
                  const SizedBox(height: 12),
                  if (_proofPhotoPath != null) ...[
                    ClipRRect(borderRadius: BorderRadius.circular(8), child: Image.file(File(_proofPhotoPath!), height: 120, width: double.infinity, fit: BoxFit.cover)),
                    const SizedBox(height: 8),
                    CupertinoButton(
                      padding: EdgeInsets.zero,
                      onPressed: _showPhotoPreview, 
                      child: const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(CupertinoIcons.eye, size: 16),
                          SizedBox(width: 6),
                          Text('Lihat Pratinjau', style: TextStyle(fontSize: 12))
                        ],
                      )
                    ),
                  ],
                  CupertinoButton(
                    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
                    color: CupertinoColors.activeBlue,
                    onPressed: _isPhotoLoading ? null : _takePhoto,
                    child: Text(_proofPhotoPath == null ? 'Ambil Foto' : 'Ubah Foto', style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold)),
                  )
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            Consumer<OvertimeProvider>(
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
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
    );
  }

  Widget _buildHistoryList(bool isDark) {
    return Consumer<OvertimeProvider>(
      builder: (context, provider, child) {
        if (provider.isLoading) {
          return const Center(child: CupertinoActivityIndicator(radius: 16));
        }

        return CustomScrollView(
          slivers: [
            CupertinoSliverRefreshControl(
              onRefresh: () async {
                final user = context.read<AuthProvider>().userData;
                if (user != null) await provider.fetchOvertimeRequests(user['id']);
              },
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: provider.requests.isEmpty
                ? SliverFillRemaining(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(CupertinoIcons.time, size: 48, color: CupertinoColors.systemGrey),
                        const SizedBox(height: 12),
                        const Text('Belum ada riwayat pengajuan lembur.', style: TextStyle(color: CupertinoColors.systemGrey)),
                        const SizedBox(height: 16),
                        CupertinoButton(
                          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                          color: CupertinoColors.activeBlue,
                          onPressed: _setFormDefaults,
                          child: const Text('Ajukan Lembur Baru'),
                        )
                      ],
                    ),
                  )
                : SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final item = provider.requests[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      child: IosCard(
                        padding: const EdgeInsets.all(16),
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
                                      Text(item.date, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                      const SizedBox(height: 4),
                                      Text('${item.startTime} - ${item.endTime} (${item.durationHours} Jam)', style: const TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                                    ],
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: _getStatusColor(item.status).withValues(alpha: 0.1),
                                    border: Border.all(color: _getStatusColor(item.status).withValues(alpha: 0.5)),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(
                                    _getStatusLabel(item.status),
                                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _getStatusColor(item.status)),
                                  ),
                                )
                              ],
                            ),
                            const Padding(
                              padding: EdgeInsets.symmetric(vertical: 12),
                              child: Divider(height: 1, color: CupertinoColors.systemGrey4),
                            ),
                            const Text('Alasan Kerja Lembur:', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
                            const SizedBox(height: 4),
                            Text(item.reason, style: TextStyle(fontSize: 12, color: isDark ? CupertinoColors.systemGrey2 : CupertinoColors.black)),
                            if (item.pdfUrl != null && item.pdfUrl!.isNotEmpty) ...[
                              const SizedBox(height: 12),
                              Align(
                                alignment: Alignment.centerRight,
                                child: CupertinoButton(
                                  padding: EdgeInsets.zero,
                                  onPressed: () {
                                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Fitur Unduh Dokumen (memerlukan url_launcher)')));
                                  },
                                  child: const Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(CupertinoIcons.doc_text_fill, size: 16),
                                      SizedBox(width: 4),
                                      Text('Unduh TTD PDF', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold)),
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
