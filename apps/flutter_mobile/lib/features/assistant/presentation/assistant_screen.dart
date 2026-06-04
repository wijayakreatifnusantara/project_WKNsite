import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> {
  final TextEditingController _msgCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  
  final List<Map<String, dynamic>> _messages = [
    {
      'id': '1', 
      'text': 'Halo! Saya WKN AI Assistant. Ada yang bisa saya bantu terkait HR, Cuti, atau aturan perusahaan?', 
      'isBot': true
    }
  ];

  final Map<String, String> _botResponses = {
    'cuti': 'Sisa cuti tahunan Anda saat ini adalah 12 hari. Anda dapat mengajukan cuti melalui menu "Izin & Cuti".',
    'reimburse': 'Untuk melakukan reimburse, siapkan foto struk/nota, masuk ke menu "Reimburse", dan isi form nominalnya.',
    'gaji': 'Slip gaji bulan ini sudah terbit! Anda bisa melihat rinciannya di menu "Slip Gaji" menggunakan PIN rahasia Anda.',
    'default': 'Maaf, saya masih belajar. Silakan hubungi tim HR atau buat tiket di menu Helpdesk untuk bantuan lebih lanjut.'
  };

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _handleSend() {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'text': text,
        'isBot': false
      });
    });
    _msgCtrl.clear();
    _scrollToBottom();

    // Simulate AI thinking
    Future.delayed(const Duration(milliseconds: 1000), () {
      if (!mounted) return;
      final lower = text.toLowerCase();
      String reply = _botResponses['default']!;
      
      if (lower.contains('cuti') || lower.contains('libur')) {
        reply = _botResponses['cuti']!;
      } else if (lower.contains('reimburse') || lower.contains('klaim')) {
        reply = _botResponses['reimburse']!;
      } else if (lower.contains('gaji') || lower.contains('slip')) {
        reply = _botResponses['gaji']!;
      }

      setState(() {
        _messages.add({
          'id': DateTime.now().millisecondsSinceEpoch.toString(),
          'text': reply,
          'isBot': true
        });
      });
      _scrollToBottom();
    });
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(_scrollCtrl.position.maxScrollExtent, duration: const Duration(milliseconds: 300), curve: Curves.easeOut);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: Row(
          children: const [
            Icon(Icons.auto_awesome, color: Colors.orange, size: 20),
            SizedBox(width: 8),
            Text('WKN Assistant', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
          ],
        ),
        leading: IconButton(icon: const Icon(Icons.keyboard_arrow_down), onPressed: () => context.pop()),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              controller: _scrollCtrl,
              padding: const EdgeInsets.all(16),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                final msg = _messages[index];
                final isBot = msg['isBot'] as bool;
                
                return Align(
                  alignment: isBot ? Alignment.centerLeft : Alignment.centerRight,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                    decoration: BoxDecoration(
                      color: isBot ? Colors.white : AppConstants.primaryColor,
                      borderRadius: BorderRadius.only(
                        topLeft: const Radius.circular(20),
                        topRight: const Radius.circular(20),
                        bottomLeft: isBot ? const Radius.circular(4) : const Radius.circular(20),
                        bottomRight: isBot ? const Radius.circular(20) : const Radius.circular(4),
                      ),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 5, offset: const Offset(0, 2))],
                    ),
                    child: Text(
                      msg['text'],
                      style: TextStyle(color: isBot ? AppConstants.textPrimary : Colors.white, fontSize: 14, height: 1.4),
                    ),
                  ),
                );
              },
            ),
          ),
          
          // Input Area
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12).copyWith(bottom: 12 + MediaQuery.of(context).padding.bottom),
            decoration: BoxDecoration(
              color: Colors.white,
              border: Border(top: BorderSide(color: Colors.grey.shade200)),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(24)),
                    child: TextField(
                      controller: _msgCtrl,
                      decoration: const InputDecoration(
                        hintText: 'Tanya soal sisa cuti...',
                        hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
                        border: InputBorder.none,
                        contentPadding: EdgeInsets.symmetric(horizontal: 20, vertical: 14),
                      ),
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                InkWell(
                  onTap: _handleSend,
                  borderRadius: BorderRadius.circular(24),
                  child: Container(
                    width: 48, height: 48,
                    decoration: const BoxDecoration(color: AppConstants.primaryColor, shape: BoxShape.circle),
                    child: const Icon(Icons.send, color: Colors.white, size: 20),
                  ),
                )
              ],
            ),
          )
        ],
      ),
    );
  }
}
