import 'package:flutter/cupertino.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';

class DevelopmentScreen extends StatelessWidget {
  final String title;

  const DevelopmentScreen({super.key, required this.title});

  @override
  Widget build(BuildContext context) {
    final isDark = context.isDarkMode;

    return CupertinoPageScaffold(
      backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.systemGroupedBackground,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: isDark ? CupertinoColors.black : CupertinoColors.white,
        middle: Text(title),
        previousPageTitle: 'Kembali',
      ),
      child: SafeArea(
        child: Center(
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 40),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 120, height: 120,
                  decoration: BoxDecoration(
                    color: CupertinoColors.systemOrange.withValues(alpha: 0.1),
                    shape: BoxShape.circle,
                    boxShadow: [BoxShadow(color: CupertinoColors.systemOrange.withValues(alpha: 0.2), blurRadius: 20, offset: const Offset(0, 10))],
                  ),
                  child: const Icon(CupertinoIcons.hammer_fill, size: 60, color: CupertinoColors.systemOrange),
                ),
                const SizedBox(height: 30),
                Text('Fitur Sedang Dikembangkan', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: isDark ? CupertinoColors.white : CupertinoColors.black), textAlign: TextAlign.center),
                const SizedBox(height: 16),
                RichText(
                  textAlign: TextAlign.center,
                  text: TextSpan(
                    style: const TextStyle(fontSize: 14, color: CupertinoColors.systemGrey, height: 1.5, fontWeight: FontWeight.w600),
                    children: [
                      const TextSpan(text: 'Kami sedang menyiapkan modul '),
                      TextSpan(text: title, style: const TextStyle(color: CupertinoColors.systemOrange, fontWeight: FontWeight.bold)),
                      const TextSpan(text: ' untuk memberikan pengalaman terbaik bagi Anda. Silakan cek kembali dalam waktu dekat!'),
                    ]
                  ),
                ),
                const SizedBox(height: 40),
                
                // Progress Bar
                Container(
                  width: MediaQuery.of(context).size.width * 0.8,
                  height: 8,
                  decoration: BoxDecoration(color: isDark ? CupertinoColors.systemGrey5 : CupertinoColors.systemGrey6, borderRadius: BorderRadius.circular(4)),
                  child: FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: 0.65,
                    child: Container(decoration: BoxDecoration(color: CupertinoColors.activeGreen, borderRadius: BorderRadius.circular(4))),
                  ),
                ),
                const SizedBox(height: 10),
                const Text('Proses Pengembangan: 65%', style: TextStyle(color: CupertinoColors.activeGreen, fontWeight: FontWeight.bold, fontSize: 11)),
                
                const SizedBox(height: 40),
                SizedBox(
                  width: double.infinity,
                  child: CupertinoButton(
                    color: AppConstants.primaryColor,
                    borderRadius: BorderRadius.circular(20),
                    onPressed: () => context.pop(),
                    child: const Text('KEMBALI KE MENU', style: TextStyle(color: CupertinoColors.white, fontWeight: FontWeight.w900, letterSpacing: 1)),
                  ),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }
}
