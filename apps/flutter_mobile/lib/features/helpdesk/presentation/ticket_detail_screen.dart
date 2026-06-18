import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import '../../../core/utils/constants.dart';
import 'package:intl/intl.dart';
import '../../../widgets/ios_card.dart';

class TicketDetailScreen extends StatelessWidget {
  final Map<String, dynamic> ticket;

  const TicketDetailScreen({super.key, required this.ticket});

  Color _getStatusColor(String status) {
    if (status.toUpperCase() == 'SELESAI' || status.toUpperCase() == 'RESOLVED') return CupertinoColors.activeGreen;
    if (status.toUpperCase() == 'DIPROSES' || status.toUpperCase() == 'IN_PROGRESS') return CupertinoColors.systemOrange;
    return CupertinoColors.destructiveRed;
  }

  String _getStatusDesc(String status) {
    if (status.toUpperCase() == 'SELESAI' || status.toUpperCase() == 'RESOLVED') return 'Tiket Anda telah diselesaikan oleh tim kami.';
    if (status.toUpperCase() == 'DIPROSES' || status.toUpperCase() == 'IN_PROGRESS') return 'Tim kami sedang memeriksa dan mengerjakan keluhan Anda.';
    return 'Tiket Anda telah diterima dan mengantri untuk diproses oleh tim kami.';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    final dateStr = ticket['date'] ?? (ticket['created_at'] != null ? DateFormat('dd MMM yyyy').format(DateTime.parse(ticket['created_at'])) : '');
    final statusStr = (ticket['status'] ?? 'OPEN').toString().toUpperCase();

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Detail Tiket'),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Padding(
                padding: EdgeInsets.only(left: 16, bottom: 8),
                child: Text('INFORMASI TIKET', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
              ),
              IosCard(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('No. Tiket', style: TextStyle(fontSize: 12, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                        Text(dateStr, style: const TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Hero(
                      tag: 'ticket_id_${ticket['id']}',
                      child: Material(
                        type: MaterialType.transparency,
                        child: Text(ticket['id'].toString(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                      ),
                    ),
                    const SizedBox(height: 16),
                    const Divider(height: 1, color: CupertinoColors.systemGrey4),
                    const SizedBox(height: 16),
                    
                    const Text('Subjek Kendala', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                    const SizedBox(height: 6),
                    Text(ticket['subject'] ?? 'Tanpa Subjek', style: TextStyle(fontSize: 18, fontWeight: FontWeight.w900, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                    
                    const SizedBox(height: 20),
                    const Text('Kategori', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                    const SizedBox(height: 6),
                    Text(ticket['category'] ?? '-', style: TextStyle(fontSize: 14, color: isDark ? CupertinoColors.systemGrey2 : CupertinoColors.black)),
                    
                    const SizedBox(height: 20),
                    const Text('Status Terkini', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: _getStatusColor(statusStr).withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: _getStatusColor(statusStr).withValues(alpha: 0.3)),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            statusStr == 'SELESAI' || statusStr == 'RESOLVED' 
                              ? CupertinoIcons.check_mark_circled_solid 
                              : (statusStr == 'DIPROSES' || statusStr == 'IN_PROGRESS' ? CupertinoIcons.hourglass : CupertinoIcons.clock_fill),
                            color: _getStatusColor(statusStr),
                            size: 32,
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(statusStr, style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: _getStatusColor(statusStr))),
                                const SizedBox(height: 4),
                                Text(_getStatusDesc(statusStr), style: const TextStyle(fontSize: 12, color: CupertinoColors.systemGrey)),
                              ],
                            ),
                          )
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
