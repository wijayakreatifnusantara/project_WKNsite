import 'package:flutter/material.dart';
import '../utils/constants.dart';

extension ThemeContext on BuildContext {
  Color get surfaceColor => Theme.of(this).colorScheme.surface;
  Color get backgroundColor => Theme.of(this).scaffoldBackgroundColor;
  Color get textPrimary => Theme.of(this).textTheme.bodyLarge?.color ?? AppConstants.textPrimary;
  Color get textSecondary => Theme.of(this).bottomNavigationBarTheme.unselectedItemColor ?? AppConstants.textSecondary;
  Color get borderColor => Theme.of(this).dividerColor;
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;
}
