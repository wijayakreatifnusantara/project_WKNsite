import 'package:flutter/cupertino.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';
import '../../auth/data/auth_provider.dart';
import '../../../widgets/ios_card.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  final _supabase = Supabase.instance.client;
  List<dynamic> _notifications = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchNotifications();
    _setupRealtime();
  }

  void _setupRealtime() {
    final user = context.read<AuthProvider>().userData;
    if (user?['id'] == null) return;
    
    _supabase
        .channel('public:notifications')
        .onPostgresChanges(
          event: PostgresChangeEvent.all,
          schema: 'public',
          table: 'notifications',
          filter: PostgresChangeFilter(type: PostgresChangeFilterType.eq, column: 'employee_id', value: user!['id']),
          callback: (payload) => _fetchNotifications(),
        )
        .subscribe();
  }

  Future<void> _fetchNotifications() async {
    final user = context.read<AuthProvider>().userData;
    if (user?['id'] == null) {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
      return;
    }

    try {
      final data = await _supabase
          .from('notifications')
          .select('*')
          .eq('employee_id', user!['id'])
          .order('created_at', ascending: false);

      if (mounted) {
        setState(() {
          _notifications = data;
        });
      }
    } catch (e) {
      debugPrint('Error fetching notifications: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _markAsRead(String id) async {
    try {
      // Optimistic Update
      setState(() {
        final index = _notifications.indexWhere((n) => n['id'] == id);
        if (index != -1) {
          _notifications[index]['is_read'] = true;
        }
      });
      
      await _supabase.from('notifications').update({'is_read': true}).eq('id', id);
    } catch (e) {
      debugPrint('Error marking read: $e');
    }
  }

  Future<void> _markAllAsRead() async {
    final user = context.read<AuthProvider>().userData;
    if (user?['id'] == null) return;
    try {
      setState(() {
        for (var notif in _notifications) {
          notif['is_read'] = true;
        }
      });
      await _supabase.from('notifications').update({'is_read': true}).eq('employee_id', user!['id']).eq('is_read', false);
    } catch (e) {
      debugPrint('Error marking all as read: $e');
    }
  }

  IconData _getIcon(String type) {
    switch (type) {
      case 'alert': return CupertinoIcons.exclamationmark_triangle;
      case 'payroll': return CupertinoIcons.money_dollar_circle;
      case 'hr': return CupertinoIcons.person_2;
      case 'system': return CupertinoIcons.gear_alt;
      default: return CupertinoIcons.info_circle;
    }
  }

  Color _getIconColor(String type) {
    switch (type) {
      case 'alert': return CupertinoColors.destructiveRed;
      case 'payroll': return CupertinoColors.activeGreen;
      case 'hr': return CupertinoColors.activeBlue;
      case 'system': return CupertinoColors.activeOrange;
      default: return CupertinoColors.systemPurple;
    }
  }

  Color _getIconBgColor(String type) {
    switch (type) {
      case 'alert': return CupertinoColors.destructiveRed.withValues(alpha: 0.1);
      case 'payroll': return CupertinoColors.activeGreen.withValues(alpha: 0.1);
      case 'hr': return CupertinoColors.activeBlue.withValues(alpha: 0.1);
      case 'system': return CupertinoColors.activeOrange.withValues(alpha: 0.1);
      default: return CupertinoColors.systemPurple.withValues(alpha: 0.1);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool canPop = context.canPop();
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        automaticallyImplyLeading: canPop,
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Kotak Masuk'),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: _markAllAsRead,
          child: const Icon(CupertinoIcons.checkmark_circle, color: CupertinoColors.activeOrange),
        ),
      ),
      child: SafeArea(
        child: _isLoading
          ? const Center(child: CupertinoActivityIndicator(radius: 16))
          : CustomScrollView(
              slivers: [
                CupertinoSliverRefreshControl(
                  onRefresh: _fetchNotifications,
                ),
                SliverPadding(
                  padding: const EdgeInsets.all(16).copyWith(bottom: 100),
                  sliver: _notifications.isEmpty
                    ? SliverFillRemaining(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(CupertinoIcons.mail, size: 80, color: CupertinoColors.systemGrey),
                            const SizedBox(height: 16),
                            const Text('Kotak masuk Anda kosong.', style: TextStyle(color: CupertinoColors.systemGrey, fontSize: 16)),
                          ],
                        ),
                      )
                    : SliverList(
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final notif = _notifications[index];
                            final isRead = notif['is_read'] == true;
                            
                            return GestureDetector(
                              onTap: () => _markAsRead(notif['id']),
                              behavior: HitTestBehavior.opaque,
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 12),
                                child: IosCard(
                                  padding: const EdgeInsets.all(16),
                                  child: Row(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      if (!isRead)
                                        Container(
                                          width: 8, height: 8,
                                          margin: const EdgeInsets.only(top: 16, right: 8),
                                          decoration: const BoxDecoration(color: CupertinoColors.activeOrange, shape: BoxShape.circle),
                                        ),
                                      Container(
                                        width: 44, height: 44,
                                        decoration: BoxDecoration(color: _getIconBgColor(notif['type']), borderRadius: BorderRadius.circular(22)),
                                        child: Icon(_getIcon(notif['type']), color: _getIconColor(notif['type']), size: 22),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment: CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                              children: [
                                                Expanded(child: Text(notif['title'] ?? '', style: TextStyle(fontSize: 14, fontWeight: isRead ? FontWeight.w600 : FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black))),
                                                Text(
                                                  notif['created_at'] != null ? notif['created_at'].toString().substring(0, 10) : '',
                                                  style: const TextStyle(fontSize: 10, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold),
                                                )
                                              ],
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              notif['body'] ?? '',
                                              style: TextStyle(fontSize: 13, color: isRead ? CupertinoColors.systemGrey : (isDark ? CupertinoColors.systemGrey2 : CupertinoColors.systemGrey), height: 1.4),
                                              maxLines: 3,
                                              overflow: TextOverflow.ellipsis,
                                            ),
                                          ],
                                        ),
                                      )
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                          childCount: _notifications.length,
                        ),
                      ),
                )
              ],
            ),
      ),
    );
  }
}
