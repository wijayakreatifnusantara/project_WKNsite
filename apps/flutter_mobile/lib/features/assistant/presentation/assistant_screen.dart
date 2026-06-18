import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import 'package:google_generative_ai/google_generative_ai.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AssistantScreen extends StatefulWidget {
  const AssistantScreen({super.key});

  @override
  State<AssistantScreen> createState() => _AssistantScreenState();
}

class _AssistantScreenState extends State<AssistantScreen> {
  final TextEditingController _msgCtrl = TextEditingController();
  final ScrollController _scrollCtrl = ScrollController();
  
  final List<Map<String, dynamic>> _messages = [];
  bool _isTyping = false;
  late final GenerativeModel _model;
  late final ChatSession _chatSession;

  @override
  void initState() {
    super.initState();
    _initGemini();
  }

  void _initGemini() {
    final apiKey = dotenv.env['GEMINI_API_KEY'] ?? '';
    
    _model = GenerativeModel(
      model: 'gemini-1.5-flash',
      apiKey: apiKey,
      systemInstruction: Content.system(
        'Anda adalah WKN AI Assistant, asisten virtual Human Resources (HR) yang ramah dan profesional '
        'untuk perusahaan Wijaya Kreatif Nusantara (WKN). '
        'Tugas Anda adalah menjawab pertanyaan karyawan seputar cuti, lembur, absensi, gaji, dan aturan HR. '
        'Jawablah secara ringkas, jelas, dan menggunakan bahasa Indonesia yang baik dan profesional. '
        'TOLAK secara halus pertanyaan yang tidak ada hubungannya dengan lingkup HR, karir, atau perusahaan.'
      ),
    );
    
    _chatSession = _model.startChat();
    
    // Add initial greeting
    _messages.add({
      'id': DateTime.now().millisecondsSinceEpoch.toString(), 
      'text': 'Halo! Saya WKN AI Assistant. Ada yang bisa saya bantu terkait HR, Cuti, Absensi, atau aturan perusahaan?', 
      'isBot': true
    });
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleSend() async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;
    
    final apiKey = dotenv.env['GEMINI_API_KEY'];
    if (apiKey == null || apiKey.isEmpty || apiKey == 'YOUR_GEMINI_API_KEY_HERE') {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('API Key Gemini belum diatur di .env!'), backgroundColor: CupertinoColors.destructiveRed),
      );
      return;
    }

    setState(() {
      _messages.add({
        'id': DateTime.now().millisecondsSinceEpoch.toString(),
        'text': text,
        'isBot': false
      });
      _isTyping = true;
    });
    
    _msgCtrl.clear();
    _scrollToBottom();

    try {
      final response = await _chatSession.sendMessage(Content.text(text));
      final replyText = response.text ?? 'Maaf, saya tidak dapat memproses permintaan tersebut.';
      
      if (!mounted) return;
      setState(() {
        _isTyping = false;
        _messages.add({
          'id': DateTime.now().millisecondsSinceEpoch.toString(),
          'text': replyText,
          'isBot': true
        });
      });
      _scrollToBottom();
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _isTyping = false;
        _messages.add({
          'id': DateTime.now().millisecondsSinceEpoch.toString(),
          'text': 'Maaf, sistem sedang sibuk atau API Key bermasalah. Pastikan API key sudah dimasukkan di file .env dengan benar.',
          'isBot': true
        });
      });
      _scrollToBottom();
    }
  }

  void _scrollToBottom() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent + 100, // extra offset for typing indicator
          duration: const Duration(milliseconds: 300), 
          curve: Curves.easeOut
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(CupertinoIcons.sparkles, color: CupertinoColors.activeOrange, size: 20),
            SizedBox(width: 8),
            Text('WKN Assistant'),
          ],
        ),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => context.pop(),
          child: const Icon(CupertinoIcons.chevron_down),
        ),
      ),
      child: SafeArea(
        child: Column(
          children: [
            Expanded(
              child: ListView.builder(
                controller: _scrollCtrl,
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length + (_isTyping ? 1 : 0),
                itemBuilder: (context, index) {
                  if (index == _messages.length && _isTyping) {
                    return _buildTypingIndicator(isDark);
                  }

                  final msg = _messages[index];
                  final isBot = msg['isBot'] as bool;
                  
                  return Align(
                    alignment: isBot ? Alignment.centerLeft : Alignment.centerRight,
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.8),
                      decoration: BoxDecoration(
                        color: isBot ? (isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white) : AppConstants.primaryColor,
                        borderRadius: BorderRadius.only(
                          topLeft: const Radius.circular(20),
                          topRight: const Radius.circular(20),
                          bottomLeft: isBot ? const Radius.circular(4) : const Radius.circular(20),
                          bottomRight: isBot ? const Radius.circular(20) : const Radius.circular(4),
                        ),
                        boxShadow: [BoxShadow(color: CupertinoColors.black.withValues(alpha: 0.05), blurRadius: 5, offset: const Offset(0, 2))],
                      ),
                      child: Text(
                        msg['text'],
                        style: TextStyle(color: isBot ? (isDark ? CupertinoColors.white : CupertinoColors.black) : CupertinoColors.white, fontSize: 15, height: 1.4),
                      ),
                    ),
                  );
                },
              ),
            ),
            
            // Input Area
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: isDark ? CupertinoColors.black : CupertinoColors.white,
                border: Border(top: BorderSide(color: isDark ? CupertinoColors.systemGrey4 : CupertinoColors.systemGrey5)),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: CupertinoTextField(
                      controller: _msgCtrl,
                      placeholder: 'Tanya soal sisa cuti, lembur...',
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                      decoration: BoxDecoration(
                        color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey6,
                        borderRadius: BorderRadius.circular(24),
                      ),
                      style: TextStyle(color: isDark ? CupertinoColors.white : CupertinoColors.black),
                      onSubmitted: (_) => _handleSend(),
                    ),
                  ),
                  const SizedBox(width: 12),
                  CupertinoButton(
                    padding: EdgeInsets.zero,
                    onPressed: _isTyping ? null : _handleSend,
                    child: Container(
                      width: 44, height: 44,
                      decoration: BoxDecoration(
                        color: _isTyping ? CupertinoColors.systemGrey : AppConstants.primaryColor, 
                        shape: BoxShape.circle
                      ),
                      child: const Icon(CupertinoIcons.paperplane_fill, color: CupertinoColors.white, size: 20),
                    ),
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildTypingIndicator(bool isDark) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(20),
            topRight: Radius.circular(20),
            bottomLeft: Radius.circular(4),
            bottomRight: Radius.circular(20),
          ),
          boxShadow: [BoxShadow(color: CupertinoColors.black.withValues(alpha: 0.05), blurRadius: 5, offset: const Offset(0, 2))],
        ),
        child: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            SizedBox(
              width: 16, height: 16,
              child: CupertinoActivityIndicator(),
            ),
            SizedBox(width: 8),
            Text('AI sedang mengetik...', style: TextStyle(color: CupertinoColors.systemGrey, fontSize: 12, fontStyle: FontStyle.italic)),
          ],
        ),
      ),
    );
  }
}
