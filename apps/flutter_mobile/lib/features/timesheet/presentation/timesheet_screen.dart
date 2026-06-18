import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
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
    showCupertinoDialog(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Simpan Laporan?'),
        content: const Text('Apakah laporan aktivitas kerja harian Anda sudah benar?'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Batal', style: TextStyle(color: CupertinoColors.systemGrey))
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () {
              Navigator.pop(ctx);
              _processSubmit(projectName, taskDesc, durationHours);
            },
            child: const Text('Simpan')
          ),
        ],
      )
    );
  }

  Future<void> _processSubmit(String projectName, String taskDesc, double durationHours) async {
    setState(() => _isLoading = true);
    try {
      final fullDesc = '[$projectName] $taskDesc';
      
      await _timesheetService.submitTimesheet(fullDesc, durationHours);
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Laporan Timesheet harian berhasil disimpan.'), backgroundColor: CupertinoColors.activeGreen));
        context.pop();
      }
    } catch (e) {
      _showError(e.toString().replaceAll('Exception: ', ''));
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(msg), backgroundColor: CupertinoColors.destructiveRed));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        middle: const Text('Logbook Harian'),
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _isLoading ? null : _handleSubmit,
          child: _isLoading 
            ? const CupertinoActivityIndicator() 
            : const Icon(CupertinoIcons.checkmark_alt, color: CupertinoColors.activeBlue),
        ),
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              // Info Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5))
                ),
                child: Row(
                  children: [
                    Container(
                      width: 40, height: 40,
                      decoration: BoxDecoration(color: CupertinoColors.activeOrange.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(20)),
                      child: const Icon(CupertinoIcons.time, color: CupertinoColors.activeOrange),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Timesheet / Logbook', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                          const SizedBox(height: 4),
                          const Text('Catat aktivitas pekerjaan yang Anda lakukan hari ini beserta durasi pengerjaannya.', style: TextStyle(fontSize: 12, color: CupertinoColors.systemGrey, height: 1.5)),
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
                decoration: BoxDecoration(
                  color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5))
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildLabel('Nama Proyek / Modul', isDark),
                    CupertinoTextField(
                      controller: _projectCtrl,
                      textCapitalization: TextCapitalization.words,
                      placeholder: 'Contoh: Aplikasi WKN Mobile',
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                      ),
                    ),
                    const SizedBox(height: 20),

                    _buildLabel('Deskripsi Tugas (Task)', isDark),
                    CupertinoTextField(
                      controller: _taskDescCtrl,
                      maxLines: 4,
                      textCapitalization: TextCapitalization.sentences,
                      placeholder: 'Deskripsikan pekerjaan yang Anda lakukan hari ini...',
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                      ),
                    ),
                    const SizedBox(height: 20),

                    _buildLabel('Durasi Pengerjaan (Jam)', isDark),
                    CupertinoTextField(
                      controller: _durationCtrl,
                      keyboardType: const TextInputType.numberWithOptions(decimal: true),
                      placeholder: 'Misal: 4.5',
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                      ),
                      suffix: const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text('Jam', style: TextStyle(color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                      ),
                    ),
                    const SizedBox(height: 30),
                    
                    SizedBox(
                      width: double.infinity,
                      child: CupertinoButton.filled(
                        onPressed: _isLoading ? null : _handleSubmit,
                        child: _isLoading 
                          ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                          : const Text('Simpan Timesheet', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text, bool isDark) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(text, style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
    );
  }
}
