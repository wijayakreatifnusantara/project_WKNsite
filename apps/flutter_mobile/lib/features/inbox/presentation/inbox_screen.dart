import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:provider/provider.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';

class InboxScreen extends StatefulWidget {
  const InboxScreen({super.key});

  @override
  State<InboxScreen> createState() => _InboxScreenState();
}

class _InboxScreenState extends State<InboxScreen> {
  final _supabase = Supabase.instance.client;
  List<dynamic> _notifications = [];
  bool _isLoading = true;
  bool _isRefreshing = false;

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
          _isRefreshing = false;
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
          _isRefreshing = false;
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
      case 'alert': return Icons.warning_amber_rounded;
      case 'payroll': return Icons.attach_money_rounded;
      case 'hr': return Icons.people_outline_rounded;
      case 'system': return Icons.dns_outlined;
      default: return Icons.info_outline_rounded;
    }
  }

  Color _getIconColor(String type) {
    switch (type) {
      case 'alert': return Colors.red;
      case 'payroll': return Colors.green;
      case 'hr': return Colors.blue;
      case 'system': return Colors.orange;
      default: return Colors.deepPurple;
    }
  }

  Color _getIconBgColor(String type) {
    switch (type) {
      case 'alert': return Colors.red.shade50;
      case 'payroll': return Colors.green.shade50;
      case 'hr': return Colors.blue.shade50;
      case 'system': return Colors.orange.shade50;
      default: return Colors.deepPurple.shade50;
    }
  }

  @override
  Widget build(BuildContext context) {
    // If not pushed from router but shown in tab, maybe we don't need appbar back button
    final bool canPop = context.canPop();

    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        automaticallyImplyLeading: canPop,
        title: Text('Kotak Masuk', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all, color: Colors.orange),
            onPressed: _markAllAsRead,
            tooltip: 'Tandai Semua Dibaca',
          )
        ],
      ),
      body: _isLoading && !_isRefreshing
          ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
          : RefreshIndicator(
              onRefresh: () async {
                setState(() => _isRefreshing = true);
                await _fetchNotifications();
              },
              color: AppConstants.primaryColor,
              child: _notifications.isEmpty
                  ? ListView(
                      children: [
                        SizedBox(height: MediaQuery.of(context).size.height * 0.3),
                        const Icon(Icons.mark_email_read_outlined, size: 80, color: Colors.grey),
                        const SizedBox(height: 16),
                        const Center(child: Text('Kotak masuk Anda kosong.', style: TextStyle(color: Colors.grey, fontSize: 16))),
                      ],
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16).copyWith(bottom: 100),
                      itemCount: _notifications.length,
                      itemBuilder: (context, index) {
                        final notif = _notifications[index];
                        final isRead = notif['is_read'] == true;
                        
                        return GestureDetector(
                          onTap: () => _markAsRead(notif['id']),
                          child: AnimatedContainer(
                            duration: const Duration(milliseconds: 300),
                            margin: const EdgeInsets.only(bottom: 12),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: context.surfaceColor,
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: Colors.grey.shade100),
                              boxShadow: isRead ? [] : [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 4))],
                            ),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                if (!isRead)
                                  Container(
                                    width: 8, height: 8,
                                    margin: const EdgeInsets.only(top: 16, right: 8),
                                    decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
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
                                          Expanded(child: Text(notif['title'] ?? '', style: TextStyle(fontSize: 14, fontWeight: isRead ? FontWeight.w600 : FontWeight.bold, color: context.textPrimary))),
                                          Text(
                                            notif['created_at'] != null ? notif['created_at'].toString().substring(0, 10) : '',
                                            style: const TextStyle(fontSize: 10, color: Colors.grey, fontWeight: FontWeight.bold),
                                          )
                                        ],
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        notif['body'] ?? '',
                                        style: TextStyle(fontSize: 13, color: isRead ? Colors.grey : context.textSecondary, height: 1.4),
                                        maxLines: 3,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                )
                              ],
                            ),
                          ),
                        );
                      },
                    ),
            ),
    );
  }
}
