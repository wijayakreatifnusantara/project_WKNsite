import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:shimmer/shimmer.dart';
import '../../../core/utils/constants.dart';
import '../../../widgets/ios_card.dart';

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
      case 'important': return CupertinoColors.destructiveRed;
      case 'warning': return CupertinoColors.systemOrange;
      case 'success': return CupertinoColors.activeGreen;
      default: return AppConstants.primaryColor;
    }
  }

  IconData _getTypeIcon(String? type) {
    switch (type) {
      case 'important': return CupertinoIcons.speaker_3_fill;
      case 'warning': return CupertinoIcons.exclamationmark_triangle_fill;
      case 'success': return CupertinoIcons.checkmark_seal_fill;
      default: return CupertinoIcons.info_circle_fill;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Pengumuman'),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: _isLoading 
          ? _buildSkeletonLoading(isDark)
          : _announcements.isEmpty 
            ? _buildEmptyState(isDark)
            : CustomScrollView(
                slivers: [
                  CupertinoSliverRefreshControl(
                    onRefresh: _fetchAnnouncements,
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final item = _announcements[index];
                          final color = _getTypeColor(item['type']);
                          
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: IosCard(
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
                                            Text(item['title'] ?? 'Pengumuman', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                            const SizedBox(height: 2),
                                            Text(
                                              item['created_at'] != null ? item['created_at'].toString().substring(0, 10) : 'Hari ini',
                                              style: const TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold),
                                            )
                                          ],
                                        ),
                                      )
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  Text(
                                    item['content'] ?? '',
                                    style: const TextStyle(fontSize: 13, height: 1.5, color: CupertinoColors.systemGrey),
                                  )
                                ],
                              ),
                            ),
                          );
                        },
                        childCount: _announcements.length,
                      ),
                    ),
                  ),
                ],
              ),
      ),
    );
  }

  Widget _buildEmptyState(bool isDark) {
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
            child: Icon(CupertinoIcons.speaker_2_fill, size: 64, color: AppConstants.primaryColor.withValues(alpha: 0.8)),
          ),
          const SizedBox(height: 24),
          Text('Belum Ada Pengumuman', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
          const SizedBox(height: 8),
          const Text('Informasi terbaru dari perusahaan akan\nmuncul di sini', textAlign: TextAlign.center, style: TextStyle(color: CupertinoColors.systemGrey, fontSize: 13, height: 1.5)),
        ],
      ),
    );
  }

  Widget _buildSkeletonLoading(bool isDark) {
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      itemBuilder: (context, index) {
        return Padding(
          padding: const EdgeInsets.only(bottom: 16),
          child: IosCard(
            padding: const EdgeInsets.all(16),
            child: Shimmer.fromColors(
              baseColor: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey5,
              highlightColor: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey6,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(width: 36, height: 36, decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(8))),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(width: double.infinity, height: 14, color: CupertinoColors.white),
                            const SizedBox(height: 6),
                            Container(width: 80, height: 10, color: CupertinoColors.white),
                          ],
                        ),
                      )
                    ],
                  ),
                  const SizedBox(height: 16),
                  Container(width: double.infinity, height: 10, color: CupertinoColors.white),
                  const SizedBox(height: 6),
                  Container(width: 200, height: 10, color: CupertinoColors.white),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
