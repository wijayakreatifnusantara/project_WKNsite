import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:signature/signature.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/utils/constants.dart';

class SignatureScreen extends StatefulWidget {
  const SignatureScreen({super.key});

  @override
  State<SignatureScreen> createState() => _SignatureScreenState();
}

class _SignatureScreenState extends State<SignatureScreen> {
  final _secureStorage = const FlutterSecureStorage();
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  final SignatureController _signatureController = SignatureController(
    penStrokeWidth: 3,
    penColor: Colors.black,
    exportBackgroundColor: Colors.white,
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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tanda tangan kosong'), backgroundColor: Colors.red));
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
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Tanda tangan berhasil disimpan'), backgroundColor: Colors.green));
        _signatureController.clear();
        _fetchCurrentSignature();
      } else {
        throw Exception(body['message'] ?? 'Gagal menyimpan');
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Tanda Tangan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : SingleChildScrollView(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('TANDA TANGAN SAAT INI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                const SizedBox(height: 10),
                Container(
                  height: 160,
                  width: double.infinity,
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.shade200)),
                  child: _currentSignatureUrl != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(20),
                        child: Image.network(_currentSignatureUrl!, fit: BoxFit.contain),
                      )
                    : const Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.warning_amber_rounded, size: 32, color: Colors.grey),
                            SizedBox(height: 8),
                            Text('Belum ada tanda tangan', style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                ),
                
                const SizedBox(height: 30),
                const Text('BUAT / PERBARUI TANDA TANGAN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                const SizedBox(height: 10),
                Container(
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(24),
                    border: Border.all(color: AppConstants.primaryColor, width: 2),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(22),
                    child: Signature(
                      controller: _signatureController,
                      height: 220,
                      backgroundColor: Colors.blue.shade50,
                    ),
                  ),
                ),
                
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () => _signatureController.clear(),
                        icon: const Icon(Icons.clear, color: Colors.red),
                        label: const Text('Hapus', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold)),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: Colors.red),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 14)
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: _isSaving ? null : _saveSignature,
                        icon: _isSaving ? const SizedBox.shrink() : const Icon(Icons.cloud_upload_outlined, color: Colors.white),
                        label: _isSaving 
                          ? const SizedBox(width: 20, height: 20, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2)) 
                          : const Text('Simpan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppConstants.primaryColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                          padding: const EdgeInsets.symmetric(vertical: 14)
                        ),
                      ),
                    )
                  ],
                ),

                const SizedBox(height: 30),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.grey.shade200)),
                  child: const Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.shield_outlined, color: Colors.green),
                      SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Keamanan Terjamin', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                            SizedBox(height: 4),
                            Text('Tanda tangan digital Anda disimpan dengan enkripsi aman dan digunakan untuk persetujuan dokumen internal.', style: TextStyle(fontSize: 11, color: Colors.grey)),
                          ],
                        ),
                      )
                    ],
                  ),
                )
              ],
            ),
          )
    );
  }
}
