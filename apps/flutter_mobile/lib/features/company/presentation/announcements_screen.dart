import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../../../core/utils/constants.dart';

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({super.key});

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  final _secureStorage = const FlutterSecureStorage();
  static const String baseUrl = 'http://10.0.2.2:3000/api';

  bool _isLoading = true;
  List<dynamic> _announcements = [];

  @override
  void initState() {
    super.initState();
    _fetchAnnouncements();
  }

  Future<void> _fetchAnnouncements() async {
    setState(() => _isLoading = true);
    try {
      final token = await _secureStorage.read(key: 'authToken');
      final response = await http.get(
        Uri.parse('$baseUrl/announcements'),
        headers: {if (token != null) 'Authorization': 'Bearer $token'},
      );

      if (response.statusCode == 200) {
        final body = jsonDecode(response.body);
        if (mounted) setState(() => _announcements = body['data'] ?? []);
      }
    } catch (e) {
      debugPrint('Error fetching announcements: $e');
      // Mock data in case backend is not ready
      if (mounted) {
        setState(() {
          _announcements = [
            {
              'id': '1',
              'title': 'Townhall Kuartal 3 PT WKN',
              'content': 'Seluruh karyawan diwajibkan hadir pada acara Townhall virtual yang akan diselenggarakan pada Jumat minggu ini. Tautan Zoom akan dikirim melalui email.',
              'type': 'important',
              'created_at': DateTime.now().subtract(const Duration(days: 1)).toIso8601String()
            },
            {
              'id': '2',
              'title': 'Cuti Bersama Hari Raya',
              'content': 'Sesuai dengan keputusan pemerintah, cuti bersama Idul Fitri akan dilaksanakan pada tanggal 10-12 Mei. Mohon selesaikan seluruh tanggungan kerja sebelum tanggal tersebut.',
              'type': 'info',
              'created_at': DateTime.now().subtract(const Duration(days: 3)).toIso8601String()
            },
            {
              'id': '3',
              'title': 'Pemeliharaan Server ERP',
              'content': 'Aplikasi ERP dan portal absen tidak dapat diakses pada Sabtu dini hari pukul 02:00 - 04:00 WIB untuk pemeliharaan.',
              'type': 'warning',
              'created_at': DateTime.now().subtract(const Duration(days: 7)).toIso8601String()
            }
          ];
        });
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Color _getTypeColor(String? type) {
    switch (type) {
      case 'important': return Colors.red;
      case 'warning': return Colors.orange;
      case 'success': return Colors.green;
      default: return AppConstants.primaryColor;
    }
  }

  IconData _getTypeIcon(String? type) {
    switch (type) {
      case 'important': return Icons.campaign;
      case 'warning': return Icons.warning_amber_rounded;
      case 'success': return Icons.check_circle_outline;
      default: return Icons.info_outline;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Pengumuman', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: _isLoading 
        ? const Center(child: CircularProgressIndicator())
        : _announcements.isEmpty 
          ? _buildEmptyState()
          : RefreshIndicator(
              onRefresh: _fetchAnnouncements,
              color: AppConstants.primaryColor,
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _announcements.length,
                itemBuilder: (context, index) {
                  final item = _announcements[index];
                  final color = _getTypeColor(item['type']);
                  
                  return Container(
                    margin: const EdgeInsets.only(bottom: 16),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(16),
                      boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))],
                      border: Border(left: BorderSide(color: color, width: 5))
                    ),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(8),
                                decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                                child: Icon(_getTypeIcon(item['type']), color: color, size: 20),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(item['title'] ?? 'Pengumuman', style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: AppConstants.textPrimary)),
                                    const SizedBox(height: 2),
                                    Text(
                                      item['created_at'] != null ? item['created_at'].toString().substring(0, 10) : 'Hari ini',
                                      style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold),
                                    )
                                  ],
                                ),
                              )
                            ],
                          ),
                          const SizedBox(height: 12),
                          Text(
                            item['content'] ?? '',
                            style: const TextStyle(fontSize: 13, height: 1.5, color: AppConstants.textSecondary),
                          )
                        ],
                      ),
                    ),
                  );
                },
              ),
            )
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: const [
          Icon(Icons.feed_outlined, size: 64, color: Colors.grey),
          SizedBox(height: 16),
          Text('Belum ada pengumuman', style: TextStyle(fontWeight: FontWeight.bold, color: Colors.grey)),
        ],
      ),
    );
  }
}
