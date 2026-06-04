import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../data/payslip_service.dart';

class SalaryCorrectionScreen extends StatefulWidget {
  const SalaryCorrectionScreen({super.key});

  @override
  State<SalaryCorrectionScreen> createState() => _SalaryCorrectionScreenState();
}

class _SalaryCorrectionScreenState extends State<SalaryCorrectionScreen> {
  final PayslipService _payslipService = PayslipService();
  final String _period = 'April 2026';
  final TextEditingController _messageCtrl = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _messageCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (_messageCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mohon tuliskan rincian koreksi yang Anda ajukan.')));
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final result = await _payslipService.submitSalaryCorrection(_period, _messageCtrl.text.trim());
      if (!mounted) return;

      if (result['status'] == 'success') {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pengajuan koreksi gaji terkirim.'), backgroundColor: Colors.green));
        context.pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Error'), backgroundColor: Colors.red));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Terjadi kesalahan: $e'), backgroundColor: Colors.red));
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Koreksi Gaji', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppConstants.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            // Warning Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.red.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info, color: Colors.red),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Gunakan form ini hanya jika ada ketidaksesuaian nominal pada rincian gaji Anda bulan ini. Pengajuan palsu dapat dikenakan sanksi indisipliner.',
                      style: TextStyle(color: Colors.red, fontSize: 12, fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Form Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8, offset: const Offset(0, 2))],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Periode Gaji', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppConstants.textPrimary)),
                  const SizedBox(height: 8),
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.grey[50],
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(_period, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppConstants.textPrimary)),
                  ),
                  const SizedBox(height: 20),
                  const Text('Rincian Kesalahan / Koreksi', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppConstants.textPrimary)),
                  const SizedBox(height: 8),
                  TextField(
                    controller: _messageCtrl,
                    maxLines: 6,
                    decoration: InputDecoration(
                      hintText: 'Contoh: Tunjangan lembur tanggal 15 belum dimasukkan...',
                      hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
                      filled: true,
                      fillColor: Colors.grey[50],
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              height: 56,
              child: ElevatedButton.icon(
                onPressed: _isSubmitting ? null : _handleSubmit,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.red,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 5,
                ),
                icon: _isSubmitting ? const SizedBox() : const Icon(Icons.send, color: Colors.white, size: 20),
                label: _isSubmitting 
                  ? const CircularProgressIndicator(color: Colors.white)
                  : const Text('KIRIM PENGAJUAN', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, letterSpacing: 1)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
