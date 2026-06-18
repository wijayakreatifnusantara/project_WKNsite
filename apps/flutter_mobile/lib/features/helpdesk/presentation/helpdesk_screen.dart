import 'package:flutter/services.dart';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/theme_provider.dart';

class HelpdeskScreen extends StatefulWidget {
  const HelpdeskScreen({super.key});

  @override
  State<HelpdeskScreen> createState() => _HelpdeskScreenState();
}

class _HelpdeskScreenState extends State<HelpdeskScreen> {
  final TextEditingController _subjectCtrl = TextEditingController();
  final TextEditingController _descCtrl = TextEditingController();
  
  String _category = 'IT_SUPPORT';
  
  final List<Map<String, String>> _categories = [
    {'id': 'IT_SUPPORT', 'label': 'IT Support'},
    {'id': 'HR', 'label': 'HR & Kepegawaian'},
    {'id': 'GA', 'label': 'General Affairs'},
  ];

  @override
  void dispose() {
    _subjectCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  void _showCategoryPicker() {
    showCupertinoModalPopup(
      context: context,
      builder: (context) => CupertinoActionSheet(
        title: const Text('Pilih Kategori'),
        actions: _categories.map((cat) {
          return CupertinoActionSheetAction(
            onPressed: () {
              setState(() => _category = cat['id']!);
              Navigator.pop(context);
            },
            child: Text(cat['label']!),
          );
        }).toList(),
        cancelButton: CupertinoActionSheetAction(
          isDefaultAction: true,
          onPressed: () => Navigator.pop(context),
          child: const Text('Batal'),
        ),
      ),
    );
  }

  void _handleSubmit() {
    if (context.read<ThemeProvider>().hapticEnabled) HapticFeedback.lightImpact();
    if (_subjectCtrl.text.isEmpty || _descCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Harap isi subjek dan detail keluhan Anda.'), backgroundColor: CupertinoColors.destructiveRed));
      return;
    }

    showCupertinoDialog(
      context: context,
      builder: (ctx) => CupertinoAlertDialog(
        title: const Text('Kirim Tiket?'),
        content: const Text('Tiket ini akan diteruskan ke tim terkait.'),
        actions: [
          CupertinoDialogAction(
            onPressed: () => Navigator.pop(ctx), 
            child: const Text('Batal', style: TextStyle(color: CupertinoColors.systemGrey))
          ),
          CupertinoDialogAction(
            isDefaultAction: true,
            onPressed: () {
              Navigator.pop(ctx);
              _simulateSubmit();
            }, 
            child: const Text('Kirim')
          ),
        ],
      )
    );
  }

  void _simulateSubmit() {
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tiket bantuan Anda telah dibuat. Tim kami akan segera menindaklanjutinya.'), backgroundColor: CupertinoColors.activeGreen));
    if (context.canPop()) {
      context.pop();
    } else {
      _subjectCtrl.clear();
      _descCtrl.clear();
      setState(() => _category = 'IT_SUPPORT');
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool canPop = context.canPop();
    final isDark = context.isDarkMode;
    
    final selectedCatLabel = _categories.firstWhere((c) => c['id'] == _category)['label'];

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        automaticallyImplyLeading: canPop,
        middle: const Text('Pusat Bantuan'),
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => context.push('/helpdesk-history'),
          child: const Icon(CupertinoIcons.clock),
        ),
      ),
      child: SafeArea(
        child: LayoutBuilder(
          builder: (context, constraints) {
            return SingleChildScrollView(
              child: ConstrainedBox(
                constraints: BoxConstraints(minHeight: constraints.maxHeight),
                child: IntrinsicHeight(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white, 
                        borderRadius: BorderRadius.circular(16), 
                        border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5))
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Buat Tiket Baru', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                          const SizedBox(height: 4),
                          const Text('Sampaikan kendala IT, masalah perangkat, atau pertanyaan HRD Anda di sini.', style: TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
                          const SizedBox(height: 24),

                          // Kategori Dropdown via Action Sheet
                          const Text('KATEGORI', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                          const SizedBox(height: 10),
                          GestureDetector(
                            onTap: _showCategoryPicker,
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
                                  Text(selectedCatLabel!, style: TextStyle(color: isDark ? CupertinoColors.white : CupertinoColors.black, fontSize: 14)),
                                  const Icon(CupertinoIcons.chevron_down, size: 16, color: CupertinoColors.systemGrey),
                                ],
                              ),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Subject
                          const Text('SUBJEK KENDALA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                          const SizedBox(height: 10),
                          CupertinoTextField(
                            controller: _subjectCtrl,
                            placeholder: 'Contoh: Laptop rusak / Aplikasi Error',
                            padding: const EdgeInsets.all(16),
                            onChanged: (val) {
                              if (context.read<ThemeProvider>().hapticEnabled) {
                                HapticFeedback.selectionClick();
                              }
                            },
                            decoration: BoxDecoration(
                              color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                            ),
                          ),
                          const SizedBox(height: 24),

                          // Detail
                          const Text('DETAIL KENDALA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                          const SizedBox(height: 10),
                          Expanded(
                            child: CupertinoTextField(
                              controller: _descCtrl,
                              maxLines: null,
                              expands: true,
                              textAlignVertical: TextAlignVertical.top,
                              placeholder: 'Jelaskan kendala Anda secara rinci di sini...',
                              padding: const EdgeInsets.all(16),
                              onChanged: (val) {
                                if (context.read<ThemeProvider>().hapticEnabled) {
                                  HapticFeedback.selectionClick();
                                }
                              },
                              decoration: BoxDecoration(
                                color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: CupertinoColors.systemGrey4.withValues(alpha: 0.5)),
                              ),
                            ),
                          ),
                          const SizedBox(height: 30),

                          // Submit
                          SizedBox(
                            width: double.infinity,
                            child: CupertinoButton.filled(
                              onPressed: _handleSubmit,
                              child: const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Icon(CupertinoIcons.headphones, size: 20),
                                  SizedBox(width: 8),
                                  Text('KIRIM TIKET', style: TextStyle(fontWeight: FontWeight.bold, letterSpacing: 1)),
                                ],
                              ),
                            ),
                          )
                        ],
                      ),
                    ),
                  ),
                ),
              ),
            );
          },
        ),
      ),
    );
  }
}
