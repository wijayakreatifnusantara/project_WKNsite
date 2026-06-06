import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

class AppConstants {
  // Supabase Configuration
  static String get supabaseUrl => dotenv.env['SUPABASE_URL'] ?? '';
  static String get supabaseAnonKey => dotenv.env['SUPABASE_ANON_KEY'] ?? '';

  // App Colors (WKN Theme)
  static const Color primaryColor = Color(0xFFF97316); // Orange
  static const Color secondaryColor = Color(0xFFE31E24); // Red
  static const Color backgroundColor = Color(0xFFF8FAFC); // Slate-50
  static const Color darkBackground = Color(0xFF0F172A);
  static const Color textPrimary = Color(0xFF1E293B); // Slate-800
  static const Color textSecondary = Color(0xFF64748B); // Slate-500
  
  // Premium Clean Theme Constants
  static const Color slate50 = Color(0xFFF8FAFC);
  static const Color slate100 = Color(0xFFF1F5F9);
  static const Color slate200 = Color(0xFFE2E8F0);
  static const Color slate300 = Color(0xFFCBD5E1);
  static const Color slate400 = Color(0xFF94A3B8);
  static const Color slate500 = Color(0xFF64748B);
  static const Color slate600 = Color(0xFF475569);
  static const Color slate700 = Color(0xFF334155);
  static const Color slate800 = Color(0xFF1E293B);
  static const Color slate900 = Color(0xFF0F172A);
  
  static final List<BoxShadow> flatShadow = [
    BoxShadow(color: const Color(0xFF0F172A).withValues(alpha: 0.05), blurRadius: 4, offset: const Offset(0, 2)),
  ];

  // Backend API
  static String get apiUrl {
    if (kIsWeb) return dotenv.env['API_URL_DEFAULT'] ?? '';
    if (Platform.isWindows) return dotenv.env['API_URL_DEFAULT'] ?? '';
    if (Platform.isAndroid) return dotenv.env['API_URL_ANDROID'] ?? '';
    return dotenv.env['API_URL_DEFAULT'] ?? '';
  }
}
