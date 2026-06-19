import 'dart:convert';
import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:signature/signature.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/utils/constants.dart';
import '../../../widgets/ios_card.dart';

class SignatureScreen extends StatefulWidget {
  const SignatureScreen({super.key});

  @override
  State<SignatureScreen> createState() => _SignatureScreenState();
}

class _SignatureScreenState extends State<SignatureScreen> {
  final _secureStorage = const FlutterSecureStorage();
  final String baseUrl = AppConstants.apiUrl;

  final SignatureController _signatureController = SignatureController(
    penStrokeWidth: 3,
    penColor: CupertinoColors.black,
    exportBackgroundColor: CupertinoColors.white,
  );

  bool _isLoading = true;
  bool _isSaving = false;
  String? _currentSignatureUrl;

  @override
  void initState() {
    super.initState();
    _fetchCurrentSignature();
  }

  @override
  void dispose() {
    _signatureController.dispose();
    super.dispose();
  }

  Future<void> _fetchCurrentSignature() async {
    setState(() => _isLoading = true);
    try {
      final token = await _secureStorage.read(key: 'authToken');
      final response = await http.get(
        Uri.parse('$baseUrl/employees/me'),
        headers: {if (token != null) 'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['status'] == 'success' && body['data']?['signature_url'] != null) {
          setState(() {
            _currentSignatureUrl = body['data']['signature_url'];
          });
        }
      }
    } catch (e) {
      debugPrint('Fetch signature error: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _saveSignature() async {
    if (_signatureController.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tanda tangan kosong'), backgroundColor: CupertinoColors.destructiveRed));
      return;
    }

    setState(() => _isSaving = true);
    try {
      final signatureImage = await _signatureController.toPngBytes();
      if (signatureImage == null) throw Exception('Gagal memproses gambar');

      final base64Image = 'data:image/png;base64,${base64Encode(signatureImage)}';
      
      final token = await _secureStorage.read(key: 'authToken');
      final response = await http.post(
        Uri.parse('$baseUrl/employees/signature'),
        headers: {
          'Content-Type': 'application/json',
          if (token != null) 'Authorization': 'Bearer $token',
        },
        body: jsonEncode({'signature_base64': base64Image}),
      );

      final body = jsonDecode(response.body);
      if (response.statusCode == 200 && body['status'] == 'success') {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tanda tangan berhasil disimpan'), backgroundColor: CupertinoColors.activeGreen));
        _signatureController.clear();
        _fetchCurrentSignature();
      } else {
        throw Exception(body['message'] ?? 'Gagal menyimpan');
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: CupertinoColors.destructiveRed));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Tanda Tangan'),
        trailing: _isLoading || _isSaving 
          ? const CupertinoActivityIndicator() 
          : CupertinoButton(
              padding: EdgeInsets.zero,
              onPressed: _isSaving ? null : _saveSignature,
              child: const Text('Simpan', style: TextStyle(fontWeight: FontWeight.bold)),
            ),
      ),
      child: SafeArea(
        child: _isLoading 
          ? const Center(child: CupertinoActivityIndicator(radius: 16))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Padding(
                    padding: EdgeInsets.only(left: 16, bottom: 8),
                    child: Text('TANDA TANGAN SAAT INI', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                  ),
                  IosCard(
                    padding: const EdgeInsets.all(16),
                    child: Container(
                      height: 160,
                      width: double.infinity,
                      decoration: BoxDecoration(color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white, borderRadius: BorderRadius.circular(16)),
                      child: _currentSignatureUrl != null
                        ? ClipRRect(
                            borderRadius: BorderRadius.circular(16),
                            child: CachedNetworkImage(
                              imageUrl: _currentSignatureUrl!,
                              fit: BoxFit.contain,
                              placeholder: (context, url) => const Center(child: CupertinoActivityIndicator()),
                              errorWidget: (context, url, error) => const Center(child: Icon(CupertinoIcons.exclamationmark_triangle, color: CupertinoColors.destructiveRed, size: 32)),
                            ),
                          )
                        : const Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(CupertinoIcons.exclamationmark_triangle, size: 32, color: CupertinoColors.systemGrey),
                                SizedBox(height: 8),
                                Text('Belum ada tanda tangan', style: TextStyle(color: CupertinoColors.systemGrey, fontSize: 12, fontWeight: FontWeight.bold)),
                              ],
                            ),
                          ),
                    ),
                  ),
                  
                  const SizedBox(height: 30),
                  const Padding(
                    padding: EdgeInsets.only(left: 16, bottom: 8),
                    child: Text('BUAT / PERBARUI TANDA TANGAN', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                  ),
                  IosCard(
                    padding: EdgeInsets.zero,
                    child: Column(
                      children: [
                        ClipRRect(
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
                          child: Signature(
                            controller: _signatureController,
                            height: 220,
                            backgroundColor: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey6,
                          ),
                        ),
                        const Divider(height: 1, color: CupertinoColors.systemGrey4),
                        CupertinoButton(
                          onPressed: () => _signatureController.clear(),
                          child: const Text('Hapus Tanda Tangan', style: TextStyle(color: CupertinoColors.destructiveRed, fontWeight: FontWeight.bold, fontSize: 14)),
                        )
                      ],
                    ),
                  ),

                  const SizedBox(height: 30),
                  IosCard(
                    padding: const EdgeInsets.all(16),
                    child: const Row(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Icon(CupertinoIcons.checkmark_shield_fill, color: CupertinoColors.activeGreen),
                        SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Keamanan Terjamin', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                              SizedBox(height: 4),
                              Text('Tanda tangan digital Anda disimpan dengan enkripsi aman dan digunakan untuk persetujuan dokumen internal.', style: TextStyle(fontSize: 11, color: CupertinoColors.systemGrey)),
                            ],
                          ),
                        )
                      ],
                    ),
                  )
                ],
              ),
            )
      ),
    );
  }
}
