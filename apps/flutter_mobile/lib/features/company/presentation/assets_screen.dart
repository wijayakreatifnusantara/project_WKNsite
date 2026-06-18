import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';
import 'package:go_router/go_router.dart';
import '../../../core/utils/constants.dart';
import '../../../core/widgets/animated_tap_button.dart';
import 'package:provider/provider.dart';
import '../../../core/theme/theme_provider.dart';
import 'package:flutter/services.dart';

class AssetsScreen extends StatelessWidget {
  const AssetsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final hapticEnabled = context.watch<ThemeProvider>().hapticEnabled;

    return CupertinoPageScaffold(
      backgroundColor: context.backgroundColor,
      navigationBar: CupertinoNavigationBar(
        backgroundColor: context.surfaceColor,
        middle: Text('Aset Perusahaan', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: context.textPrimary)),
        leading: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () => context.pop(),
          child: const Icon(CupertinoIcons.back),
        ),
        trailing: CupertinoButton(
          padding: EdgeInsets.zero,
          onPressed: () {
            if (hapticEnabled) HapticFeedback.lightImpact();
          },
          child: const Icon(CupertinoIcons.qrcode_viewfinder, color: AppConstants.primaryColor),
        ),
      ),
      child: SafeArea(
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            CupertinoSliverRefreshControl(
              onRefresh: () async {
                if (hapticEnabled) HapticFeedback.mediumImpact();
                await Future.delayed(const Duration(seconds: 1)); // Mock refresh
              },
            ),
            SliverPadding(
              padding: const EdgeInsets.all(16),
              sliver: SliverToBoxAdapter(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 50),
                      child: Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(color: CupertinoColors.activeBlue.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(16), border: Border.all(color: CupertinoColors.activeBlue.withValues(alpha: 0.2))),
                        child: Row(
                          children: [
                            const Icon(CupertinoIcons.info_circle, color: CupertinoColors.activeBlue),
                            const SizedBox(width: 12),
                            const Expanded(child: Text('Berikut adalah daftar aset perusahaan yang dipinjamkan atau menjadi tanggung jawab Anda saat ini.', style: TextStyle(fontSize: 12, color: CupertinoColors.activeBlue))),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                    
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 100),
                      child: const Text('ASET AKTIF', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: CupertinoColors.systemGrey, letterSpacing: 1)),
                    ),
                    const SizedBox(height: 12),
                    
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 150),
                      child: _buildAssetItem(
                        context,
                        name: 'MacBook Pro M2 14"',
                        assetCode: 'WKN-AST-IT-0012',
                        dateAssigned: '15 Jan 2024',
                        status: 'Kondisi Baik',
                        icon: CupertinoIcons.device_laptop
                      ),
                    ),
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 200),
                      child: _buildAssetItem(
                        context,
                        name: 'Monitor LG 27"',
                        assetCode: 'WKN-AST-IT-0089',
                        dateAssigned: '15 Jan 2024',
                        status: 'Kondisi Baik',
                        icon: CupertinoIcons.tv
                      ),
                    ),
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 250),
                      child: _buildAssetItem(
                        context,
                        name: 'ID Card & Access Key',
                        assetCode: 'WKN-AST-HR-0442',
                        dateAssigned: '10 Jan 2024',
                        status: 'Kondisi Baik',
                        icon: CupertinoIcons.person_crop_rectangle
                      ),
                    ),
                    
                    const SizedBox(height: 30),
                    FadeSlideIn(
                      delay: const Duration(milliseconds: 300),
                      child: AnimatedTapButton(
                        onTap: () {
                          if (hapticEnabled) HapticFeedback.selectionClick();
                        },
                        scaleDown: 0.95,
                        child: Container(
                          width: double.infinity,
                          height: 50,
                          decoration: BoxDecoration(
                            border: Border.all(color: CupertinoColors.destructiveRed),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(CupertinoIcons.exclamationmark_triangle, color: CupertinoColors.destructiveRed, size: 20),
                              SizedBox(width: 8),
                              Text('LAPORKAN MASALAH ASET', style: TextStyle(color: CupertinoColors.destructiveRed, fontWeight: FontWeight.bold)),
                            ],
                          ),
                        ),
                      ),
                    )
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildAssetItem(BuildContext context, {required String name, required String assetCode, required String dateAssigned, required String status, required IconData icon}) {
    return AnimatedCard(
      onTap: () {},
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: context.surfaceColor, borderRadius: BorderRadius.circular(16), boxShadow: [BoxShadow(color: CupertinoColors.black.withValues(alpha: 0.02), blurRadius: 8, offset: const Offset(0, 2))]),
        child: Row(
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              decoration: BoxDecoration(color: Theme.of(context).colorScheme.surfaceContainerHighest, borderRadius: BorderRadius.circular(12)),
              child: Icon(icon, color: CupertinoColors.systemGrey, size: 28),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(name, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: context.textPrimary)),
                  const SizedBox(height: 4),
                  Text(assetCode, style: const TextStyle(fontSize: 11, color: CupertinoColors.systemGrey, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text('Diterima: $dateAssigned', style: const TextStyle(fontSize: 10, color: CupertinoColors.systemGrey)),
                      Container(
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                        decoration: BoxDecoration(color: CupertinoColors.activeGreen.withValues(alpha: 0.1), borderRadius: BorderRadius.circular(4)),
                        child: Text(status, style: const TextStyle(fontSize: 9, fontWeight: FontWeight.bold, color: CupertinoColors.activeGreen)),
                      )
                    ],
                  )
                ],
              ),
            )
          ],
        ),
      ),
    );
  }
}
