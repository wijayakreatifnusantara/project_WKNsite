import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../../core/utils/constants.dart';
import '../../auth/data/auth_provider.dart';
import '../data/profile_service.dart';

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
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Harap isi semua kolom rekening bank.')));
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
        ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Data rekening bank berhasil diperbarui.'), backgroundColor: Colors.green));
        setState(() => _isEditingBank = false);
        _fetchData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Gagal: $e'), backgroundColor: Colors.red));
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
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: AppConstants.backgroundColor,
        body: Center(child: CircularProgressIndicator(color: AppConstants.primaryColor)),
      );
    }

    return Scaffold(
      backgroundColor: AppConstants.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.white,
        title: const Text('Data Pribadi & Rekening', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppConstants.textPrimary)),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: AppConstants.textPrimary),
          onPressed: () => context.pop(),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Status Kepegawaian
            Row(
              children: [
                const Icon(Icons.work_outline, size: 16, color: AppConstants.primaryColor),
                const SizedBox(width: 8),
                const Text('STATUS KEPEGAWAIAN', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
              ],
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))]),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Status Karyawan', style: TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                        decoration: BoxDecoration(color: Colors.green.shade50, borderRadius: BorderRadius.circular(8), border: Border.all(color: Colors.green.shade200)),
                        child: Text(_employeeData?['status'] ?? 'TIDAK DIKETAHUI', style: const TextStyle(color: Colors.green, fontSize: 11, fontWeight: FontWeight.bold)),
                      )
                    ],
                  ),
                  const Divider(height: 24),
                  _buildInfoRow('Masa Kerja', _calculateMasaKerja(_employeeData?['join_date'])),
                  const Divider(height: 24),
                  _buildInfoRow('Tanggal Bergabung', _employeeData?['join_date'] ?? '-'),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Rekening Bank
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(Icons.credit_card, size: 16, color: AppConstants.primaryColor),
                    const SizedBox(width: 8),
                    const Text('REKENING GAJI', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
                  ],
                ),
                if (!_isEditingBank)
                  TextButton(
                    onPressed: () => setState(() => _isEditingBank = true),
                    style: TextButton.styleFrom(backgroundColor: AppConstants.primaryColor.withValues(alpha: 0.1), padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 0), minimumSize: const Size(0, 30)),
                    child: const Text('Edit', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: AppConstants.primaryColor)),
                  )
              ],
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))]),
              child: _isEditingBank ? _buildBankForm() : _buildBankInfo(),
            ),
            const SizedBox(height: 24),

            // NPWP & BPJS
            Row(
              children: [
                const Icon(Icons.shield_outlined, size: 16, color: AppConstants.primaryColor),
                const SizedBox(width: 8),
                const Text('PAJAK & ASURANSI', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 1)),
              ],
            ),
            const SizedBox(height: 10),
            _buildTaxAndInsuranceInfo(),
            
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: const TextStyle(color: Colors.grey, fontSize: 13, fontWeight: FontWeight.w600)),
        Text(value, style: const TextStyle(color: AppConstants.textPrimary, fontSize: 14, fontWeight: FontWeight.bold)),
      ],
    );
  }

  Widget _buildBankInfo() {
    return Column(
      children: [
        _buildInfoRow('Nama Bank', _employeeData?['bank_name'] ?? '-'),
        const Divider(height: 24),
        _buildInfoRow('No. Rekening', _employeeData?['bank_account'] ?? '-'),
        const Divider(height: 24),
        _buildInfoRow('Nama Pemilik', _employeeData?['bank_account_holder'] ?? '-'),
      ],
    );
  }

  Widget _buildTaxAndInsuranceInfo() {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.02), blurRadius: 10, offset: const Offset(0, 4))]),
      child: Column(
        children: [
          _buildInfoRow('NPWP', _employeeData?['npwp'] ?? '-'),
          const Divider(height: 24),
          _buildInfoRow('BPJS Ketenagakerjaan', _employeeData?['bpjs_tk_number'] ?? '-'),
          const Divider(height: 24),
          _buildInfoRow('BPJS Kesehatan', _employeeData?['bpjs_ks_number'] ?? '-'),
        ],
      ),
    );
  }

  Widget _buildBankForm() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('NAMA BANK', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
        const SizedBox(height: 6),
        TextField(
          controller: _bankNameCtrl,
          textCapitalization: TextCapitalization.characters,
          decoration: _inputDecoration('Contoh: BCA, Mandiri, BNI'),
        ),
        const SizedBox(height: 16),
        
        const Text('NOMOR REKENING', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
        const SizedBox(height: 6),
        TextField(
          controller: _bankAccCtrl,
          keyboardType: TextInputType.number,
          decoration: _inputDecoration('Masukkan nomor rekening'),
        ),
        const SizedBox(height: 16),

        const Text('NAMA PEMILIK REKENING', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.grey, letterSpacing: 0.5)),
        const SizedBox(height: 6),
        TextField(
          controller: _bankOwnerCtrl,
          textCapitalization: TextCapitalization.characters,
          decoration: _inputDecoration('Sesuai buku tabungan'),
        ),
        const SizedBox(height: 20),

        Row(
          children: [
            Expanded(
              flex: 1,
              child: TextButton(
                onPressed: () {
                  setState(() {
                    _isEditingBank = false;
                    _bankNameCtrl.text = _employeeData?['bank_name'] ?? '';
                    _bankAccCtrl.text = _employeeData?['bank_account'] ?? '';
                    _bankOwnerCtrl.text = _employeeData?['bank_account_holder'] ?? '';
                  });
                },
                style: TextButton.styleFrom(backgroundColor: Colors.grey.shade100, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(vertical: 16)),
                child: const Text('Batal', style: TextStyle(color: Colors.black54, fontWeight: FontWeight.bold)),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: _isSaving ? null : _handleSaveBank,
                style: ElevatedButton.styleFrom(backgroundColor: AppConstants.primaryColor, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), padding: const EdgeInsets.symmetric(vertical: 16), elevation: 2),
                child: _isSaving 
                  ? const SizedBox(height: 16, width: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                  : const Text('Simpan Perubahan', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              ),
            ),
          ],
        )
      ],
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
      filled: true,
      fillColor: const Color(0xFFF8F9FB),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
      enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.shade300)),
      focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: AppConstants.primaryColor)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
    );
  }
}
