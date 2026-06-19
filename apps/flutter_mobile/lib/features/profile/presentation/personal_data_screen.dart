import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:provider/provider.dart';
import '../../auth/data/auth_provider.dart';
import '../data/profile_service.dart';
import '../../../widgets/ios_card.dart';

class PersonalDataScreen extends StatefulWidget {
  const PersonalDataScreen({super.key});

  @override
  State<PersonalDataScreen> createState() => _PersonalDataScreenState();
}

class _PersonalDataScreenState extends State<PersonalDataScreen> {
  final ProfileService _profileService = ProfileService();
  bool _isLoading = true;
  bool _isSaving = false;
  bool _isEditingBank = false;
  
  Map<String, dynamic>? _employeeData;

  final TextEditingController _bankNameCtrl = TextEditingController();
  final TextEditingController _bankAccCtrl = TextEditingController();
  final TextEditingController _bankOwnerCtrl = TextEditingController();

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _fetchData();
    });
  }

  @override
  void dispose() {
    _bankNameCtrl.dispose();
    _bankAccCtrl.dispose();
    _bankOwnerCtrl.dispose();
    super.dispose();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final user = context.read<AuthProvider>().userData;
      if (user != null) {
        final data = await _profileService.getEmployeeData(user['id']);
        if (mounted && data != null) {
          setState(() {
            _employeeData = data;
            _bankNameCtrl.text = data['bank_name'] ?? '';
            _bankAccCtrl.text = data['bank_account'] ?? '';
            _bankOwnerCtrl.text = data['bank_account_holder'] ?? '';
          });
        }
      }
    } catch (e) {
      debugPrint('Error fetching personal data: $e');
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _handleSaveBank() async {
    if (_bankNameCtrl.text.isEmpty || _bankAccCtrl.text.isEmpty || _bankOwnerCtrl.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Harap isi semua kolom rekening bank.'), backgroundColor: CupertinoColors.destructiveRed));
      return;
    }

    setState(() => _isSaving = true);
    try {
      await _profileService.updateBankAccount(
        _employeeData!['id'], 
        _bankNameCtrl.text, 
        _bankAccCtrl.text, 
        _bankOwnerCtrl.text
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Data rekening bank berhasil diperbarui.'), backgroundColor: CupertinoColors.activeGreen));
        setState(() => _isEditingBank = false);
        _fetchData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e'), backgroundColor: CupertinoColors.destructiveRed));
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  String _calculateMasaKerja(String? joinDate) {
    if (joinDate == null) return 'Belum ada data';
    final start = DateTime.tryParse(joinDate);
    if (start == null) return '-';
    
    final now = DateTime.now();
    int years = now.year - start.year;
    int months = now.month - start.month;
    
    if (months < 0) {
      years--;
      months += 12;
    }
    
    if (years == 0) return '$months Bulan';
    if (months == 0) return '$years Tahun';
    return '$years Tahun $months Bulan';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    if (_isLoading) {
      return CupertinoPageScaffold(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
        navigationBar: CupertinoNavigationBar(
          backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
          middle: const Text('Data Pribadi'),
        ),
        child: const Center(child: CupertinoActivityIndicator(radius: 16)),
      );
    }

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: const Text('Data Pribadi'),
        previousPageTitle: 'Verifikasi',
      ),
      child: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Status Kepegawaian
              _buildSectionTitle('STATUS KEPEGAWAIAN'),
              IosCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const Text('Status Karyawan', style: TextStyle(color: CupertinoColors.systemGrey, fontSize: 13, fontWeight: FontWeight.w600)),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                          decoration: BoxDecoration(color: CupertinoColors.activeGreen.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(8)),
                          child: Text(_employeeData?['status'] ?? 'TIDAK DIKETAHUI', style: const TextStyle(color: CupertinoColors.activeGreen, fontSize: 11, fontWeight: FontWeight.bold)),
                        )
                      ],
                    ),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: CupertinoColors.systemGrey4)),
                    _buildInfoRow('Masa Kerja', _calculateMasaKerja(_employeeData?['join_date']), isDark),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: CupertinoColors.systemGrey4)),
                    _buildInfoRow('Tanggal Bergabung', _employeeData?['join_date'] ?? '-', isDark),
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Rekening Bank
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  _buildSectionTitle('REKENING GAJI'),
                  if (!_isEditingBank)
                    CupertinoButton(
                      padding: EdgeInsets.zero,
                      onPressed: () => setState(() => _isEditingBank = true), minimumSize: Size(0, 0),
                      child: const Text('Edit', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.activeBlue)),
                    )
                ],
              ),
              IosCard(
                padding: const EdgeInsets.all(16),
                child: _isEditingBank ? _buildBankForm(isDark) : _buildBankInfo(isDark),
              ),
              const SizedBox(height: 24),

              // NPWP & BPJS
              _buildSectionTitle('PAJAK & ASURANSI'),
              IosCard(
                padding: const EdgeInsets.all(16),
                child: Column(
                  children: [
                    _buildInfoRow('NPWP', _employeeData?['npwp'] ?? '-', isDark),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: CupertinoColors.systemGrey4)),
                    _buildInfoRow('BPJS Ketenagakerjaan', _employeeData?['bpjs_tk_number'] ?? '-', isDark),
                    const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: CupertinoColors.systemGrey4)),
                    _buildInfoRow('BPJS Kesehatan', _employeeData?['bpjs_ks_number'] ?? '-', isDark),
                  ],
                ),
              ),
              const SizedBox(height: 40),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(left: 16, bottom: 8),
      child: Text(title, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 0.5)),
    );
  }

  Widget _buildInfoRow(String label, String value, bool isDark) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: CupertinoColors.systemGrey, fontSize: 13, fontWeight: FontWeight.w600)),
        Text(value, style: TextStyle(color: isDark ? CupertinoColors.white : CupertinoColors.black, fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildBankInfo(bool isDark) {
    return Column(
      children: [
        _buildInfoRow('Nama Bank', _employeeData?['bank_name'] ?? '-', isDark),
        const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: CupertinoColors.systemGrey4)),
        _buildInfoRow('No. Rekening', _employeeData?['bank_account'] ?? '-', isDark),
        const Padding(padding: EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: CupertinoColors.systemGrey4)),
        _buildInfoRow('Nama Pemilik', _employeeData?['bank_account_holder'] ?? '-', isDark),
      ],
    );
  }

  Widget _buildBankForm(bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('NAMA BANK', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
        const SizedBox(height: 6),
        CupertinoTextField(
          controller: _bankNameCtrl,
          textCapitalization: TextCapitalization.characters,
          placeholder: 'Contoh: BCA, Mandiri, BNI',
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6, borderRadius: BorderRadius.circular(8)),
        ),
        const SizedBox(height: 16),
        
        const Text('NOMOR REKENING', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
        const SizedBox(height: 6),
        CupertinoTextField(
          controller: _bankAccCtrl,
          keyboardType: TextInputType.number,
          placeholder: 'Masukkan nomor rekening',
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6, borderRadius: BorderRadius.circular(8)),
        ),
        const SizedBox(height: 16),

        const Text('NAMA PEMILIK REKENING', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey)),
        const SizedBox(height: 6),
        CupertinoTextField(
          controller: _bankOwnerCtrl,
          textCapitalization: TextCapitalization.characters,
          placeholder: 'Sesuai buku tabungan',
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(color: isDark ? CupertinoColors.black : CupertinoColors.systemGrey6, borderRadius: BorderRadius.circular(8)),
        ),
        const SizedBox(height: 20),

        Row(
          children: [
            Expanded(
              flex: 1,
              child: CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: () {
                  setState(() {
                    _isEditingBank = false;
                    _bankNameCtrl.text = _employeeData?['bank_name'] ?? '';
                    _bankAccCtrl.text = _employeeData?['bank_account'] ?? '';
                    _bankOwnerCtrl.text = _employeeData?['bank_account_holder'] ?? '';
                  });
                },
                color: CupertinoColors.systemGrey5,
                child: const Text('Batal', style: TextStyle(color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              flex: 2,
              child: CupertinoButton(
                padding: EdgeInsets.zero,
                onPressed: _isSaving ? null : _handleSaveBank,
                color: CupertinoColors.activeBlue,
                child: _isSaving 
                  ? const CupertinoActivityIndicator(color: CupertinoColors.white)
                  : const Text('Simpan Perubahan', style: TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.bold, fontSize: 14)),
              ),
            ),
          ],
        )
      ],
    );
  }
}
