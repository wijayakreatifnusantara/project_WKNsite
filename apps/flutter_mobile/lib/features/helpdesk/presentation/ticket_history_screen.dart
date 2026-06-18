import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';
import '../../../widgets/ios_card.dart';

class TicketHistoryScreen extends StatefulWidget {
  const TicketHistoryScreen({super.key});

  @override
  State<TicketHistoryScreen> createState() => _TicketHistoryScreenState();
}

class _TicketHistoryScreenState extends State<TicketHistoryScreen> {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _tickets = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchTickets();
  }

  Future<void> _fetchTickets() async {
    try {
      final user = _supabase.auth.currentUser;
      if (user != null) {
        final data = await _supabase
            .from('helpdesk_tickets')
            .select('*')
            .eq('employee_id', user.id)
            .order('created_at', ascending: false);
        
        if (mounted) {
          setState(() {
            _tickets = List<Map<String, dynamic>>.from(data);
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching tickets: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Color _getStatusColor(String status) {
    if (status.toUpperCase() == 'SELESAI' || status.toUpperCase() == 'RESOLVED') return CupertinoColors.activeGreen;
    if (status.toUpperCase() == 'DIPROSES' || status.toUpperCase() == 'IN_PROGRESS') return CupertinoColors.systemOrange;
    return CupertinoColors.destructiveRed;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Riwayat Tiket'),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: _isLoading
          ? _buildSkeletonLoading(isDark)
          : _tickets.isEmpty
            ? _buildEmptyState(isDark)
            : CustomScrollView(
                slivers: [
                  CupertinoSliverRefreshControl(
                    onRefresh: _fetchTickets,
                  ),
                  SliverPadding(
                    padding: const EdgeInsets.all(16),
                    sliver: SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          final ticket = _tickets[index];
                          final date = ticket['created_at'] != null 
                              ? DateFormat('dd MMM yyyy').format(DateTime.parse(ticket['created_at']))
                              : '';
                          return Padding(
                            padding: const EdgeInsets.only(bottom: 16),
                            child: IosCard(
                              padding: const EdgeInsets.all(16),
                              onTap: () => context.push('/helpdesk-detail', extra: ticket),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Hero(
                                        tag: 'ticket_id_${ticket['id']}',
                                        child: Material(
                                          type: MaterialType.transparency,
                                          child: Text(ticket['id'].toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                                        ),
                                      ),
                                      Text(date, style: const TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
                                    ],
                                  ),
                                  const SizedBox(height: 8),
                                  Text(ticket['subject'] ?? 'Tanpa Subjek', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                                  const SizedBox(height: 4),
                                  Text(ticket['category'] ?? '-', style: const TextStyle(fontSize: 13, color: CupertinoColors.systemGrey)),
                                  const SizedBox(height: 12),
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: _getStatusColor(ticket['status'] ?? 'OPEN').withValues(alpha: 0.1),
                                      borderRadius: BorderRadius.circular(8),
                                    ),
                                    child: Text(
                                      (ticket['status'] ?? 'OPEN').toString().toUpperCase(),
                                      style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: _getStatusColor(ticket['status'] ?? 'OPEN')),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                        childCount: _tickets.length,
                      ),
                    ),
                  ),
                ],
              ),
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
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(width: 60, height: 12, color: CupertinoColors.white),
                      Container(width: 80, height: 10, color: CupertinoColors.white),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(width: double.infinity, height: 16, color: CupertinoColors.white),
                  const SizedBox(height: 8),
                  Container(width: 120, height: 12, color: CupertinoColors.white),
                  const SizedBox(height: 16),
                  Container(width: 70, height: 20, decoration: BoxDecoration(color: CupertinoColors.white, borderRadius: BorderRadius.circular(8))),
                ],
              ),
            ),
          ),
        );
      },
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
            child: Icon(CupertinoIcons.person_2_alt, size: 64, color: AppConstants.primaryColor.withValues(alpha: 0.8)),
          ),
          const SizedBox(height: 24),
          Text('Belum Ada Tiket', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
          const SizedBox(height: 8),
          const Text('Riwayat keluhan atau permintaan bantuan\nAnda akan tampil di sini', textAlign: TextAlign.center, style: TextStyle(color: CupertinoColors.systemGrey, fontSize: 13, height: 1.5)),
        ],
      ),
    );
  }
}
