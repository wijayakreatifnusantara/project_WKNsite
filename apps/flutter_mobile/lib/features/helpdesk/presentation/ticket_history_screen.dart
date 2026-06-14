import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:intl/intl.dart';
import 'package:shimmer/shimmer.dart';

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
    if (status.toUpperCase() == 'SELESAI' || status.toUpperCase() == 'RESOLVED') return Colors.green;
    if (status.toUpperCase() == 'DIPROSES' || status.toUpperCase() == 'IN_PROGRESS') return Colors.orange;
    return Colors.red;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        title: Text('Riwayat Tiket', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
      ),
      body: _isLoading
        ? _buildSkeletonLoading()
        : _tickets.isEmpty
          ? _buildEmptyState()
          : RefreshIndicator(
              onRefresh: _fetchTickets,
              child: ListView.separated(
                padding: const EdgeInsets.all(16),
                itemCount: _tickets.length,
                separatorBuilder: (context, index) => const SizedBox(height: 12),
                itemBuilder: (context, index) {
                  final ticket = _tickets[index];
                  final date = ticket['created_at'] != null 
                      ? DateFormat('dd MMM yyyy').format(DateTime.parse(ticket['created_at']))
                      : '';
                  return InkWell(
                    onTap: () {
                      context.push('/helpdesk-detail', extra: ticket);
                    },
                    borderRadius: BorderRadius.circular(16),
                    child: Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: context.surfaceColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: context.borderColor),
                        boxShadow: [
                          BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))
                        ]
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(ticket['id'].toString(), style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                              Text(date, style: const TextStyle(fontSize: 12, color: Colors.grey)),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(ticket['subject'] ?? 'Tanpa Subjek', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: context.textPrimary)),
                          const SizedBox(height: 4),
                          Text(ticket['category'] ?? '-', style: TextStyle(fontSize: 13, color: context.textSecondary)),
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
              ),
            ),
    );
  }

  Widget _buildSkeletonLoading() {
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: 5,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, index) {
        return Container(
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
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Container(width: 60, height: 12, color: Colors.white),
                    Container(width: 80, height: 10, color: Colors.white),
                  ],
                ),
                const SizedBox(height: 12),
                Container(width: double.infinity, height: 16, color: Colors.white),
                const SizedBox(height: 8),
                Container(width: 120, height: 12, color: Colors.white),
                const SizedBox(height: 16),
                Container(width: 70, height: 20, decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8))),
              ],
            ),
          ),
        );
      },
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
            child: Icon(Icons.support_agent_outlined, size: 64, color: AppConstants.primaryColor.withValues(alpha: 0.8)),
          ),
          const SizedBox(height: 24),
          Text('Belum Ada Tiket', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: context.textPrimary)),
          const SizedBox(height: 8),
          Text('Riwayat keluhan atau permintaan bantuan\nAnda akan tampil di sini', textAlign: TextAlign.center, style: TextStyle(color: context.textSecondary, fontSize: 13, height: 1.5)),
        ],
      ),
    );
  }
}
