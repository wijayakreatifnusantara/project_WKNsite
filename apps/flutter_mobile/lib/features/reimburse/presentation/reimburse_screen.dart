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
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (context) => SafeArea(
        child: Wrap(
          children: [
            const Padding(
              padding: EdgeInsets.all(16),
              child: Text('Lampirkan Bukti', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
            ListTile(
              leading: const Icon(Icons.camera_alt, color: AppConstants.primaryColor),
              title: const Text('Kamera'),
              onTap: () {
                Navigator.of(context).pop();
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: AppConstants.primaryColor),
              title: const Text('Galeri Foto'),
              onTap: () {
                Navigator.of(context).pop();
                _pickImage(ImageSource.gallery);
              },
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleSubmit() async {
    setState(() {
      _hasAttemptedSubmit = true;
    });

    if (!_formKey.currentState!.validate() || _selectedImage == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Form Tidak Lengkap. Harap perbaiki isian yang salah dan lampirkan bukti pembayaran.'), backgroundColor: Colors.red));
      return;
    }

    // Confirm dialog
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Kirim Pengajuan?'),
        content: const Text('Apakah Anda yakin data reimburse sudah benar?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Batal'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.of(context).pop();
              _processSubmit();
            },
            style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor),
            child: Text('Kirim', style: TextStyle(color: context.surfaceColor)),
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
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pengajuan reimburse Anda telah terkirim.'), backgroundColor: Colors.green));
        context.pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Error'), backgroundColor: Colors.red));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal mengirim data: $e'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Pengajuan Reimburse', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: context.surfaceColor,
            borderRadius: BorderRadius.circular(20),
            boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))],
          ),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
              Text('Form Klaim Pengeluaran', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: context.textPrimary)),
              SizedBox(height: 4),
              Text('Silakan isi data pengeluaran operasional atau medis Anda di bawah ini beserta bukti struk/nota yang sah.', style: TextStyle(fontSize: 11, color: context.textSecondary, height: 1.5)),
              SizedBox(height: 24),
              
              Text('NOMINAL (RP)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: context.textSecondary, letterSpacing: 0.5)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _amountCtrl,
                keyboardType: TextInputType.number,
                autovalidateMode: AutovalidateMode.onUserInteraction,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Nominal tidak boleh kosong';
                  return null;
                },
                decoration: InputDecoration(
                  hintText: 'Contoh: 150000',
                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: context.isDarkMode ? context.surfaceColor : Colors.grey[50],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
                  errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.red)),
                  focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.red, width: 2)),
                ),
              ),
              SizedBox(height: 16),
              
              Text('KETERANGAN PENGELUARAN', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: context.textSecondary, letterSpacing: 0.5)),
              const SizedBox(height: 6),
              TextFormField(
                controller: _descCtrl,
                maxLines: 3,
                autovalidateMode: AutovalidateMode.onUserInteraction,
                validator: (value) {
                  if (value == null || value.isEmpty) return 'Keterangan tidak boleh kosong';
                  if (value.length < 5) return 'Keterangan terlalu singkat';
                  return null;
                },
                decoration: InputDecoration(
                  hintText: 'Misal: Biaya bensin dinas ke site A...',
                  hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                  filled: true,
                  fillColor: context.isDarkMode ? context.surfaceColor : Colors.grey[50],
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
                  enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
                  errorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.red)),
                  focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.red, width: 2)),
                ),
              ),
              SizedBox(height: 16),
              
              Text('LAMPIRAN BUKTI (FOTO/PDF)', style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: context.textSecondary, letterSpacing: 0.5)),
              const SizedBox(height: 6),
              GestureDetector(
                onTap: _showImageSourceActionSheet,
                child: Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: context.isDarkMode ? context.surfaceColor : Colors.grey[50],
                    border: Border.all(color: (_hasAttemptedSubmit && _selectedImage == null) ? Colors.red : context.borderColor, style: BorderStyle.solid),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: _selectedImage != null
                    ? Row(
                        children: [
                          const Icon(Icons.check_circle, color: Colors.green, size: 24),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_selectedImage!.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: context.textPrimary)),
                                Text('Bukti Terlampir', style: TextStyle(fontSize: 10, color: context.textSecondary)),
                              ],
                            ),
                          ),
                          IconButton(
                            icon: const Icon(Icons.cancel, color: Colors.red),
                            onPressed: () => setState(() => _selectedImage = null),
                          )
                        ],
                      )
                    : Column(
                        children: [
                          const Icon(Icons.camera_alt_outlined, size: 28, color: Colors.grey),
                          const SizedBox(height: 8),
                          Text('Tap untuk foto atau pilih dokumen struk', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey.shade600)),
                        ],
                      ),
                ),
              ),
              const SizedBox(height: 24),
              
              SizedBox(
                width: double.infinity,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppConstants.primaryColor,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 4,
                  ),
                  icon: _isSubmitting ? SizedBox() : Icon(Icons.send, color: context.surfaceColor, size: 18),
                  label: _isSubmitting
                    ? CircularProgressIndicator(color: context.surfaceColor)
                    : Text('KIRIM KLAIM', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, letterSpacing: 1)),
                ),
              ),
            ],
          ),
        ),
      ),
      ),
    );
  }
}
