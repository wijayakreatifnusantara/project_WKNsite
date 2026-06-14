import 'dart:convert';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/utils/constants.dart';

class AnnouncementsScreen extends StatefulWidget {
  const AnnouncementsScreen({super.key});

  @override
  State<AnnouncementsScreen> createState() => _AnnouncementsScreenState();
}

class _AnnouncementsScreenState extends State<AnnouncementsScreen> {
  final _supabase = Supabase.instance.client;

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
      final data = await _supabase
          .from('announcements')
          .select('*')
          .order('created_at', ascending: false);
          
      if (mounted) setState(() => _announcements = data);
    } catch (e) {
      debugPrint('Error fetching announcements from Supabase: $e');
      if (mounted) setState(() => _announcements = []);
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
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Pengumuman', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => context.pop()),
      ),
      body: _isLoading 
        ? _buildSkeletonLoading()
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
                      color: context.surfaceColor,
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
                                    Text(item['title'] ?? 'Pengumuman', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: context.textPrimary)),
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
                          SizedBox(height: 12),
                          Text(
                            item['content'] ?? '',
                            style: TextStyle(fontSize: 13, height: 1.5, color: context.textSecondary),
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
        children: [
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: AppConstants.primaryColor.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Icon(Icons.campaign_outlined, size: 64, color: AppConstants.primaryColor.withValues(alpha: 0.8)),
          ),
          const SizedBox(height: 24),
          Text('Belum Ada Pengumuman', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: context.textPrimary)),
          const SizedBox(height: 8),
          Text('Informasi terbaru dari perusahaan akan\nmuncul di sini', textAlign: TextAlign.center, style: TextStyle(color: context.textSecondary, fontSize: 13, height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildSkeletonLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Container(
          margin: const EdgeInsets.only(bottom: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: context.surfaceColor,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: context.borderColor),
          ),
          child: Shimmer.fromColors(
            baseColor: context.isDarkMode ? Colors.grey[800]! : Colors.grey[300]!,
            highlightColor: context.isDarkMode ? Colors.grey[700]! : Colors.grey[100]!,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Container(width: 36, height: 36, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8))),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Container(width: double.infinity, height: 14, color: Colors.white),
                          const SizedBox(height: 6),
                          Container(width: 80, height: 10, color: Colors.white),
                        ],
                      ),
                    )
                  ],
                ),
                const SizedBox(height: 16),
                Container(width: double.infinity, height: 10, color: Colors.white),
                const SizedBox(height: 6),
                Container(width: 200, height: 10, color: Colors.white),
              ],
            ),
          ),
        );
      },
    );
  }
}
