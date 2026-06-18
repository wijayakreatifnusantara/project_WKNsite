import 'package:flutter/cupertino.dart';
import 'package:flutter/material.dart';
import '../../../core/theme/theme_extension.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return CupertinoPageScaffold(
      backgroundColor: context.backgroundColor,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.asset(
              'assets/wkn_logo.png',
              width: 100,
              height: 100,
              fit: BoxFit.contain,
              errorBuilder: (context, error, stackTrace) => const Icon(
                CupertinoIcons.building_2_fill,
                size: 100,
                color: Color(0xFFE31E24),
              ),
            ),
            const SizedBox(height: 24),
            const CupertinoActivityIndicator(
              color: Color(0xFFE31E24),
              radius: 14,
            ),
          ],
        ),
      ),
    );
  }
}
