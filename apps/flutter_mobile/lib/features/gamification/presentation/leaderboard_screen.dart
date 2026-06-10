import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

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
      avatarUrl: json['avatarUrl'] ?? 'https://ui-avatars.com/api/?name=A',
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
          setState(() {
            _leaderboard = list.map((e) => LeaderboardEntry.fromJson(e)).toList();
            _isLoading = false;
          });
          return;
        }
      }
    } catch (e) {
      debugPrint('Error loading leaderboard: $e');
    }
    
    // Fallback if error
    setState(() {
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: context.surfaceColor,
        elevation: 0,
        title: Row(
          children: [
            const Icon(Icons.emoji_events, color: Colors.amber, size: 24),
            const SizedBox(width: 8),
            Text('Papan Peringkat', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
          ],
        ),
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: context.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : _leaderboard.isEmpty 
              ? const Center(child: Text('Belum ada data peringkat'))
              : Column(
                  children: [
                    _buildTopSection(),
                    Expanded(
                      child: _buildListSection(),
                    ),
                  ],
                ),
    );
  }

  Widget _buildTopSection() {
    if (_leaderboard.isEmpty) return const SizedBox();

    final first = _leaderboard[0];
    final second = _leaderboard.length > 1 ? _leaderboard[1] : null;
    final third = _leaderboard.length > 2 ? _leaderboard[2] : null;

    return Container(
      padding: const EdgeInsets.symmetric(vertical: 30, horizontal: 16),
      decoration: BoxDecoration(
        color: context.surfaceColor,
        borderRadius: const BorderRadius.only(
          bottomLeft: Radius.circular(30),
          bottomRight: Radius.circular(30),
        ),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 10, offset: const Offset(0, 5)),
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (_leaderboard.length > 1) _buildPodiumAvatar(second, 2, Colors.grey.shade400, 80),
          if (_leaderboard.length > 1) const SizedBox(width: 16),
          if (_leaderboard.isNotEmpty) _buildPodiumAvatar(first, 1, Colors.amber, 110),
          if (_leaderboard.length > 2) const SizedBox(width: 16),
          if (_leaderboard.length > 2) _buildPodiumAvatar(third, 3, const Color(0xFFCD7F32), 70), // Bronze
        ],
      ),
    );
  }

  Widget _buildPodiumAvatar(LeaderboardEntry? user, int rank, Color color, double size) {
    if (user == null) return const SizedBox();
    
    final isFirst = rank == 1;
    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        if (isFirst)
          const Padding(
            padding: EdgeInsets.only(bottom: 8.0),
            child: Icon(Icons.workspace_premium, color: Colors.amber, size: 36),
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
              child: CircleAvatar(
                radius: size / 2,
                backgroundImage: NetworkImage(user.avatarUrl),
                backgroundColor: context.backgroundColor,
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: context.surfaceColor, width: 2),
              ),
              child: Text(
                '#$rank',
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          user.name.split(' ')[0],
          style: TextStyle(fontWeight: FontWeight.bold, color: context.textPrimary, fontSize: isFirst ? 16 : 14),
        ),
        Text(
          '${user.points} pts',
          style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 12),
        ),
      ],
    );
  }

  Widget _buildListSection() {
    if (_leaderboard.length <= 3) return const SizedBox();
    
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _leaderboard.length - 3,
      itemBuilder: (context, index) {
        final rank = index + 4;
        final user = _leaderboard[index + 3];

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: context.surfaceColor,
            borderRadius: BorderRadius.circular(16),
            boxShadow: [
              BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2)),
            ],
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(
                  width: 30,
                  child: Text(
                    '#$rank',
                    style: TextStyle(fontWeight: FontWeight.bold, color: context.textSecondary, fontSize: 16),
                  ),
                ),
                const SizedBox(width: 8),
                CircleAvatar(
                  radius: 20,
                  backgroundImage: NetworkImage(user.avatarUrl),
                ),
              ],
            ),
            title: Text(
              user.name,
              style: TextStyle(fontWeight: FontWeight.bold, color: context.textPrimary),
            ),
            subtitle: Text(
              user.department,
              style: TextStyle(color: context.textSecondary, fontSize: 12),
            ),
            trailing: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: AppConstants.primaryColor.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Text(
                '${user.points} pts',
                style: TextStyle(fontWeight: FontWeight.bold, color: AppConstants.primaryColor),
              ),
            ),
          ),
        );
      },
    );
  }
}
