import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../data/timesheet_service.dart';

class TimesheetScreen extends StatefulWidget {
  const TimesheetScreen({super.key});

  @override
  State<TimesheetScreen> createState() => _TimesheetScreenState();
}

class _TimesheetScreenState extends State<TimesheetScreen> {
  final TimesheetService _timesheetService = TimesheetService();
  
  final TextEditingController _projectCtrl = TextEditingController();
  final TextEditingController _taskDescCtrl = TextEditingController();
  final TextEditingController _durationCtrl = TextEditingController();
  
  bool _isLoading = false;

  @override
  void dispose() {
    _projectCtrl.dispose();
    _taskDescCtrl.dispose();
    _durationCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    final projectName = _projectCtrl.text;
    final taskDesc = _taskDescCtrl.text;
    final durationStr = _durationCtrl.text.replaceAll(',', '.');

    if (projectName.isEmpty || taskDesc.isEmpty || durationStr.isEmpty) {
      _showError('Harap isi semua kolom pekerjaan.');
      return;
    }

    final durationHours = double.tryParse(durationStr);
    if (durationHours == null || durationHours <= 0) {
      _showError('Durasi kerja harus berupa angka (misal: 4 atau 4.5)');
      return;
    }

    // Confirmation Dialog
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Simpan Laporan?'),
        content: const Text('Apakah laporan aktivitas kerja harian Anda sudah benar?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal', style: TextStyle(color: Colors.grey))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Simpan', style: TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold))),
        ],
      )
    );

    if (confirm != true) return;

    setState(() => _isLoading = true);
    try {
      // API expects taskDesc to contain the project name conceptually, or we combine them.
      // In RN it passed `task_description: taskDesc`. We will prefix the project name for clarity.
      final fullDesc = '[$projectName] $taskDesc';
      
      await _timesheetService.submitTimesheet(fullDesc, durationHours);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Laporan Timesheet harian berhasil disimpan.'), backgroundColor: Colors.green));
        context.pop();
      }
    } catch (e) {
      _showError(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: Colors.red));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Logbook Harian', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppConstants.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20).copyWith(bottom: 100),
        child: Column(
          children: [
            // Info Box
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.orange.shade50, borderRadius: BorderRadius.circular(16)),
              child: Row(
                children: [
                  Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(color: Colors.orange.shade100, borderRadius: BorderRadius.circular(20)),
                    child: const Icon(Icons.access_time_filled, color: Colors.orange),
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Timesheet / Logbook', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.deepOrange)),
                        SizedBox(height: 4),
                        Text('Catat aktivitas pekerjaan yang Anda lakukan hari ini beserta durasi pengerjaannya.', style: TextStyle(fontSize: 12, color: Colors.deepOrange, height: 1.5)),
                      ],
                    ),
                  )
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Form
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))]),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildLabel('Nama Proyek / Modul'),
                  TextField(
                    controller: _projectCtrl,
                    textCapitalization: TextCapitalization.words,
                    decoration: _inputDecoration('Contoh: Aplikasi WKN Mobile'),
                  ),
                  const SizedBox(height: 20),

                  _buildLabel('Deskripsi Tugas (Task)'),
                  TextField(
                    controller: _taskDescCtrl,
                    maxLines: 4,
                    textCapitalization: TextCapitalization.sentences,
                    decoration: _inputDecoration('Deskripsikan pekerjaan yang Anda lakukan hari ini...'),
                  ),
                  const SizedBox(height: 20),

                  _buildLabel('Durasi Pengerjaan (Jam)'),
                  TextField(
                    controller: _durationCtrl,
                    keyboardType: const TextInputType.numberWithOptions(decimal: true),
                    decoration: _inputDecoration('Misal: 4.5').copyWith(
                      suffixIcon: const Padding(
                        padding: EdgeInsets.all(14.0),
                        child: Text('Jam', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                      )
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
      bottomSheet: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, -4))],
        ),
        child: SizedBox(
          width: double.infinity,
          height: 54,
          child: ElevatedButton(
            onPressed: _isLoading ? null : _handleSubmit,
            style: ElevatedButton.styleFrom(
              backgroundColor: AppConstants.primaryColor,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              elevation: 0,
            ),
            child: _isLoading 
              ? const CircularProgressIndicator(color: Colors.white)
              : const Text('Simpan Timesheet', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppConstants.textPrimary)),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
      filled: true,
      fillColor: const Color(0xFFF8F9FB),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: BorderSide(color: Colors.grey.shade200)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: AppConstants.primaryColor)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }
}
