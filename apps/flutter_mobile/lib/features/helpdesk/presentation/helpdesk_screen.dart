import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

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

  void _handleSubmit() {
    if (_subjectCtrl.text.isEmpty || _descCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Harap isi subjek dan detail keluhan Anda.'), backgroundColor: Colors.red));
      return;
    }

    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Kirim Tiket?'),
        content: const Text('Tiket ini akan diteruskan ke tim terkait.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Batal', style: TextStyle(color: Colors.grey))),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              _simulateSubmit();
            }, 
            child: const Text('Kirim', style: TextStyle(color: AppConstants.primaryColor, fontWeight: FontWeight.bold))
          ),
        ],
      )
    );
  }

  void _simulateSubmit() {
    // In RN this was just UI mock.
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tiket bantuan Anda telah dibuat. Tim kami akan segera menindaklanjutinya.'), backgroundColor: Colors.green));
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
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        automaticallyImplyLeading: canPop,
        title: Text('Pusat Bantuan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        actions: [
          IconButton(
            icon: const Icon(Icons.history),
            onPressed: () => context.push('/helpdesk-history'),
            tooltip: 'Riwayat Tiket',
          )
        ],
      ),
      body: LayoutBuilder(
        builder: (context, constraints) {
          return SingleChildScrollView(
            child: ConstrainedBox(
              constraints: BoxConstraints(minHeight: constraints.maxHeight),
              child: IntrinsicHeight(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Container(
                    padding: const EdgeInsets.all(20),
                    decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: Offset(0, 4))]),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Buat Tiket Baru', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: context.textPrimary)),
                        const SizedBox(height: 4),
                        const Text('Sampaikan kendala IT, masalah perangkat, atau pertanyaan HRD Anda di sini.', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        const SizedBox(height: 24),

                        // Kategori Dropdown
                        const Text('KATEGORI', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
                        const SizedBox(height: 10),
                        DropdownButtonFormField<String>(
                          value: _category,
                          decoration: _inputDecoration('Pilih kategori'),
                          dropdownColor: context.surfaceColor,
                          items: _categories.map((cat) {
                            return DropdownMenuItem<String>(
                              value: cat['id'],
                              child: Text(cat['label']!, style: TextStyle(fontSize: 14, color: context.textPrimary)),
                            );
                          }).toList(),
                          onChanged: (val) {
                            if (val != null) setState(() => _category = val);
                          },
                        ),
              const SizedBox(height: 24),

              // Subject
              const Text('SUBJEK KENDALA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
              const SizedBox(height: 10),
              TextField(
                controller: _subjectCtrl,
                decoration: _inputDecoration('Contoh: Laptop rusak / Aplikasi Error'),
              ),
              const SizedBox(height: 24),

                        // Detail
                        const Text('DETAIL KENDALA', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
                        const SizedBox(height: 10),
                        Expanded(
                          child: TextField(
                            controller: _descCtrl,
                            maxLines: null,
                            expands: true,
                            textAlignVertical: TextAlignVertical.top,
                            decoration: _inputDecoration('Jelaskan secara rinci...'),
                          ),
                        ),
                        const SizedBox(height: 30),

                        // Submit
                        SizedBox(
                          width: double.infinity,
                          height: 52,
                          child: ElevatedButton.icon(
                            onPressed: _handleSubmit,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppConstants.primaryColor,
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                              elevation: 4,
                              shadowColor: AppConstants.primaryColor.withValues(alpha: 0.5),
                            ),
                            icon: Icon(Icons.headset_mic_outlined, color: context.surfaceColor),
                            label: Text('KIRIM TIKET', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.bold, letterSpacing: 1)),
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
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey, fontSize: 14),
      filled: true,
      fillColor: Theme.of(context).colorScheme.surfaceContainerHighest,
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: context.borderColor)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppConstants.primaryColor)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    );
  }
}
