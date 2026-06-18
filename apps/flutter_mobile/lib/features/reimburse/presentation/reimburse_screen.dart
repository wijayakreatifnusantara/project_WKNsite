import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import '../../../core/utils/constants.dart';
import '../data/reimburse_service.dart';

class ReimburseScreen extends StatefulWidget {
  const ReimburseScreen({super.key});

  @override
  State<ReimburseScreen> createState() => _ReimburseScreenState();
}

class _ReimburseScreenState extends State<ReimburseScreen> {
  final ReimburseService _reimburseService = ReimburseService();
  final ImagePicker _picker = ImagePicker();
  
  final TextEditingController _amountCtrl = TextEditingController();
  final TextEditingController _descCtrl = TextEditingController();
  
  final _formKey = GlobalKey<FormState>();
  bool _hasAttemptedSubmit = false;
  XFile? _selectedImage;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _amountCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? image = await _picker.pickImage(
        source: source,
        imageQuality: 50,
      );
      if (image != null) {
        setState(() {
          _selectedImage = image;
        });
      }
    } catch (e) {
      debugPrint('Error picking image: $e');
    }
  }

  void _showImageSourceActionSheet() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('Lampirkan Bukti'),
        message: const Text('Pilih dari mana Anda ingin melampirkan foto nota atau struk.'),
        actions: [
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _pickImage(ImageSource.camera);
            },
            child: const Text('Kamera'),
          ),
          CupertinoActionSheetAction(
            onPressed: () {
              Navigator.pop(context);
              _pickImage(ImageSource.gallery);
            },
            child: const Text('Galeri Foto'),
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

  Future<void> _handleSubmit() async {
    setState(() {
      _hasAttemptedSubmit = true;
    });

    if (!_formKey.currentState!.validate() || _selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Form Tidak Lengkap. Harap perbaiki isian yang salah dan lampirkan bukti pembayaran.'), backgroundColor: CupertinoColors.destructiveRed));
      return;
    }

    showCupertinoDialog(
      context: context,
      builder: (context) => CupertinoAlertDialog(
        title: const Text('Kirim Pengajuan?'),
        content: const Text('Apakah Anda yakin data reimburse sudah benar?'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(context),
            child: const Text('Batal', style: TextStyle(color: CupertinoColors.systemGrey)),
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () {
              Navigator.pop(context);
              _processSubmit();
            },
            child: const Text('Kirim'),
          ),
        ],
      ),
    );
  }

  Future<void> _processSubmit() async {
    setState(() => _isSubmitting = true);

    try {
      final bytes = await _selectedImage!.readAsBytes();
      final base64Image = 'data:image/jpeg;base64,${base64Encode(bytes)}';
      
      final cleanAmount = _amountCtrl.text.replaceAll(RegExp(r'[^0-9]'), '');

      final payload = {
        'title': _descCtrl.text.trim(),
        'category': 'Lainnya',
        'amount': int.parse(cleanAmount),
        'receipt_image': base64Image
      };

      final result = await _reimburseService.submitReimburse(payload);
      if (!mounted) return;

      if (result['status'] == 'success') {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pengajuan reimburse Anda telah terkirim.'), backgroundColor: CupertinoColors.activeGreen));
        context.pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Error'), backgroundColor: CupertinoColors.destructiveRed));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal mengirim data: $e'), backgroundColor: CupertinoColors.destructiveRed));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Pengajuan Reimburse'),
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5))
            ),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Form Klaim Pengeluaran', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                  const SizedBox(height: 4),
                  const Text('Silakan isi data pengeluaran operasional atau medis Anda di bawah ini beserta bukti struk/nota yang sah.', style: TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, height: 1.5)),
                  const SizedBox(height: 24),
                  
                  const Text('NOMINAL (RP)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                  const SizedBox(height: 6),
                  CupertinoTextFormFieldRow(
                    controller: _amountCtrl,
                    keyboardType: TextInputType.number,
                    autovalidateMode: AutovalidateMode.onUserInteraction,
                    placeholder: 'Contoh: 150000',
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(
                      color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Nominal tidak boleh kosong';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  const Text('KETERANGAN PENGELUARAN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                  const SizedBox(height: 6),
                  CupertinoTextFormFieldRow(
                    controller: _descCtrl,
                    maxLines: 3,
                    autovalidateMode: AutovalidateMode.onUserInteraction,
                    placeholder: 'Misal: Biaya bensin dinas ke site A...',
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
                    decoration: BoxDecoration(
                      color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) return 'Keterangan tidak boleh kosong';
                      if (value.length < 5) return 'Keterangan terlalu singkat';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  
                  const Text('LAMPIRAN BUKTI (FOTO/PDF)', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                  const SizedBox(height: 6),
                  GestureDetector(
                    onTap: _showImageSourceActionSheet,
                    child: Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _selectedImage != null ? CupertinoColors.activeGreen.withValues(alpha: 0.1) : (isDark ? CupertinoColors.black : CupertinoColors.systemGrey6),
                        border: Border.all(color: (_hasAttemptedSubmit && _selectedImage == null) ? CupertinoColors.destructiveRed : (_selectedImage != null ? CupertinoColors.activeGreen : CupertinoColors.systemGrey4.withValues(alpha: 0.5))),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: _selectedImage != null
                        ? Row(
                            children: [
                              const Icon(CupertinoIcons.check_mark_circled_solid, color: CupertinoColors.activeGreen, size: 24),
                              const SizedBox(width: 10),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(_selectedImage!.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                    const Text('Bukti Terlampir', style: TextStyle(fontSize: 10, color: CupertinoColors.systemGrey)),
                                  ],
                                ),
                              ),
                              CupertinoButton(
                                padding: EdgeInsets.zero,
                                child: const Icon(CupertinoIcons.xmark_circle_fill, color: CupertinoColors.destructiveRed),
                                onPressed: () => setState(() => _selectedImage = null),
                              )
                            ],
                          )
                        : Column(
                            children: [
                              const Icon(CupertinoIcons.camera, size: 28, color: CupertinoColors.systemGrey),
                              const SizedBox(height: 8),
                              Text('Tap untuk foto atau pilih dokumen struk', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey.darkColor)),
                            ],
                          ),
                    ),
                  ),
                  const SizedBox(height: 24),
                  
                  SizedBox(
                    width: double.infinity,
                    child: CupertinoButton.filled(
                      onPressed: _isSubmitting ? null : _handleSubmit,
                      child: _isSubmitting
                        ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(CupertinoIcons.paperplane_fill, size: 18),
                              SizedBox(width: 8),
                              Text('KIRIM KLAIM', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                            ],
                          ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
