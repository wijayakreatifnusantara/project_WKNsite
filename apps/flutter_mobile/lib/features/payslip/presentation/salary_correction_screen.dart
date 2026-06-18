import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../data/payslip_service.dart';
import '../../../widgets/ios_card.dart';

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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Mohon tuliskan rincian koreksi yang Anda ajukan.'), backgroundColor: CupertinoColors.destructiveRed));
      return;
    }

    setState(() => _isSubmitting = true);

    try {
      final result = await _payslipService.submitSalaryCorrection(_period, _messageCtrl.text.trim());
      if (!mounted) return;

      if (result['status'] == 'success') {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Pengajuan koreksi gaji terkirim.'), backgroundColor: CupertinoColors.activeGreen));
        context.pop();
      } else {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(result['message'] ?? 'Error'), backgroundColor: CupertinoColors.destructiveRed));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Terjadi kesalahan: $e'), backgroundColor: CupertinoColors.destructiveRed));
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
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Koreksi Gaji'),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Warning Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: CupertinoColors.destructiveRed.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Icon(CupertinoIcons.info_circle_fill, color: CupertinoColors.destructiveRed, size: 20),
                    SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        'Gunakan form ini hanya jika ada ketidaksesuaian nominal pada rincian gaji Anda bulan ini. Pengajuan palsu dapat dikenakan sanksi indisipliner.',
                        style: TextStyle(color: CupertinoColors.destructiveRed, fontSize: 12, fontWeight: FontWeight.bold, height: 1.4),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Form Card
              const Padding(
                padding: EdgeInsets.only(left: 16, bottom: 8),
                child: Text('FORM PENGAJUAN', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
              ),
              IosCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Periode Gaji', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                    const SizedBox(height: 8),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(_period, style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.systemGrey2 : CupertinoColors.systemGrey)),
                    ),
                    const SizedBox(height: 20),
                    Text('Rincian Kesalahan / Koreksi', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                    const SizedBox(height: 8),
                    CupertinoTextField(
                      controller: _messageCtrl,
                      maxLines: 6,
                      placeholder: 'Contoh: Tunjangan lembur tanggal 15 belum dimasukkan...',
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),

              // Submit Button
              SizedBox(
                width: double.infinity,
                child: CupertinoButton(
                  color: CupertinoColors.destructiveRed,
                  onPressed: _isSubmitting ? null : _handleSubmit,
                  child: _isSubmitting 
                    ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(CupertinoIcons.paperplane_fill, color: CupertinoColors.white, size: 18),
                          SizedBox(width: 8),
                          Text('KIRIM PENGAJUAN', style: TextStyle(fontWeight: FontWeight.bold)),
                        ],
                      ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
