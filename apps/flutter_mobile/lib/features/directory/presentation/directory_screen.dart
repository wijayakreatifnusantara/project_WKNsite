import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../core/utils/constants.dart';

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
  bool _isRefreshing = false;

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
    try {
      final data = await _supabase
          .from('employees')
          .select('id, name, job_position, department_id, email, phone, departments(name)')
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
        setState(() {
          _isLoading = false;
          _isRefreshing = false;
        });
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
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('WhatsApp tidak terinstal')));
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
    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Direktori Karyawan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppConstants.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: Column(
        children: [
          // Search Bar
          Container(
            padding: const EdgeInsets.fromLTRB(20, 10, 20, 20),
            color: AppConstants.backgroundColor,
            child: Container(
              height: 54,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(18),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.03), blurRadius: 10, offset: const Offset(0, 2))],
              ),
              child: Row(
                children: [
                  const Icon(Icons.search, color: Colors.grey),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextField(
                      controller: _searchCtrl,
                      decoration: const InputDecoration(
                        hintText: 'Cari nama, jabatan, atau divisi...',
                        hintStyle: TextStyle(color: Colors.grey, fontSize: 14),
                        border: InputBorder.none,
                      ),
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppConstants.textPrimary),
                    ),
                  ),
                  if (_searchCtrl.text.isNotEmpty)
                    IconButton(
                      icon: const Icon(Icons.cancel, color: Colors.grey, size: 18),
                      onPressed: () => _searchCtrl.clear(),
                    )
                ],
              ),
            ),
          ),

          // List
          Expanded(
            child: _isLoading && !_isRefreshing
              ? const Center(child: CircularProgressIndicator(color: AppConstants.primaryColor))
              : _filteredEmployees.isEmpty
                ? const Center(child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.people_outline, size: 60, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('Tidak ada karyawan ditemukan', style: TextStyle(color: Colors.grey, fontWeight: FontWeight.w600)),
                    ],
                  ))
                : RefreshIndicator(
                    onRefresh: () async {
                      setState(() => _isRefreshing = true);
                      await _fetchEmployees();
                    },
                    color: AppConstants.primaryColor,
                    child: ListView.builder(
                      padding: const EdgeInsets.all(20).copyWith(top: 0, bottom: 100),
                      itemCount: _filteredEmployees.length,
                      itemBuilder: (context, index) {
                        final emp = _filteredEmployees[index];
                        return _buildEmployeeCard(emp);
                      },
                    ),
                  ),
          )
        ],
      ),
    );
  }

  Widget _buildEmployeeCard(Map<String, dynamic> emp) {
    return Container(
      margin: const EdgeInsets.only(bottom: 15),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(22),
        boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 15, offset: const Offset(0, 4))],
      ),
      child: Row(
        children: [
          // Avatar
          Container(
            width: 54, height: 54,
            decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(27)),
            child: Center(
              child: Text(emp['name'].toString().substring(0, 1).toUpperCase(), style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: AppConstants.primaryColor)),
            ),
          ),
          const SizedBox(width: 15),
          
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(emp['name'] ?? '', style: const TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppConstants.textPrimary)),
                const SizedBox(height: 2),
                Text(emp['job_position'] ?? 'Staff', style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                const SizedBox(height: 4),
                Row(
                  children: [
                    const Icon(Icons.business, size: 12, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(emp['departments']?['name'] ?? 'Wijaya KN', style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: Colors.grey)),
                  ],
                )
              ],
            ),
          ),
          
          // Actions
          Row(
            children: [
              _buildActionBtn(Icons.message, Colors.green, () => _handleWhatsApp(emp['phone'])),
              const SizedBox(width: 10),
              _buildActionBtn(Icons.call, Colors.blue, () => _handleCall(emp['phone'])),
            ],
          )
        ],
      ),
    );
  }

  Widget _buildActionBtn(IconData icon, Color color, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        width: 40, height: 40,
        decoration: BoxDecoration(color: color.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(14)),
        child: Icon(icon, size: 18, color: color),
      ),
    );
  }
}
