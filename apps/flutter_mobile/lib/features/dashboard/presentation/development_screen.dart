import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

class DevelopmentScreen extends StatelessWidget {
  final String title;

  const DevelopmentScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: context.backgroundColor,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(icon: Icon(Icons.arrow_back, color: context.textPrimary), onPressed: () => context.pop()),
      ),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 40),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 120, height: 120,
                decoration: BoxDecoration(
                  color: Colors.orange.shade50,
                  shape: BoxShape.circle,
                  boxShadow: [BoxShadow(color: Colors.orange.withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 10))],
                ),
                child: Icon(Icons.handyman_outlined, size: 60, color: Colors.orange),
              ),
              SizedBox(height: 30),
              Text('Fitur Sedang Dikembangkan', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: context.textPrimary), textAlign: TextAlign.center),
              const SizedBox(height: 16),
              RichText(
                textAlign: TextAlign.center,
                text: TextSpan(
                  style: const TextStyle(fontSize: 14, color: Colors.grey, height: 1.5, fontWeight: FontWeight.w600),
                  children: [
                    const TextSpan(text: 'Kami sedang menyiapkan modul '),
                    TextSpan(text: title, style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold)),
                    const TextSpan(text: ' untuk memberikan pengalaman terbaik bagi Anda. Silakan cek kembali dalam waktu dekat!'),
                  ]
                ),
              ),
              const SizedBox(height: 40),
              
              // Progress Bar
              Container(
                width: MediaQuery.of(context).size.width * 0.8,
                height: 8,
                decoration: BoxDecoration(color: context.borderColor, borderRadius: BorderRadius.circular(4)),
                child: FractionallySizedBox(
                  alignment: Alignment.centerLeft,
                  widthFactor: 0.65,
                  child: Container(decoration: BoxDecoration(color: Colors.green, borderRadius: BorderRadius.circular(4))),
                ),
              ),
              const SizedBox(height: 10),
              const Text('Proses Pengembangan: 65%', style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold, fontSize: 11)),
              
              const SizedBox(height: 40),
              ElevatedButton(
                onPressed: () => context.pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppConstants.primaryColor,
                  padding: const EdgeInsets.symmetric(horizontal: 30, vertical: 16),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                  elevation: 8,
                  shadowColor: AppConstants.primaryColor.withValues(alpha: 0.3)
                ),
                child: Text('KEMBALI KE MENU', style: TextStyle(color: context.surfaceColor, fontWeight: FontWeight.w900, letterSpacing: 1)),
              )
            ],
          ),
        ),
      ),
    );
  }
}
