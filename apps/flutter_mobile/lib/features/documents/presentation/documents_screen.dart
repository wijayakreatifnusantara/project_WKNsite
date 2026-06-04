import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:http/http.dart' as http;
import 'package:url_launcher/url_launcher.dart';
import '../../../core/utils/constants.dart';

class DocumentsScreen extends StatefulWidget {
  const DocumentsScreen({super.key});

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  final _secureStorage = const FlutterSecureStorage();
  static const String baseUrl = 'http://10.0.2.2:3000/api';
  
  bool _isLoading = false;
  bool _submitLoading = false;
  List<dynamic> _documents = [];
  String _selectedCategoryFilter = 'Semua';
  bool _showForm = false;

  final TextEditingController _docNameCtrl = TextEditingController();
  final TextEditingController _descCtrl = TextEditingController();
  String _docCategory = 'CV';
  PlatformFile? _pickedFile;

  final List<String> _categories = [
    'CV', 'KTP', 'Kartu Keluarga', 'SIM A', 'SIM C', 'Passport', 'Perjanjian Kerja', 'Sertifikasi', 'Lainnya'
  ];

  @override
  void initState() {
    super.initState();
    _fetchDocuments();
  }

  @override
  void dispose() {
    _docNameCtrl.dispose();
    _descCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchDocuments() async {
    setState(() => _isLoading = true);
    try {
      final token = await _secureStorage.read(key: 'authToken');
      final response = await http.get(
        Uri.parse('$baseUrl/documents/my-documents'),
        headers: {if (token != null) 'Authorization': 'Bearer $token'},
      );
      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (body['status'] == 'success') {
          if (mounted) setState(() => _documents = body['data'] ?? []);
        }
      }
    } catch (e) {
      debugPrint('Error fetching docs: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handlePickFile() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles();
      if (result != null) {
        setState(() {
          _pickedFile = result.files.first;
          if (_docNameCtrl.text.isEmpty) {
            _docNameCtrl.text = _pickedFile!.name.split('.').first;
          }
        });
      }
    } catch (e) {
      debugPrint('Pick file error: $e');
    }
  }

  Future<void> _handleUpload() async {
    if (_docNameCtrl.text.trim().isEmpty || _pickedFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Isi nama dokumen dan pilih berkas.'), backgroundColor: Colors.red));
      return;
    }

    setState(() => _submitLoading = true);
    try {
      final token = await _secureStorage.read(key: 'authToken');
      var request = http.MultipartRequest('POST', Uri.parse('$baseUrl/documents/upload-mobile'));
      if (token != null) request.headers['Authorization'] = 'Bearer $token';

      request.fields['document_name'] = _docNameCtrl.text;
      request.fields['category'] = _docCategory;
      request.fields['description'] = _descCtrl.text;
      
      if (_pickedFile!.path != null) {
        request.files.add(await http.MultipartFile.fromPath('file', _pickedFile!.path!));
      }

      var response = await request.send();
      if (response.statusCode == 200 || response.statusCode == 201) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Dokumen berhasil diunggah.'), backgroundColor: Colors.green));
        setState(() {
          _showForm = false;
          _docNameCtrl.clear();
          _descCtrl.clear();
          _pickedFile = null;
        });
        _fetchDocuments();
      } else {
        throw Exception('Gagal mengunggah');
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString()), backgroundColor: Colors.red));
    } finally {
      setState(() => _submitLoading = false);
    }
  }

  Future<void> _handleDelete(Map<String, dynamic> doc) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Hapus Dokumen'),
        content: Text('Apakah Anda yakin ingin menghapus "${doc['name']}"?'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx, false), child: const Text('Batal', style: TextStyle(color: Colors.grey))),
          TextButton(onPressed: () => Navigator.pop(ctx, true), child: const Text('Hapus', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold))),
        ],
      )
    );
    if (confirm != true) return;

    try {
      final token = await _secureStorage.read(key: 'authToken');
      final res = await http.delete(
        Uri.parse('$baseUrl/documents/${doc['id']}'),
        headers: {if (token != null) 'Authorization': 'Bearer $token'}
      );
      if (res.statusCode == 200) {
        if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Dokumen dihapus'), backgroundColor: Colors.green));
        _fetchDocuments();
      }
    } catch (e) {
      debugPrint('Error deleting: $e');
    }
  }

  String _formatBytes(int? bytes) {
    if (bytes == null || bytes == 0) return '0 B';
    if (bytes < 1024) return '$bytes B';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).toStringAsFixed(1)} KB';
    return '${(bytes / (1024 * 1024)).toStringAsFixed(1)} MB';
  }

  @override
  Widget build(BuildContext context) {
    final filteredDocs = _selectedCategoryFilter == 'Semua' ? _documents : _documents.where((d) => d['category'] == _selectedCategoryFilter).toList();

    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Dokumen Saya', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
        actions: [
          IconButton(
            icon: Icon(_showForm ? Icons.list : Icons.cloud_upload_outlined, color: AppConstants.primaryColor),
            onPressed: () => setState(() => _showForm = !_showForm),
          )
        ],
      ),
      body: _isLoading
        ? const Center(child: CircularProgressIndicator())
        : _showForm ? _buildForm() : _buildList(filteredDocs),
    );
  }

  Widget _buildForm() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20)),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Unggah Dokumen Baru', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            
            const Text('KATEGORI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 10),
            Wrap(
              spacing: 8, runSpacing: 8,
              children: _categories.map((c) {
                final isSelected = _docCategory == c;
                return ChoiceChip(
                  label: Text(c, style: TextStyle(color: isSelected ? Colors.white : Colors.black87, fontSize: 11)),
                  selected: isSelected,
                  selectedColor: AppConstants.primaryColor,
                  backgroundColor: Colors.grey.shade100,
                  onSelected: (v) => setState(() => _docCategory = c),
                  showCheckmark: false,
                );
              }).toList(),
            ),
            const SizedBox(height: 20),
            
            const Text('NAMA DOKUMEN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            TextField(controller: _docNameCtrl, decoration: _inputDecoration('Contoh: KTP_Budi')),
            const SizedBox(height: 20),

            const Text('KETERANGAN', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            TextField(controller: _descCtrl, decoration: _inputDecoration('Opsional')),
            const SizedBox(height: 20),

            const Text('BERKAS', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey)),
            const SizedBox(height: 8),
            InkWell(
              onTap: _handlePickFile,
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade400, style: BorderStyle.solid), // changed from dashed for simplicity
                  borderRadius: BorderRadius.circular(12),
                  color: Colors.grey.shade50
                ),
                child: Row(
                  children: [
                    const Icon(Icons.attach_file, color: AppConstants.primaryColor),
                    const SizedBox(width: 10),
                    Expanded(child: Text(_pickedFile?.name ?? 'Pilih Berkas...', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis)),
                    if (_pickedFile != null)
                      Text(_formatBytes(_pickedFile?.size), style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 30),

            SizedBox(
              width: double.infinity, height: 50,
              child: ElevatedButton.icon(
                onPressed: _submitLoading ? null : _handleUpload,
                style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                icon: _submitLoading ? const SizedBox.shrink() : const Icon(Icons.cloud_upload_outlined, color: Colors.white),
                label: _submitLoading ? const CircularProgressIndicator(color: Colors.white) : const Text('UNGGAH SEKARANG', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildList(List<dynamic> filteredDocs) {
    return Column(
      children: [
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          padding: const EdgeInsets.all(16),
          child: Row(
            children: ['Semua', ..._categories].map((c) {
              final isSelected = _selectedCategoryFilter == c;
              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: ChoiceChip(
                  label: Text(c, style: TextStyle(color: isSelected ? Colors.white : Colors.black87, fontSize: 12, fontWeight: FontWeight.bold)),
                  selected: isSelected,
                  selectedColor: AppConstants.primaryColor,
                  backgroundColor: Colors.white,
                  onSelected: (v) => setState(() => _selectedCategoryFilter = c),
                  showCheckmark: false,
                ),
              );
            }).toList(),
          ),
        ),
        Expanded(
          child: filteredDocs.isEmpty 
            ? const Center(child: Text('Belum ada dokumen', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)))
            : ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: filteredDocs.length,
                itemBuilder: (context, index) {
                  final doc = filteredDocs[index];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16)),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(doc['name'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                                  const SizedBox(height: 4),
                                  Row(
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(color: Colors.blue.shade50, borderRadius: BorderRadius.circular(4)),
                                        child: Text(doc['category'] ?? '', style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: Colors.blue)),
                                      ),
                                      const SizedBox(width: 8),
                                      Text(_formatBytes(doc['file_size']), style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold))
                                    ],
                                  )
                                ],
                              ),
                            ),
                            IconButton(icon: const Icon(Icons.remove_red_eye_outlined, color: Colors.blue), onPressed: () async {
                              final url = Uri.parse(doc['file_url'] ?? '');
                              if (await canLaunchUrl(url)) await launchUrl(url);
                            }),
                            IconButton(icon: const Icon(Icons.delete_outline, color: Colors.red), onPressed: () => _handleDelete(doc)),
                          ],
                        ),
                        if (doc['description'] != null && doc['description'].toString().isNotEmpty)
                          Padding(
                            padding: const EdgeInsets.only(top: 8),
                            child: Text(doc['description'], style: const TextStyle(fontSize: 11, color: Colors.grey)),
                          ),
                      ],
                    ),
                  );
                },
              )
        )
      ],
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey, fontSize: 12),
      filled: true, fillColor: const Color(0xFFF8F9FB),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade200)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
    );
  }
}
