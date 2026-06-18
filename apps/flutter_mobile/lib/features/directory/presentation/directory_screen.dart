import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/utils/constants.dart';
import '../../../core/widgets/cached_avatar.dart';
import '../../../widgets/ios_card.dart';

class DirectoryScreen extends StatefulWidget {
  const DirectoryScreen({super.key});

  @override
  State<DirectoryScreen> createState() => _DirectoryScreenState();
}

class _DirectoryScreenState extends State<DirectoryScreen> {
  final _supabase = Supabase.instance.client;
  final TextEditingController _searchCtrl = TextEditingController();
  
  List<dynamic> _employees = [];
  List<dynamic> _filteredEmployees = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchEmployees();
    _searchCtrl.addListener(_onSearchChanged);
  }

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchEmployees() async {
    setState(() => _isLoading = true);
    try {
      final data = await _supabase
          .from('employees')
          .select('id, name, job_position, department_id, email, phone, avatar_url, departments(name)')
          .order('name', ascending: true);
          
      if (mounted) {
        setState(() {
          _employees = data;
          _filteredEmployees = data;
        });
      }
    } catch (e) {
      debugPrint('Error fetching directory: $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  void _onSearchChanged() {
    final query = _searchCtrl.text.toLowerCase();
    setState(() {
      _filteredEmployees = _employees.where((emp) {
        final name = (emp['name'] ?? '').toString().toLowerCase();
        final position = (emp['job_position'] ?? '').toString().toLowerCase();
        final department = (emp['departments']?['name'] ?? '').toString().toLowerCase();
        
        return name.contains(query) || position.contains(query) || department.contains(query);
      }).toList();
    });
  }

  Future<void> _handleWhatsApp(String? phone) async {
    if (phone == null || phone.isEmpty) return;
    final cleanPhone = phone.replaceAll(RegExp(r'[^0-9]'), '');
    final url = Uri.parse('whatsapp://send?phone=$cleanPhone');
    
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    } else {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('WhatsApp tidak terinstal'), backgroundColor: CupertinoColors.destructiveRed));
    }
  }

  Future<void> _handleCall(String? phone) async {
    if (phone == null || phone.isEmpty) return;
    final url = Uri.parse('tel:$phone');
    if (await canLaunchUrl(url)) {
      await launchUrl(url);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Direktori Karyawan'),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: Column(
          children: [
            // Search Bar
            Padding(
              padding: const EdgeInsets.all(16),
              child: CupertinoSearchTextField(
                controller: _searchCtrl,
                placeholder: 'Cari nama, jabatan, divisi...',
                style: TextStyle(color: isDark ? CupertinoColors.white : CupertinoColors.black),
              ),
            ),

            // List
            Expanded(
              child: _isLoading
                ? const Center(child: CupertinoActivityIndicator(radius: 16))
                : _filteredEmployees.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(CupertinoIcons.person_3_fill, size: 60, color: CupertinoColors.systemGrey.withValues(alpha: 0.5)),
                          const SizedBox(height: 16),
                          const Text('Tidak ada karyawan ditemukan', style: TextStyle(color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold)),
                        ],
                      )
                    )
                  : CustomScrollView(
                      slivers: [
                        CupertinoSliverRefreshControl(
                          onRefresh: _fetchEmployees,
                        ),
                        SliverPadding(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          sliver: SliverToBoxAdapter(
                            child: IosCard(
                              padding: EdgeInsets.zero,
                              child: ListView.separated(
                                padding: EdgeInsets.zero,
                                shrinkWrap: true,
                                physics: const NeverScrollableScrollPhysics(),
                                itemCount: _filteredEmployees.length,
                                separatorBuilder: (context, index) => const Divider(height: 1, color: CupertinoColors.systemGrey4),
                                itemBuilder: (context, index) {
                                  final emp = _filteredEmployees[index];
                                  return _buildEmployeeCard(emp, isDark);
                                },
                              ),
                            ),
                          ),
                        ),
                        const SliverPadding(padding: EdgeInsets.only(bottom: 40)),
                      ],
                    ),
            )
          ],
        ),
      ),
    );
  }

  Widget _buildEmployeeCard(Map<String, dynamic> emp, bool isDark) {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          // Avatar
          CachedAvatar(
            imageUrl: emp['avatar_url'],
            name: emp['name'] ?? 'User',
            radius: 24,
            fontSize: 18,
            backgroundColor: isDark ? CupertinoColors.darkBackgroundGray : CupertinoColors.systemGrey6,
          ),
          const SizedBox(width: 12),
          
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(emp['name'] ?? '', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: isDark ? CupertinoColors.white : CupertinoColors.black)),
                const SizedBox(height: 2),
                Text(emp['job_position'] ?? 'Staff', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppConstants.primaryColor)),
                const SizedBox(height: 2),
                Text(emp['departments']?['name'] ?? 'Wijaya KN', style: const TextStyle(fontSize: 11, color: CupertinoColors.systemGrey)),
              ],
            ),
          ),
          
          // Actions
          Row(
            children: [
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () => _handleWhatsApp(emp['phone']),
                child: Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(color: CupertinoColors.activeGreen.withValues(alpha: 0.1), shape: BoxShape.circle),
                  child: const Icon(CupertinoIcons.chat_bubble_text_fill, size: 18, color: CupertinoColors.activeGreen),
                ),
              ),
              const SizedBox(width: 8),
              CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () => _handleCall(emp['phone']),
                child: Container(
                  width: 36, height: 36,
                  decoration: BoxDecoration(color: CupertinoColors.activeBlue.withValues(alpha: 0.1), shape: BoxShape.circle),
                  child: const Icon(CupertinoIcons.phone_fill, size: 18, color: CupertinoColors.activeBlue),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
