import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import '../../../core/utils/constants.dart';
import '../../../widgets/ios_card.dart';

import 'dart:convert';
import 'package:http/http.dart' as http;

// ==========================================
// GAMIFICATION LOGIC (Now using Backend API)
// ==========================================

class LeaderboardEntry {
  final String id;
  final String name;
  final String department;
  final int points;
  final String avatarUrl;

  LeaderboardEntry({
    required this.id,
    required this.name,
    required this.department,
    required this.points,
    required this.avatarUrl,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) {
    return LeaderboardEntry(
      id: json['id'] ?? '',
      name: json['name'] ?? 'Unknown',
      department: json['department'] ?? 'General',
      points: json['points'] ?? 0,
      avatarUrl: json['avatar_url'] ?? json['avatarUrl'] ?? 'https://ui-avatars.com/api/?name=A',
    );
  }
}

class LeaderboardScreen extends StatefulWidget {
  const LeaderboardScreen({super.key});

  @override
  State<LeaderboardScreen> createState() => _LeaderboardScreenState();
}

class _LeaderboardScreenState extends State<LeaderboardScreen> {
  List<LeaderboardEntry> _leaderboard = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadLeaderboard();
  }

  Future<void> _loadLeaderboard() async {
    try {
      final response = await http.get(Uri.parse('${AppConstants.apiUrl}/performance/leaderboard'));
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        if (data['status'] == 'success') {
          final List<dynamic> list = data['data'];
          if (mounted) {
            setState(() {
              _leaderboard = list.map((e) => LeaderboardEntry.fromJson(e)).toList();
              _isLoading = false;
            });
          }
          return;
        }
      }
    } catch (e) {
      debugPrint('Error loading leaderboard: $e');
    }
    
    // Fallback if error
    if (mounted) {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(CupertinoIcons.star_fill, color: CupertinoColors.systemYellow, size: 20),
            SizedBox(width: 8),
            Text('Papan Peringkat'),
          ],
        ),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: _isLoading
          ? const Center(child: CupertinoActivityIndicator(radius: 16))
          : _leaderboard.isEmpty 
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(CupertinoIcons.star_slash_fill, size: 60, color: CupertinoColors.systemGrey.withValues(alpha: 0.5)),
                      const SizedBox(height: 16),
                      const Text('Belum ada data peringkat', style: TextStyle(color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                    ],
                  )
                )
              : CustomScrollView(
                  slivers: [
                    CupertinoSliverRefreshControl(
                      onRefresh: _loadLeaderboard,
                    ),
                    SliverToBoxAdapter(
                      child: _buildTopSection(isDark),
                    ),
                    SliverPadding(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                      sliver: SliverToBoxAdapter(
                        child: _buildListSection(isDark),
                      ),
                    ),
                    const SliverPadding(padding: EdgeInsets.only(bottom: 40)),
                  ],
                ),
      ),
    );
  }

  Widget _buildTopSection(bool isDark) {
    if (_leaderboard.isEmpty) return const SizedBox();

    final first = _leaderboard[0];
    final second = _leaderboard.length > 1 ? _leaderboard[1] : null;
    final third = _leaderboard.length > 2 ? _leaderboard[2] : null;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 16),
      decoration: BoxDecoration(
        color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
        boxShadow: [
          BoxShadow(color: CupertinoColors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 5)),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (_leaderboard.length > 1) _buildPodiumAvatar(second, 2, CupertinoColors.systemGrey, 80, isDark),
          if (_leaderboard.length > 1) const SizedBox(width: 16),
          if (_leaderboard.isNotEmpty) _buildPodiumAvatar(first, 1, CupertinoColors.systemYellow, 110, isDark),
          if (_leaderboard.length > 2) const SizedBox(width: 16),
          if (_leaderboard.length > 2) _buildPodiumAvatar(third, 3, CupertinoColors.activeOrange, 70, isDark), // Bronze approximation
        ],
      ),
    );
  }

  Widget _buildPodiumAvatar(LeaderboardEntry? user, int rank, Color color, double size, bool isDark) {
    if (user == null) return const SizedBox();
    
    final isFirst = rank == 1;

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        if (isFirst)
          const Padding(
            padding: EdgeInsets.only(bottom: 8.0),
            child: Icon(CupertinoIcons.rosette, color: CupertinoColors.systemYellow, size: 36),
          ),
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Container(
              margin: const EdgeInsets.only(bottom: 12),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: color, width: isFirst ? 4 : 3),
                boxShadow: [
                  BoxShadow(color: color.withValues(alpha: 0.3), blurRadius: 15, spreadRadius: 2),
                ],
              ),
              child: ClipOval(
                child: Image.network(
                  user.avatarUrl,
                  width: size,
                  height: size,
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    width: size,
                    height: size,
                    color: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey6,
                    child: Icon(CupertinoIcons.person_fill, color: CupertinoColors.systemGrey, size: size * 0.5),
                  ),
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.white, width: 2),
              ),
              child: Text(
                '#$rank',
                style: const TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          user.name.split(' ')[0],
          style: TextStyle(fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black, fontSize: isFirst ? 16 : 14),
        ),
        Text(
          '${user.points} pts',
          style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildListSection(bool isDark) {
    if (_leaderboard.length <= 3) return const SizedBox();
    
    return IosCard(
      padding: EdgeInsets.zero,
      child: ListView.separated(
        padding: EdgeInsets.zero,
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _leaderboard.length - 3,
        separatorBuilder: (context, index) => const Divider(height: 1, color: CupertinoColors.systemGrey4),
        itemBuilder: (context, index) {
          final rank = index + 4;
          final user = _leaderboard[index + 3];

          return Container(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                SizedBox(
                  width: 30,
                  child: Text(
                    '#$rank',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, fontSize: 16),
                  ),
                ),
                const SizedBox(width: 8),
                ClipOval(
                  child: Image.network(
                    user.avatarUrl,
                    width: 40,
                    height: 40,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Container(
                      width: 40,
                      height: 40,
                      color: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey6,
                      child: const Icon(CupertinoIcons.person_fill, color: CupertinoColors.systemGrey, size: 20),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user.name, style: TextStyle(fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black, fontSize: 15)),
                      const SizedBox(height: 2),
                      Text(user.department, style: const TextStyle(color: CupertinoColors.systemGrey, fontSize: 12)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                  decoration: BoxDecoration(
                    color: AppConstants.primaryColor.withValues(alpha: 0.1),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    '${user.points} pts',
                    style: const TextStyle(fontWeight: FontWeight.bold, color: AppConstants.primaryColor),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
